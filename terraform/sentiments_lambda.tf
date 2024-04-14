# package up python code for sentiments
data "archive_file" "lambda_s3_sentiments_code" {
  type        = "zip"
  source_dir  = "../middleware/lambdas/api/get_sentiments"           # since middleware/ is within the root repo 
  output_path = "../terraform_temp/sentiments_apis.zip" # store zip locally within a temp directory
}

# lambda function
resource "aws_lambda_function" "get_sentiments" {
  filename      = data.archive_file.lambda_s3_sentiments_code.output_path
  function_name = "get_sentiments"
  role          = aws_iam_role.lambda_s3_sentiments_role.arn
  handler       = "sentiments.lambda_handler"
  runtime       = "python3.10"
  timeout       = 60 # 1 minute timeout
  
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.db_sa_data.name
    }
  }
}

# IAM Role
resource "aws_iam_role" "lambda_s3_sentiments_role" {
  name = "sa_lambda_sentiments_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  depends_on = [aws_dynamodb_table.db_sa_data]
}
# AWS Managed Policies
resource "aws_iam_role_policy_attachment" "lambda_s3_sentiments_policy_attach" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",                      # s3 access
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" # cloudwatch
  ])

  role       = aws_iam_role.lambda_s3_sentiments_role.name
  policy_arn = each.key

  depends_on = [aws_iam_role.lambda_s3_sentiments_role]
}

# DynamoDB policy
resource "aws_iam_role_policy" "lambda_s3_sentiments_policy_dynamodb" {
  name = "sa_dynamodb_policy"
  role = aws_iam_role.lambda_s3_sentiments_role.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "VisualEditor0"
        Effect = "Allow"
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:PutItem",
          "dynamodb:PartiQLSelect",
          "dynamodb:DescribeTable",
          "dynamodb:GetShardIterator",
          "dynamodb:GetItem",
          "dynamodb:DescribeContinuousBackups",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetRecords"
        ]
        Resource = "arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${aws_dynamodb_table.db_sa_data.name}"
      },
      {
        Sid      = "VisualEditor1"
        Effect   = "Allow"
        Action   = "dynamodb:ListStreams"
        Resource = "*"
      }
    ]
  })

  depends_on = [aws_iam_role.lambda_s3_sentiments_role]
}