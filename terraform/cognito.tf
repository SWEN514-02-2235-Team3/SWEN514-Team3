

resource "aws_cognito_user_pool" "main" {
  name = "SA_UserPool"

  password_policy {
    minimum_length    = 8
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
    require_lowercase = true
  }


  schema {
    attribute_data_type      = "String"
    name                     = "email"
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 6
      max_length = 50
    }
  }


  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "main" {
  name = "SA_AppClient"
  user_pool_id = aws_cognito_user_pool.main.id
  generate_secret                       = false
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  supported_identity_providers         = ["COGNITO"]
}
