/*
    DATASETS S3 TRIGGER
*/

# package up python code for datasets
data "archive_file" "lambda_s3_datasets_code" {
  type        = "zip"
  source_dir  = "../middleware/lambdas/datasets"           # since middleware/ is within the root repo 
  output_path = "../terraform_temp/lambda_s3_datasets.zip" # store zip locally within a temp directory
}


# IAM Role
resource "aws_iam_role" "lambda_s3_datasets_role" {
  name = "sa_lambda_role"

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

# S3 Lambda function for datasets
resource "aws_lambda_function" "lambda_s3_datasets" {
  function_name = "swen514-datasets-lambda_${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  role          = aws_iam_role.lambda_s3_datasets_role.arn
  runtime       = "python3.9"
  handler       = "process_dataset.handler"
  filename      = data.archive_file.lambda_s3_datasets_code.output_path
  timeout       = 3600 # 10 minute timeout

  depends_on = [aws_iam_role_policy_attachment.lambda_s3_datasets_policy_attach]
}


# AWS Managed Policies
resource "aws_iam_role_policy_attachment" "lambda_s3_datasets_policy_attach" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",                      # s3 access
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" # cloudwatch
  ])

  role       = aws_iam_role.lambda_s3_datasets_role.name
  policy_arn = each.key

  depends_on = [aws_iam_role.lambda_s3_datasets_role]
}

# DynamoDB policy
resource "aws_iam_role_policy" "lambda_s3_datasets_policy_dynamodb" {
  name = "sa_dynamodb_policy"
  role = aws_iam_role.lambda_s3_datasets_role.name
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

  depends_on = [aws_iam_role.lambda_s3_datasets_role]
}

# Comprehend Policy
resource "aws_iam_role_policy" "lambda_s3_datasets_policy_comprehend" {
  name = "sa_comprehend_policy"
  role = aws_iam_role.lambda_s3_datasets_role.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "VisualEditor0"
        Effect   = "Allow"
        Action   = "comprehend:DetectSentiment"
        Resource = "*"
      }
    ]
  })

  depends_on = [aws_iam_role.lambda_s3_datasets_role]
}

# Add permission
resource "aws_lambda_permission" "lambda_s3_trigger_source" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_s3_datasets.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.s3_bucket_sentianalysis.arn

  depends_on = [aws_s3_bucket.s3_bucket_sentianalysis, aws_dynamodb_table.db_sa_data]
}

# Add trigger
resource "aws_s3_bucket_notification" "lambda_s3_datasets_trigger" {
  bucket = aws_s3_bucket.s3_bucket_sentianalysis.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda_s3_datasets.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".csv"
  }

  depends_on = [aws_s3_bucket.s3_bucket_sentianalysis, aws_iam_role.lambda_s3_datasets_role, aws_iam_role_policy_attachment.lambda_s3_datasets_policy_attach, aws_lambda_permission.lambda_s3_trigger_source]
}
