
resource "aws_amplify_app" "sa-app" {
  name       = "Sentiment Analysis App"
  repository = "https://github.com/jym2584/SWEN514-Team3"
  access_token = "${var.github_token}"
  
  build_spec = <<-EOT
    version: 0.1
    frontend:
      phases:
        preBuild:
          commands:
            - cd frontend/   # Navigate to the frontend directory
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: frontend/build   # Specify the path to the build directory inside frontend/
        files:
          - '**/*'
      cache:
        paths:
          - frontend/node_modules/**/*
  EOT
  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }
  environment_variables = {
    ENV = "dev"
    API_URL = "${aws_api_gateway_deployment.sa_api_gateway_deployment.invoke_url}" # API Gateway URL
  }
  depends_on = [ aws_lambda_permission.lambda_s3_trigger_source, aws_lambda_function.lambda_s3_datasets, aws_dynamodb_table.db_sa_data, aws_s3_bucket.s3_bucket_sentianalysis ]
}

terraform {
  required_providers {
    git = {
      source = "paultyng/git"
      version = "0.1.0"
    }
  }
}


data "git_repository" "repo" {
  path = "../" # root repository
}

resource "aws_amplify_branch" "amplify_branch" {
  app_id      = aws_amplify_app.sa-app.id
  branch_name = data.git_repository.repo.branch # current git branch
  depends_on = [ aws_amplify_app.sa-app ]
}