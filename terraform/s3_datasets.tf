/**

S3 Bucket configuration to upload datasets from the github repository

*/
resource "aws_s3_bucket" "s3_bucket_sentianalysis" {
  bucket = "swen514-sentiment-analysis-data"
}

resource "aws_s3_object" "upload_dataset" {
  for_each = { for file in local.csv_files : file.key => file }

  bucket = aws_s3_bucket.s3_bucket_sentianalysis.id
  key    = each.value.key
  source = each.value.path
  etag   = filemd5(each.value.path)
}