resource "aws_cloudwatch_event_rule" "api_gateway_execution" {
  name        = "sa_lambda_execution_cloudwatch"
  description = "Triggered on API Gateway & upload datasets execution"
  event_pattern = <<PATTERN
    {
    "source": ["aws.apigateway"],
    "detail-type": ["API Gateway Execution State Change"],
    "detail": {
        "path": ["/sentiments"]
    }
    }
    PATTERN
}

resource "aws_cloudwatch_event_target" "log_lambda_triggers" {
  count     = length([aws_lambda_function.get_sentiments.arn, aws_lambda_function.get_sentiments_youtube.arn, aws_lambda_function.lambda_s3_datasets.arn])
  rule      = aws_cloudwatch_event_rule.api_gateway_execution.name
  target_id = "InvokeLambdaFunction_${count.index}"
  arn       = element([aws_lambda_function.get_sentiments.arn, aws_lambda_function.get_sentiments_youtube.arn, aws_lambda_function.lambda_s3_datasets.arn], count.index)

  depends_on = [ aws_lambda_function.get_sentiments, aws_lambda_function.get_sentiments_youtube, aws_lambda_function.lambda_s3_datasets ]
}