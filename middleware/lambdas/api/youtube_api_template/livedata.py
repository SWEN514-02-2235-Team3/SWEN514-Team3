import json

# -*- coding: utf-8 -*-

# Sample Python code for youtube.search.list
# See instructions for running these code samples locally:
# https://developers.google.com/explorer-help/code-samples#python

import os
import googleapiclient.discovery
from datetime import datetime

# Your API key
api_key = "AIzaSyBwar2tkCtOhYkkQngj6qTZuvSnyU6GuM0"

def lambda_handler(event, context):

    # API service details
    api_service_name = "youtube"
    api_version = "v3"
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    region = event.get('region') if event.get('region') else None
    max_results = event.get('max_results') if event.get('max_results') else None

    if event.get('date_from'):
        date_from_str = event.get('date_from')
        date_from = datetime.strptime(date_from_str, "%Y-%m-%d").isoformat() + "Z"
    else:
        date_from = None

    if event.get('date_to'):
        date_to_str = event.get('date_to')
        date_to = datetime.strptime(date_to_str, "%Y-%m-%d").isoformat() + "Z"
    else:
        date_to = None

    print(f"[DEBUG] date_from: {date_from}")
    print(f"[DEBUG] date_to: {date_to}")

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

    items = response['items']
    info = []
    region = {'region' : response['regionCode']}
    info.append(region)

    for each in items:
        snippet = each['snippet']
        title = snippet['title']
        publish_time = snippet['publishTime']
        description = snippet['description']
        item = {
            'title': title,
            'publish_time': publish_time,
            'description': description
        }
        info.append(item)

    return info