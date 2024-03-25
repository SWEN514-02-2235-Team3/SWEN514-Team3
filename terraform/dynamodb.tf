
/*
    SentAnalysisDataResults table that stores:
    1. ID of the data input
    2. the source (reddit/facebook/youtube/etc.)
    3. date of the comment
    4. the comment
    5. sentiment analysis results (positive/negative/neutral)
*/
resource "aws_dynamodb_table" "db_sa_data" {
    name = "SentAnalysisDataResults"

    attribute {
        name = "id"
        type = "S"
    }
    hash_key = "id" 
    
    billing_mode   = "PROVISIONED"
    read_capacity  = 5
    write_capacity = 5
    stream_enabled = false
    point_in_time_recovery {
        enabled = false
    }
    tags = {
        Name = "SentAnalysisDataResults"
    }
}