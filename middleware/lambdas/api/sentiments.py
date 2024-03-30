import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SentAnalysisDataResults')
    
def lambda_handler(event, context):
    """GET sentiments/ endpoint lambda
    """
    try:
        # get the parameters
        parameters_query = event.get("queryStringParameters", {})
        parameters_header = event.get("headers", {})
        
        # extract parameters
        limit = int(parameters_query.get("limit", 50)) # default limit to 50 if source is not present
        platform = parameters_query.get("platform", "").strip()
        date_range_from = parameters_header.get("date_range_from", "").strip()
        date_range_to = parameters_header.get("date_range_to", "").strip()
        
        # dynamodb query parameters
        query_params = {
            'Limit': limit,
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
        response = table.scan(**query_params)
            
        return {
            'statusCode': 200,
            'body': json.dumps(response['Items'])
        }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': repr(e)
        }
        