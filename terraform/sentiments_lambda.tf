# package up python code for datasets
data "archive_file" "lambda_s3_sentiments_code" {
  type        = "zip"
  source_dir  = "../middleware/lambdas/api"           # since middleware/ is within the root repo 
  output_path = "../terraform_temp/sentiments_apis.zip" # store zip locally within a temp directory
}

# lambda function
resource "aws_lambda_function" "get_sentiments" {
  filename      = data.archive_file.lambda_s3_sentiments_code.output_path
  function_name = "get_sentiments"
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "sentiments.lambda_handler"
  runtime       = "python3.10"
  
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.db_sa_data.name
    }
  }
}

# iam role
resource "aws_iam_role" "lambda_execution_role" {
  name               = "lambda_execution_role"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
}

# iam policy
resource "aws_iam_policy" "dynamodb_full_access" {
  name   = "dynamodb_full_access"
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "dynamodb:*",
        "Resource": "*"
      }
    ]
  })
}

# role attachment
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attachment" {
  policy_arn = aws_iam_policy.dynamodb_full_access.arn
  role       = aws_iam_role.lambda_execution_role.name
}