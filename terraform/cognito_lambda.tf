
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com",
        },
      },
    ]
  })

  tags = {
    Role = "LambdaExecutionRole"
  }
}


resource "aws_lambda_function" "cognito_pre_signup" {
  filename         = var.lambda_function_path
  function_name    = "cognitoAutoConfirmUser"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256(var.lambda_function_path)
  runtime          = "nodejs18.x"

#   environment {
#         variables = {
#         COGNITO_USER_POOL_ID = aws_cognito_user_pool.main.id
#         }
#     }
}