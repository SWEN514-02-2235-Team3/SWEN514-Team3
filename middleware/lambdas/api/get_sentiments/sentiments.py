import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SentAnalysisDataResults')
requests_table = dynamodb.Table('UserRequests')  # Assuming you have another table to store user requests

def lambda_handler(event, context):
    """PUT sentiments/ endpoint lambda
    """
    print(event)
    body = json.loads(event.get("body", "{}"))

    # get the parameters
    limit = body.get("limit", 30)  # Use default limit of 30 if not specified
    platform = body.get("platform")
    date_range_from = body.get("date_range_from")
    date_range_to = body.get("date_range_to", datetime.now().strftime('%Y-%m-%d'))  # Default to today if not specified
    user_id = body.get("userID", None)  # User ID is optional

    query_params = {
        'ExpressionAttributeValues': {},
         'FilterExpression': ""
    }
    filter_expressions = []

    # Build the filter expression for DynamoDB query
    if platform:
        filter_expressions.append("platform = :platform")
        query_params['ExpressionAttributeValues'][':platform'] = platform

    if date_range_from and date_range_to:
        filter_expressions.append("comment_date BETWEEN :from_date AND :to_date")
        query_params['ExpressionAttributeValues'][":from_date"] = datetime.strptime(date_range_from, "%Y-%m-%d").strftime('%Y-%m-%d')
        query_params['ExpressionAttributeValues'][":to_date"] = datetime.strptime(date_range_to, "%Y-%m-%d").strftime('%Y-%m-%d')

    elif date_range_from:
        filter_expressions.append("comment_date >= :from_date")
        query_params['ExpressionAttributeValues'][":from_date"] = datetime.strptime(date_range_from, "%Y-%m-%d").strftime('%Y-%m-%d')

    elif date_range_to:
        filter_expressions.append("comment_date <= :to_date")
        query_params['ExpressionAttributeValues'][":to_date"] = datetime.strptime(date_range_to, "%Y-%m-%d").strftime('%Y-%m-%d')

    if filter_expressions:
        query_params['FilterExpression'] = ' AND '.join(filter_expressions)

    # Execute the query
    response = table.scan(**query_params)['Items']
    if response:
        response = sorted(response, key=lambda x: x.get('comment_date'), reverse=True)
        response = response[:int(limit)]  # Apply limit

    # Save the request details if userID is provided
    if user_id:
        save_request(user_id, body)

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Origin': "*",  # Required for CORS support to work
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
        },
        'body': json.dumps(response)
    }


def save_request(user_id, parameters):
    """Save the request parameters for a given user"""
    requests_table.put_item(
        Item={
            'userID': user_id,
            'parameters': parameters
        }
    )
    print(f"Request saved for userID: {user_id}")