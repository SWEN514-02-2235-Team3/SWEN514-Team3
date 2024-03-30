/************************

API Gateway Code Structure

Main API Gateway (sa_api_gateway)
    GET sentiments/
        Query Parameter:
        source (str OPTIONAL): Filter by source (i.e. facebook, twitter).
            > If no input is provided then it checks all sources
        limit (str default=30): Limit on how many records to
            > If no input is provided then the default is 30

        Request Body:
        date_range_from (default=None): Start filter
            > If no input is provided then it checks from the earliest record
        date_range_to (default=now): End filter
            > now is at the time of request

************************/

/*
    Main API Gateway
*/
resource "aws_api_gateway_rest_api" "sa_api_gateway" {
  name        = "sa_api_gateway"
  description = "SWEN 514 Sentiment Analysis API Gateway"
}

// sentiments/ endpoint
resource "aws_api_gateway_resource" "sentiments_resource" {
  rest_api_id = aws_api_gateway_rest_api.sa_api_gateway.id
  parent_id   = aws_api_gateway_rest_api.sa_api_gateway.root_resource_id
  path_part   = "sentiments"
}

// GET sentiments/ (method request)
resource "aws_api_gateway_method" "get_sentiments_method" {
  rest_api_id   = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id   = aws_api_gateway_resource.sentiments_resource.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.querystring.source"     = false,
    "method.request.querystring.limit"      = false,
    "method.request.header.date_range_from" = false,
    "method.request.header.date_range_to"   = false
  }

}


// API gateway deployment stage
resource "aws_api_gateway_deployment" "sa_api_gateway_deployment" {
  depends_on    = [aws_api_gateway_integration.lambda]
  rest_api_id   = aws_api_gateway_rest_api.sa_api_gateway.id
  stage_name    = "dev"
  description   = "Development Stage"
}

// sentiments GET - Invoke Lambda function (integration request)
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id             = aws_api_gateway_resource.sentiments_resource.id
  http_method             = aws_api_gateway_method.get_sentiments_method.http_method

  integration_http_method = "GET"
  type                    = "AWS_PROXY"

  uri                     = aws_lambda_function.get_sentiments.invoke_arn # Saranya's lambda function

  request_parameters = {
    "integration.request.querystring.source"        = "method.request.querystring.source" # source = method.request.querystring.source
    "integration.request.querystring.limit"         = "method.request.querystring.limit"
    "integration.request.header.date_range_from"    = "method.request.header.date_range_from"
    "integration.request.header.date_range_to"      = "method.request.header.date_range_to"
  }

}