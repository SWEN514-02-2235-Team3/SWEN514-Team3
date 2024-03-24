import boto3
import logging
import csv
import io
# Setup
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Boto Setup
s3_client = boto3.client("s3")
comprehend_client = boto3.client("comprehend")
dynamodb_client = boto3.client("dynamodb")

# Lambda trigger
def handler(event, context):
    bucket_source = event['Records'][0]['s3']['bucket']['name'] # Bucket Name where file was uploaded
    dataset_filename = event['Records'][0]['s3']['object']['key'] # Filename of object (with path)
    
    # Debug print
    to_print = f"RECIEVED DATASET `{dataset_filename}` FROM BUCKET `{bucket_source}`"
    print("-" * len(to_print))
    print(to_print)
    print("-" * len(to_print))
   
   # Parse through file
    file = s3_client.get_object(Bucket=bucket_source, Key=dataset_filename) # get file from s3 bucket
    content = file['Body'].read().decode('utf-8') # read contents
    reader = csv.reader(io.StringIO(content)) # pass into csv reader
    
    i = 0 # mostly for debugging
    for row in reader:
            #   For each line in file:
            #       Get comment from csv file
            #       Analyze text data using sentiment analysis
            #       Extract the sentiment
            #       Store results in DymanoDB
        
        
        print(row)
        i+=1
        
        if (i >= 10):
            break
        
       