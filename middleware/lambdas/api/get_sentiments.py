import boto3
import botocore.exceptions
import json

# Boto Setup
dynamodb_client = boto3.client("dynamodb")


def handler(event, context):
    """Lambda handler function to process API request
    """
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
