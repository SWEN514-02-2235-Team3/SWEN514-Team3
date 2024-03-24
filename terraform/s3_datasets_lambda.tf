/*
    DATASETS S3 TRIGGER
*/

# package up python code for datasets
data "archive_file" "lambda_s3_datasets_code" {
  type        = "zip"
  source_dir  = "../middleware/lambdas/datasets" # since middleware/ is within the root repo 
  output_path = "../terraform_temp/lambda_s3_datasets.zip" # store zip locally within a temp directory
}


# IAM Role
resource "aws_iam_role" "lambda_s3_datasets_role" {
  name               = "sentiment_analysis_lambda_role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Action    = "sts:AssumeRole"
    }]
  })
}

# S3 Lambda function for datasets
resource "aws_lambda_function" "lambda_s3_datasets" {
  function_name    = "swen514-sa-datasets"
  role             = aws_iam_role.lambda_s3_datasets_role.arn
  runtime          = "python3.9"
  handler          = "process_dataset.handler"
  filename         = "${data.archive_file.lambda_s3_datasets_code.output_path}" 

  depends_on = [aws_iam_role_policy_attachment.lambda_s3_datasets_policy_attach]
}


# S3 Lambda AmazonS3FullAccess policy to the Lambda role
resource "aws_iam_role_policy_attachment" "lambda_s3_datasets_policy_attach" {
  role       = aws_iam_role.lambda_s3_datasets_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"

  depends_on = [aws_iam_role.lambda_s3_datasets_role]
}

# For cloudwatch logs
resource "aws_iam_role_policy_attachment" "lambda_s3_datasets_policy_attach_logs" {
  role       = aws_iam_role.lambda_s3_datasets_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

  depends_on = [aws_iam_role.lambda_s3_datasets_role]
}

# add permission
resource "aws_lambda_permission" "lambda_s3_trigger_source" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_s3_datasets.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = "arn:aws:s3:::${aws_s3_bucket.s3_bucket_sentianalysis.id}"

  depends_on = [aws_s3_bucket.s3_bucket_sentianalysis]
}

# add trigger
resource "aws_s3_bucket_notification" "lambda_s3_datasets_trigger" {
  bucket = aws_s3_bucket.s3_bucket_sentianalysis.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda_s3_datasets.arn
    events              = ["s3:ObjectCreated:Put"]
    filter_suffix       = ".csv"
  }

  depends_on = [aws_s3_bucket.s3_bucket_sentianalysis]
}