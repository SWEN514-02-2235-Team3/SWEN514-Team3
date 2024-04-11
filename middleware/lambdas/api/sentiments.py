import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SentAnalysisDataResults')
    
def lambda_handler(event, context):
    """GET sentiments/ endpoint lambda
    """
    print(event)
    # get the parameters
    parameters_query = event.get("queryStringParameters", {})    
    limit = None
    platform = None
    date_range_from = None
    date_range_to = None
    # extract parameters
    try:
        limit = int(parameters_query.get("limit"))
    except: pass
    try:
        platform = parameters_query.get("platform").strip()
    except: pass
    try:
        date_range_from = parameters_query.get("date_range_from").strip()
    except: pass
    try:
        date_range_to = parameters_query.get("date_range_to").strip()
    except: pass
    print(f"limit (query): {limit}")
    print(f"platform (query): {platform}")
    print(f"date_range_from (query): {date_range_from}")
    print(f"date_range_to (query): {date_range_to}")
    
    # dynamodb query parameters
    query_params = {
        'ExpressionAttributeValues': dict()
    }
    
    filter_expressions_unparsed = []
    
    # Add source to query
    if platform:
        filter_expressions_unparsed.append("platform = :platform")
        query_params['ExpressionAttributeValues'][':platform'] = platform
        
    # Extract date parameters and add them to the search query
    if date_range_from and date_range_to:
        from_date = datetime.strptime(date_range_from, "%Y-%m-%d").strftime('%Y-%m-%d')
        to_date = datetime.strptime(date_range_to, "%Y-%m-%d").strftime('%Y-%m-%d')

        filter_expressions_unparsed.append("comment_date BETWEEN :from_date AND :to_date")
        query_params['ExpressionAttributeValues'][":from_date"] = from_date
        query_params['ExpressionAttributeValues'][":to_date"] = to_date
    
    elif date_range_from:
        from_date = datetime.strptime(date_range_from, "%Y-%m-%d").strftime('%Y-%m-%d')

        filter_expressions_unparsed.append("comment_date >= :from_date")
        query_params['ExpressionAttributeValues'][":from_date"] = from_date

    elif date_range_to:
        to_date = datetime.strptime(date_range_to, "%Y-%m-%d").strftime('%Y-%m-%d')

        filter_expressions_unparsed.append("comment_date <= :to_date")
        query_params['ExpressionAttributeValues'][":to_date"] = to_date
    
    # combine each expression into a single expression
    if filter_expressions_unparsed:
        query_params['FilterExpression'] = ' AND '.join(filter_expressions_unparsed)
    else: # if there are no paramaters then we don't need this anymore
        query_params.pop("ExpressionAttributeValues")
    
    # retrieve dynamodb response from scan       
    response = table.scan(**query_params)['Items']
    if response:
        response = sorted(response, key=lambda x: x.get('comment_date'), reverse=True)
        if limit:
            response = response[:limit]
        
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            "Access-Control-Allow-Origin": "*",# Required for CORS support to work
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        'body': json.dumps(response)
    }