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
    maxResults=30
)
response = request.execute()





# Iterate through each video in the response
for item in response['items']:
    video_id = item['id']['videoId']  # Get the videoId of the current video
    all_comments = []  # List to store all comments
    try:
        # Initial request to retrieve comment threads
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,  # Maximum number of results per page (adjust as needed)
            textFormat="plainText"
        )
        response = request.execute()
        for item in response['items']:
            comment = item['snippet']['topLevelComment']['snippet']
        print(len(response['items']))
    except:
        pass