
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
    type = "N"
  }

   hash_key = "id" 
}