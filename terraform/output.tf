output "aws_api_gateway_invoke_url" {
  value = aws_api_gateway_deployment.sa_api_gateway_deployment.invoke_url
} 

output "amplify_deployment_url" {
  value = "https://${var.region}.console.aws.amazon.com/amplify/home?region=${var.region}#/"
}


output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.main.id
}