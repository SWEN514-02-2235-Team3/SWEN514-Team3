/**

S3 Bucket configuration to upload datasets from the github repository

*/
resource "aws_s3_bucket" "s3_bucket_sentianalysis" {
    bucket = "swen514-sentiment-analysis-data"
}

/*
Folder structure to store data sets
*/
resource "aws_s3_object" "folder_structure" {
    depends_on = [aws_s3_bucket.s3_bucket_sentianalysis]
    bucket       = aws_s3_bucket.s3_bucket_sentianalysis.id
    key          = "${each.value.folder}"
    content_type = "application/x-directory"
    for_each     = { for dir in local.data_dirs : dir => { folder = dir } }
}


/*
Upload data sets to the s3 bucket
*/
resource "aws_s3_object" "upload_dataset" {
    depends_on = [aws_s3_bucket.s3_bucket_sentianalysis, aws_s3_object.folder_structure]

    for_each = { for file in local.csv_files : file.key => file }
    
    bucket = aws_s3_bucket.s3_bucket_sentianalysis.id
    key    = each.value.key
    source = each.value.path
    etag   = filemd5(each.value.path)
}