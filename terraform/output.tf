output "aws_api_gateway_invoke_url" {
  value = aws_api_gateway_deployment.sa_api_gateway_deployment.invoke_url
} 

output "amplify_deployment_url" {
  value = "https://${var.region}.console.aws.amazon.com/amplify/home?region=${var.region}#/"
}
output "api_key" {
  value = aws_api_gateway_api_key.sa_api_gateway_key.value
  sensitive = true
}