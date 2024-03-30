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
            'ExpressionAttributeValues': dict()
        }
        
        filter_expressions_unparsed = []
        
        # Add source to query
        if platform:
            if not platform.lower() in ['twitter', 'youtube', 'reddit']:
                raise ValueError(f"There is no stored data on the given platform, \"{platform}\". There is stored data on these platforms: Twitter, YouTube, and Reddit.")
            filter_expressions_unparsed.append("platform = :platform")
            query_params['ExpressionAttributeValues'][':platform'] = platform
        
        # Extract date parameters
        from_date_str = None
        from_datetime_obj = None
        to_date_str = None
        to_datetime_obj = None

        if date_range_from:
            from_datetime_obj = datetime.strptime(date_range_from, "%Y-%m-%d")
            from_date_str = from_datetime_obj.strftime('%Y-%m-%d')
            # Validity check
            latest_datapoint_datetime = datetime(2022, 1, 18) # value of latest date from the csv files
            if not from_datetime_obj < latest_datapoint_datetime:
                raise ValueError(f"The start date must come before the latest stored entry ({latest_datapoint_datetime.strftime('%Y-%m-%d')}); {from_date_str} does not come before {latest_datapoint_datetime.strftime('%Y-%m-%d')}.")

        if date_range_to:
            to_datetime_obj = datetime.strptime(date_range_to, "%Y-%m-%d")
            to_date_str = to_datetime_obj.strftime('%Y-%m-%d')
            # Validity check
            earliest_datapoint_datetime = datetime(2020, 4, 19) # value of earliest date from the csv files
            if not earliest_datapoint_datetime < to_datetime_obj:
                raise ValueError(f"The end date must come after the earliest stored entry ({earliest_datapoint_datetime.strftime('%Y-%m-%d')}); {to_date_str} does not come after {earliest_datapoint_datetime.strftime('%Y-%m-%d')}.")
            
        #  Add valid date parameters to the search query
        if date_range_from and date_range_to:
            # Validity check
            if not from_datetime_obj < to_datetime_obj:
                raise ValueError(f"The start date must come before the end date; {from_date_str} does not come before {to_date_str}.")
            filter_expressions_unparsed.append("comment_date BETWEEN :from_date AND :to_date")
            query_params['ExpressionAttributeValues'][":from_date"] = from_date_str
            query_params['ExpressionAttributeValues'][":to_date"] = to_date_str
        
        elif date_range_from:
            filter_expressions_unparsed.append("comment_date >= :from_date")
            query_params['ExpressionAttributeValues'][":from_date"] = from_date_str
    
        elif date_range_to:
            filter_expressions_unparsed.append("comment_date <= :to_date")
            query_params['ExpressionAttributeValues'][":to_date"] = to_date_str
        
        # combine each expression into a single expression
        if filter_expressions_unparsed:
            query_params['FilterExpression'] = ' AND '.join(filter_expressions_unparsed)

        # Retrieve dynamodb response from query with applied limit       
        if 'FilterExpression' in query_params:
            response = table.scan(Limit=limit, **query_params)
        else:
            response = table.scan(Limit=limit)
            
        return {
            'statusCode': 200,
            'body': json.dumps(response['Items'])
        }
            
    except Exception as e:
        if isinstance(e, ValueError):
            # return a custom error message to help the user
            return {
                'statusCode': 400, # Bad Request
                'body': str(e)
            }
        else:
            # return the raised exception message to help with debugging
            return {
                'statusCode': 500, # Internal Server Error
                'body': "Exception raised: " + repr(e)
            }
