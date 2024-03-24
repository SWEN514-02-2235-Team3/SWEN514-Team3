import boto3
import logging

# boto3 S3 initialization
s3_client = boto3.client("s3")
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
   # event contains all information about uploaded object
   print("Event :", event)

   # Bucket Name where file was uploaded
   source_bucket_name = event['Records'][0]['s3']['bucket']['name']

   # Filename of object (with path)
   file_key_name = event['Records'][0]['s3']['object']['key']
   
   logger.info(source_bucket_name)
   logger.info(file_key_name)