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
  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway ]
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
  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway ]

}


// API gateway deployment stage
resource "aws_api_gateway_deployment" "sa_api_gateway_deployment" {
  depends_on    = [aws_api_gateway_integration.lambda, aws_api_gateway_rest_api.sa_api_gateway]
  rest_api_id   = aws_api_gateway_rest_api.sa_api_gateway.id
  stage_name    = "dev"
  description   = "Development Stage"
  
}

// sentiments GET - Invoke Lambda function (integration request)
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id             = aws_api_gateway_resource.sentiments_resource.id
  http_method             = aws_api_gateway_method.get_sentiments_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY" 

  uri                     = aws_lambda_function.get_sentiments.invoke_arn # Saranya's lambda function
  credentials             = aws_iam_role.sa_api_gateway_role.arn
  request_parameters = {
    "integration.request.querystring.source"        = "method.request.querystring.source" # source = method.request.querystring.source
    "integration.request.querystring.limit"         = "method.request.querystring.limit"
    "integration.request.header.date_range_from"    = "method.request.header.date_range_from"
    "integration.request.header.date_range_to"      = "method.request.header.date_range_to"
  }

  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway, aws_api_gateway_method.get_sentiments_method, aws_api_gateway_resource.sentiments_resource ]
}

// sentiments GET - Integration response
resource "aws_api_gateway_integration_response" "lambda_response_200" {
  rest_api_id          = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id          = aws_api_gateway_resource.sentiments_resource.id
  http_method          = aws_api_gateway_method.get_sentiments_method.http_method
  status_code          = "200"
  response_templates = {
    "application/json" = ""
  }

  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway, aws_api_gateway_integration.lambda ]
}

// sentiments GET - Method response
resource "aws_api_gateway_method_response" "get_sentiments_method_response_200" {
  rest_api_id = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id = aws_api_gateway_resource.sentiments_resource.id
  http_method = aws_api_gateway_method.get_sentiments_method.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Content-Type" = true
  }

  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway, aws_api_gateway_integration.lambda ]
}

/*
    API GATEWAY PERMISSIONS
*/

// IAM Role
resource "aws_iam_role" "sa_api_gateway_role" {
  name               = "sa_api_gateway_role"
  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }]
  })

  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway ]
}

// IAM Policy - Invoke Lambda
resource "aws_iam_policy" "sa_api_gateway_lambda_policy" {
  name   = "api_gateway_lambda_policy"
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": aws_lambda_function.get_sentiments.arn
    }]
  })

  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway ]
}

// Attach Policy to API Gateway
resource "aws_iam_role_policy_attachment" "sa_api_gateway_lambda_policy_attachment" {
  policy_arn = aws_iam_policy.sa_api_gateway_lambda_policy.arn
  role       = aws_iam_role.sa_api_gateway_role.name

  depends_on = [ aws_api_gateway_rest_api.sa_api_gateway ]
}

/*
    Enable CORS if needed
*/

