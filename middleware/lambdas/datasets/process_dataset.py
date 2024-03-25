import boto3
import csv
import io
from dateutil.parser import parse
import uuid
import botocore.exceptions

# Boto Setup
s3_client = boto3.client("s3")
comprehend_client = boto3.client("comprehend")
dynamodb_client = boto3.client("dynamodb")

# Lambda trigger
def handler(event, context):
    bucket_source = event['Records'][0]['s3']['bucket']['name'] # Bucket Name where file was uploaded
    dataset_filename = event['Records'][0]['s3']['object']['key'] # Filename of object (with path)
    dataset_category = dataset_filename.split("/")[0] # assuming the dataset was stored in a folder (i.e. reddit, facebook, twitter)
    
    # Debug print
    to_print = f"RECIEVED DATASET `{dataset_filename}` FROM BUCKET `{bucket_source}`"
    print("-" * len(to_print))
    print(to_print)
    print("-" * len(to_print))
   
   # Parse through file
    file = s3_client.get_object(Bucket=bucket_source, Key=dataset_filename) # get file from s3 bucket
    content = file['Body'].read().decode('utf-8') # read contents
    reader = csv.reader(io.StringIO(content)) # pass into csv reader
    next(reader) # skip header
    
    # iterate through the dataset (assuming the dataset has been edited to include these columns in order: date, comment)
    for row in reader:
        date = row[0]
        comment = row[1]
        
        # error handling
        if not comment: continue # if there is no text data, continue to the next row
        try: # parse date
            date = parse(date, fuzzy=True)
            date = str(date)[:10]
        except: continue # skip if its not a valid date
        
        sentiment = comprehend_client.detect_sentiment(Text=comment, LanguageCode='en')['Sentiment'] # positive, negative, or neutral        
        
        retry_attempts = 0
        # Generate a non-blocking UUID and insert record to dynamodb
        while True:
            try:
                if retry_attempts > 3: break # stop trying to process a uuid
                dynamodb_client.put_item(
                    TableName="SentAnalysisDataResults",
                    Item={
                        'id': {'S': str(uuid.uuid4())}, # set a random id
                        'comment_date': {'S': date},
                        'comment': {'S': comment},
                        'sentiment': {'S' : sentiment},
                        'source': {'S': dataset_category},
                    }
                )
                break
            except botocore.exceptions.ClientError:
                retry_attempts+=1
                continue # try again until there is no collisions
        
        if retry_attempts > 3: continue # continue to the next row if we can't generate a uuid for some reason
        
        print(f"[{date}][{dataset_category}] {sentiment}: {comment}")   
       