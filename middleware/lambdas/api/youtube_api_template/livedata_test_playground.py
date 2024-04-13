import googleapiclient.discovery
import os

api_key = "AIzaSyBwar2tkCtOhYkkQngj6qTZuvSnyU6GuM0"
api_service_name = "youtube"
api_version = "v3"
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
# Build the YouTube API client using API key
youtube = googleapiclient.discovery.build(
    api_service_name, api_version, developerKey=api_key)

request = youtube.search().list(
    part="snippet",
    order="title",
    q="covid-19",
    regionCode="US",
    type="video",
    relevanceLanguage="en",
    videoType="any",
)
response = request.execute()





# Iterate through each video in the response
for item in response['items']:
    video_id = item['id']['videoId']  # Get the videoId of the current video
    all_comments = []  # List to store all comments
    
    # Initial request to retrieve comment threads
    request = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=100,  # Maximum number of results per page (adjust as needed)
        textFormat="plainText",
        hl="en"
    )
    response = request.execute()
    for item in response['items']:
        comment = item['snippet']['topLevelComment']['snippet']
        print(comment)
    # # Keep making requests until all comments are retrieved
    # while request:
    #     response = request.execute()

    #     # Iterate through each comment thread
    #     for item in response['items']:
    #         comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
    #         all_comments.append(comment)

    #     # Check if there are more pages of comments to retrieve
    #     if 'nextPageToken' in response:
    #         request = youtube.commentThreads().list(
    #             part="snippet",
    #             videoId=video_id,
    #             maxResults=100,
    #             pageToken=response['nextPageToken'],
    #             textFormat="plainText"
    #         )
    #     else:
    #         break  # Exit loop if no more pages
    # print(len(all_comments))