# # package up python code for datasets
# data "archive_file" "lambda_api_gateway_code" {
#   type        = "zip"
#   source_dir  = "../middleware/lambdas/api"                # since middleware/ is within the root repo 
#   output_path = "../terraform_temp/lambda_api_gateway.zip" # store zip locally within a temp directory
# }

# # IAM Role
# resource "aws_iam_role" "lambda_api_gateway_role" {
#   name = "sa_lambda_api_gateway_role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           Service = "lambda.amazonaws.com"
#         }
#         Action = "sts:AssumeRole"
#       }
#     ]
#   })

#   #depends_on = [aws_dynamodb_table.db_sa_data]
# }

# # S3 Lambda function for datasets
# resource "aws_lambda_function" "lambda_api_gateway_func" {
#   function_name = "swen514-sa-api-gateway-lambda"
#   role          = aws_iam_role.lambda_api_gateway_role.arn
#   runtime       = "python3.9"
#   handler       = "process_dataset.handler"
#   filename      = data.archive_file.lambda_api_gateway.output_path

#   depends_on = [aws_iam_role_policy_attachment.lambda_api_gateway_policy_attach]
# }


# # AWS Managed Policies
# resource "aws_iam_role_policy_attachment" "lambda_api_gateway_policy_attach" {
#   for_each = toset([
#     "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" # cloudwatch
#   ])

#   role       = aws_iam_role.lambda_api_gateway_role.name
#   policy_arn = each.key

#   depends_on = [aws_iam_role.lambda_api_gateway_role]
# }

# # DynamoDB policy
# resource "aws_iam_role_policy" "lambda_api_gateway_policy_dynamodb" {
#   name = "sa_dynamodb_policy"
#   role = aws_iam_role.lambda_api_gateway_role.name
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid    = "VisualEditor0"
#         Effect = "Allow"
#         Action = [
#           "dynamodb:BatchGetItem",
#           "dynamodb:PutItem",
#           "dynamodb:PartiQLSelect",
#           "dynamodb:DescribeTable",
#           "dynamodb:GetShardIterator",
#           "dynamodb:GetItem",
#           "dynamodb:DescribeContinuousBackups",
#           "dynamodb:Scan",
#           "dynamodb:Query",
#           "dynamodb:GetRecords"
#         ]
#         Resource = "arn:aws:dynamodb:${var.region}:${data.aws_caller_identity.current.account_id}:table/${aws_dynamodb_table.db_sa_data.name}"
#       },
#       {
#         Sid      = "VisualEditor1"
#         Effect   = "Allow"
#         Action   = "dynamodb:ListStreams"
#         Resource = "*"
#       }
#     ]
#   })

#   depends_on = [aws_iam_role.lambda_api_gateway_role]
# }
