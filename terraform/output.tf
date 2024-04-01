output "aws_api_gateway_invoke_url" {
  value = aws_api_gateway_deployment.sa_api_gateway_deployment.invoke_url
} 