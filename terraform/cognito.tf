resource "aws_cognito_user_pool" "main" {
  name = "SA_UserPool"

  password_policy {
    minimum_length    = 6

  }

  lambda_config {
    pre_sign_up = aws_lambda_function.cognito_pre_signup.arn
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

  depends_on = [aws_lambda_function.cognito_pre_signup]
}

resource "aws_lambda_permission" "allow_cognito" {
  statement_id  = "AllowCognitoInvocation"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}

resource "aws_cognito_user_pool_client" "main" {
  name = "SA_AppClient"
  user_pool_id = aws_cognito_user_pool.main.id
  generate_secret                       = false
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  supported_identity_providers         = ["COGNITO"]
}
