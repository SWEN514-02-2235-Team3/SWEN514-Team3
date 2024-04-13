import json
import os
import googleapiclient.discovery
from datetime import datetime
import boto3
import botocore.exceptions

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

    # Optional Params
    region = query_string.get('region') if query_string.get('region') else None
    max_results = query_string.get('max_results') if query_string.get('max_results') else None

    if query_string.get('date_from'):
        date_from_str = query_string.get('date_from')
        date_from = datetime.strptime(date_from_str, "%Y-%m-%d").isoformat() + "Z"
    else:
        date_from = None

    if query_string.get('date_to'):
        date_to_str = query_string.get('date_to')
        date_to = datetime.strptime(date_to_str, "%Y-%m-%d").isoformat() + "Z"
    else:
        date_to = None

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
        maxResults=max_results,
        publishedBefore=date_to,
        publishedAfter=date_from
    )
    response = request.execute()

    # Parse Response
    items = response['items']
    info = []
    region = {'region' : response['regionCode']}
    info.append(region)

    for each in items:

        video_id = each['id']['videoId']
        
        snippet = each['snippet']
        title = snippet['title']
        publish_date = snippet['publishedAt']
        description = snippet['description']
        comment = title + description

        try:
        # Check if the item exists in the DynamoDB table
        response = dynamodb.get_item(
            TableName=table_name,
            Key={
                'id': {'S': id_to_check}  # Assuming 'id' is the primary key of type string
            }
        )
        # If the item exists, return True
        if 'Item' in response:
            existing = False
            sentiment = response['Item'].get('sentiment', {}).get('S')
            if sentiment:
                return sentiment
            else:
                return "Sentiment not found for ID: {}".format(id_to_check)
        else:
            existing = True
            sentiment = comprehend_client.detect_sentiment(Text=comment, LanguageCode='en')['Sentiment'] # Generate Sentiment
            print("Item Already Exists in Table")

        item = {
            'id': video_id,
            'comment': comment,
            'publish_date': publish_date,
            'sentiment': sentiment
        }
        info.append(item)

        if not existing:
            for _ in range(3):
                try:
                    put_record(video_id, publish_date, comment, sentiment)
                    break # break the loop 
                except botocore.exceptions.ClientError: # dont process dataset
                    print(f"WARNING: Couldn't upload {item} to dynamodb...")

    return info

def put_record(video_id, publish_date, comment, sentiment):
    # Generate a non-blocking UUID and insert record to dynamodb
    dynamodb_client.put_item(
        TableName="SentAnalysisDataResults",
        Item={
            'id': {'S':video_id}, # set a random id
            'comment_date': {'S': publish_date},
            'comment': {'S': comment},
            'sentiment': {'S' : sentiment},
            'platform': {'S': 'youtube_live'},
        }
    ) 