import json
import os
import googleapiclient.discovery
from datetime import datetime
import boto3
import botocore.exceptions
from dateutil.parser import parse
import random
import uuid

# Your API key
api_key = "AIzaSyBwar2tkCtOhYkkQngj6qTZuvSnyU6GuM0"
comprehend_client = boto3.client("comprehend")
dynamodb_client = boto3.client("dynamodb")

def lambda_handler(event, context):

    # API service details
    api_service_name = "youtube"
    api_version = "v3"
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    query_string = event.get("queryStringParameters", {})
    region = "US"
    max_results = 1
    date_from_str = None
    date_to_str = None
    
    date_from = None
    date_to = None
    
    generated_sentiments = 0
    videos_analyzed = 0
    
    try:
        max_results = int(query_string.get("max_results"))
        if max_results > 10: max_results = 10
    except: 
        pass
    try:
        region = query_string.get("region").strip()
    except: pass
    try:
        date_from_str = query_string.get("date_from").strip()
    except: pass
    try:
        date_to_str = query_string.get("date_to").strip()
    except: pass

    if date_from_str:
        date_from = datetime.strptime(date_from_str, "%Y-%m-%d").isoformat() + "Z"

    if date_to_str:
        date_to = datetime.strptime(date_to_str, "%Y-%m-%d").isoformat() + "Z"

    # Build the YouTube API client using API key
    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=api_key)

    request = youtube.search().list(
        part="snippet",
        order="title",
        q="covid-19",
        regionCode=region,
        type="video",
        videoType="any",
        videoSyndicated="true",  # Ensure the video allows comments by checking if it's syndicated
        maxResults=100,
        publishedBefore=date_to,
        publishedAfter=date_from
    )

    response = request.execute()

    # Parse Response
    items = sorted(response['items'], key=lambda x: random.random())[:max_results]
    info = []
    region = {'region' : response['regionCode']}
    info.append(region)

    for each in items:
        video_id = each['id']['videoId']
        videos_analyzed+=1;        
        
        try:
            # Check if the item exists in the DynamoDB table
            response = dynamodb_client.get_item(
                TableName="SentAnalysisDataResults",
                Key={
                    'video_id': {'S': video_id}  # Assuming 'id' is the primary key of type string
                }
            )
        except botocore.exceptions.ClientError: # most likely no records in database
            response = dict()
        if 'Item' in response:
            sentiment = response['Item'].get('sentiment', {}).get('S')
            if sentiment: 
                print("Youtube comment already processed")
                videos_analyzed-=1
                continue # go onto the next item if we've already processed that youtube url
        else:
            print("PROCESSING YOUTUBE COMMENT")        
            # Initial request to retrieve comment threads
            request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=100, 
                textFormat="plainText"
            )
            
            response = request.execute()
            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
                comment_date = item['snippet']['topLevelComment']['snippet']['publishedAt']
                date = None
                try: # parse date
                    date = parse(comment_date, fuzzy=True)
                    date = str(date)[:10]
                except: continue # skip if its not a valid date
                
                sentiment = comprehend_client.detect_sentiment(Text=comment, LanguageCode='en')['Sentiment'] # Generate Sentiment
                print(f"[{date}] {sentiment} - {comment}")
                
                # Generate a non-blocking UUID and insert record to dynamodb
                for _ in range(3):
                    try:
                        dynamodb_client.put_item(
                            TableName="SentAnalysisDataResults",
                            Item={
                                'id': {'S': str(uuid.uuid4())}, # set a random id
                                'comment_date': {'S': comment_date},
                                'comment': {'S': comment},
                                'sentiment': {'S' : sentiment},
                                'platform': {'S': 'youtube_live'},
                                'video_id': {'S': video_id}
                            }
                        ) 
                        generated_sentiments+=1
                        break
                    except botocore.exceptions.ClientError: # dont process dataset
                        print(f"WARNING: Couldn't upload [{date}] {sentiment} - {comment} to dynamodb...")
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            "Access-Control-Allow-Origin": "*",# Required for CORS support to work
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        'body': json.dumps({
            'videos_found': len(items),
            'videos_analyzed': videos_analyzed,
            'comments_analyzed': generated_sentiments
        })
    }