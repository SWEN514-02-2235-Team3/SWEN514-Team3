/************************

API Gateway Code Structure

Main API Gateway (sa_api_gateway)
    /sentiments
        GET
            headers: {
                "source" (OPTIONAL): Filter source of the sentiment (i.e. twitter, reddit, youtube)
                "sentiment" (OPTIONAL): Filter by sentiment (POSITIVE/NEGATIVE/NEUTRAL/MIXED)
            }

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

// GET sentiments/
resource "aws_api_gateway_method" "get_sentiments_method" {
  rest_api_id   = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id   = aws_api_gateway_resource.sentiments_resource.id
  http_method   = "GET"
  authorization = "NONE"
}


// API gateway deployment stage
resource "aws_api_gateway_deployment" "sa_api_gateway_deployment" {
  depends_on    = [aws_api_gateway_integration.lambda]
  rest_api_id   = aws_api_gateway_rest_api.sa_api_gateway.id
  stage_name    = "dev"
  description   = "Development Stage"
}

// sentiments GET - Invoke Lambda function  
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = aws_api_gateway_rest_api.sa_api_gateway.id
  resource_id             = aws_api_gateway_resource.sentiments_resource.id
  http_method             = aws_api_gateway_method.get_sentiments_method.http_method

  integration_http_method = "GET"
  type                    = "AWS_PROXY"

  uri                     = aws_lambda_function.get_sentiments.invoke_arn # Saranya's lambda function
}
