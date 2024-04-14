

resource "aws_cognito_user_pool" "my_user_pool" {
  name = "sa_user_pool"

  password_policy {
    minimum_length    = 8 
    # require_lowercase = true
    # require_numbers   = true
    # require_symbols   = true
    # require_uppercase = true
    // Add at another point for more security ?
  }
    # environment_variables = {
    #     ENV = "dev"
    #     USER_POOL_ID = "${}" # API Gateway URL
        
    # }
    
  
}
resource "aws_cognito_user_pool_client" "my_app_client" {
  name         = "sa_app_client"
  user_pool_id = aws_cognito_user_pool.my_user_pool.id
  
  // Specify other configurations like callback URLs for your app
  // Note: Ensure "generate_secret" is set to false for SPA/Web clients

  
}
