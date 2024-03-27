/**

S3 Bucket configuration to upload datasets from the github repository

*/
resource "aws_s3_bucket" "s3_bucket_sentianalysis" {
  bucket = "swen514-sentiment-analysis-data-${data.aws_iam_user.current.name}"
}

/*
Folder structure to store data sets
*/
resource "aws_s3_object" "folder_structure" {
  depends_on   = [aws_s3_bucket.s3_bucket_sentianalysis]
  bucket       = aws_s3_bucket.s3_bucket_sentianalysis.id
  key          = "${each.value.folder}/"
  content_type = "application/x-directory"
  for_each     = { for dir in local.data_dirs : dir => { folder = dir } }
}

/*
    Wait 30 seconds before uploading datasets to allow 
    time for AWS to fully create the necessary resources
    (i.e. lambdas)
*/
resource "time_sleep" "wait_before_uploading" {
  create_duration = "60s"

  depends_on = [
    aws_s3_bucket_notification.lambda_s3_datasets_trigger,
    aws_dynamodb_table.db_sa_data,
    aws_s3_bucket.s3_bucket_sentianalysis,
    aws_s3_object.folder_structure
  ]
}


/*
Upload data sets to the s3 bucket
*/
resource "aws_s3_object" "upload_dataset" {
  depends_on = [time_sleep.wait_before_uploading]

  for_each = { for file in local.csv_files : file.key => file }

  bucket = aws_s3_bucket.s3_bucket_sentianalysis.id
  key    = each.value.key
  source = each.value.path
  etag   = filemd5(each.value.path)
}
