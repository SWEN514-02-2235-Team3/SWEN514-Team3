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

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attachment" {
  policy_arn = aws_iam_policy.dynamodb_full_access.arn
  role       = aws_iam_role.lambda_execution_role.name
}

resource "aws_lambda_function" "get_sentiments" {
  filename      = "../backend/sentiments.zip"
  function_name = "get_sentiments"
  role          = aws_iam_role.lambda_execution_role.arn
  handler       = "sentiments.lambda_handler"
  runtime       = "python3.10"
  
  environment {
    variables = {
      TABLE_NAME = "SentAnalysisDataResults"
    }
  }
}