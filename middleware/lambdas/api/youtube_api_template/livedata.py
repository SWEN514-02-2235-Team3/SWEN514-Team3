import json

# -*- coding: utf-8 -*-

# Sample Python code for youtube.search.list
# See instructions for running these code samples locally:
# https://developers.google.com/explorer-help/code-samples#python

import os

import googleapiclient.discovery

# Your API key
api_key = "AIzaSyBwar2tkCtOhYkkQngj6qTZuvSnyU6GuM0"

def lambda_handler(event, context):

    # API service details
    api_service_name = "youtube"
    api_version = "v3"
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    region = event.get('region') if event.get('region') else None

    # Build the YouTube API client using API key
    youtube = googleapiclient.discovery.build(
        api_service_name, api_version, developerKey=api_key)

    request = youtube.search().list(
        part="snippet",
        order="title",
        q="covid-19",
        regionCode=region,
        type="video",
        videoType="any"
    )
    response = request.execute()
    # print(f"[DEBUG] response: {response}")

    items = response['items']
    info = []
    region = {'region' : response['regionCode']}
    info.append(region)

    for each in items:
        snippet = each['snippet']
        title = snippet['title']
        publish_time = snippet['publishTime']
        item = {
            'title': title,
            'publish_time': publish_time
        }
        info.append(item)

    return info