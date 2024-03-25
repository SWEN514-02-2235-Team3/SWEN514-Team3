import boto3
import botocore.exceptions

# Boto Setup
dynamodb_client = boto3.client("dynamodb")

# Lambda trigger
def handler(event, context):
    pass