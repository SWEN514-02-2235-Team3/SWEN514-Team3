import json
import sys
import boto3
import random
import string
from boto3.dynamodb.conditions import Key, Attr
from datetime import datetime


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SentAnalysisDataResults')

def lambda_handler(event, context):
    
    operation = event.get('operation')
    
    if operation == 'GET':
        try:
            sentiments = get_sentiments(event)
            return {
                'statusCode': 200,
                'body': sentiments
            }
        except Exception as e:
            print("Error:", e)
            return {
                'statusCode': 500,
                'body': str(e)
            }
    
    
def get_sentiments(event):
    # Extract limit from event if present, default to 50 if not
    query_limit = int(event.get("limit", 50))
    query_scope = event.get("scope")
    from_date_str = event.get("from_date")
    to_date_str = event.get("to_date")
    
    filter_expression = None
    
    if from_date_str and to_date_str:
        from_date = datetime.strptime(from_date_str, "%Y-%m-%d").strftime('%Y-%m-%d')
        to_date = datetime.strptime(to_date_str, "%Y-%m-%d").strftime('%Y-%m-%d')
        filter_expression = Key('comment_date').between(from_date, to_date)
    elif from_date_str:
        from_date = datetime.strptime(from_date_str, "%Y-%m-%d").strftime('%Y-%m-%d')
        filter_expression = Key('comment_date').gte(from_date)
    elif to_date_str:
        to_date = datetime.strptime(to_date_str, "%Y-%m-%d").strftime('%Y-%m-%d')
        filter_expression = Key('comment_date').lte(to_date)
    
    # Construct query parameters
    query_params = {
        'Limit': query_limit
    }
    
    if query_scope:
        query_params['FilterExpression'] = Key('source').eq(query_scope)
    
    if filter_expression:
        if 'FilterExpression' in query_params:
            query_params['FilterExpression'] = query_params['FilterExpression'] & filter_expression
        else:
            query_params['FilterExpression'] = filter_expression
    
    response = table.scan(**query_params)
    
    items = response['Items']
    # for item in items:
    #     print(item)
    return items
    