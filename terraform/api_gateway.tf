# /************************

# API Gateway Code Structure

# Main API Gateway (sa_api_gateway)
#     /sentiments
#         GET
#             headers: {
#                 "source" (OPTIONAL): Filter source of the sentiment (i.e. twitter, reddit, youtube)
#                 "sentiment" (OPTIONAL): Filter by sentiment (POSITIVE/NEGATIVE/NEUTRAL/MIXED)
#             }

# ************************/

# /*
#     Main API Gateway
# */
# resource "aws_api_gateway_rest_api" "sa_api_gateway" {
#   name        = "sa_api_gateway"
#   description = "SWEN 514 Sentiment Analysis API Gateway"
# }

# /*
#     /sentiments ENDPOINT
# */
# resource "aws_api_gateway_resource" "sa_endpoint_sentiments" {
#   rest_api_id = aws_api_gateway_rest_api.sa_api_gateway.id
#   parent_id   = aws_api_gateway_rest_api.sa_api_gateway.root_resource_id
#   path_part   = "sentiments"
# }

# // sentiments GET
# resource "aws_api_gateway_method" "sa_endpoint_sentiments_get" {
#   rest_api_id   = aws_api_gateway_rest_api.sa_api_gateway.id
#   resource_id   = aws_api_gateway_resource.sa_endpoint_sentiments.id
#   http_method   = "GET"
#   authorization = "NONE"
# }

# // sentiments GET - Invoke Lambda function
# resource "aws_api_gateway_integration" "lambda" {
#   rest_api_id = aws_api_gateway_rest_api.sa_api_gateway.id
#   resource_id = aws_api_gateway_resource.sa_endpoint_sentiments.id
#   http_method = aws_api_gateway_method.sa_endpoint_sentiments_get.http_method

#   integration_http_method = "POST"
#   type                    = "AWS_PROXY"

#   uri = aws_lambda_function.example.invoke_arn
# }
