
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
resource "aws_dynamodb_table" "user_requests" {
  name           = "UserRequests"
  billing_mode   = "PAY_PER_REQUEST"  // This mode is suitable for unpredictable workload
  hash_key       = "userID"
  range_key      = "requestTime"

  attribute {
    name = "userID"
    type = "S"  // S type for String
  }

  attribute {
    name = "requestTime"
    type = "S"  // S type for String, assuming requestTime is ISO8601 string
  }

  tags = {
    Name = "UserRequests"
    Environment = "dev"
  }
}
