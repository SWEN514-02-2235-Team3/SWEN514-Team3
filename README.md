# Sentiment Analysis Project (Team 3)

- Saranya Dadi
- Greg Villafane
- Jackson Murphy
- Nick Grosskopf
- Jin Moon

# Cloud Architecture

![image](https://github.com/jym2584/SWEN514-Team3/assets/67706639/521b4a72-9b17-487c-83f0-a2a8341443f4)

------------------------------------------------------------------

# Dependencies
- Node.js (OPTIONAL if not doing local development)
- Terraform CLI (REQUIRED)
- Python (REQUIRED with pip dependencies)
- `terraform/aws_provider.tf` with the required credentials created (REQUIRED)
  - See AWS Deployment Instructions -> Setup

# AWS Deployment Instructions
## Setup
- Fork the GitHub repository
  - A fork is needed because AWS AMplify requires you to be a repository owner, which private repos don't have.
- On the repository, create `aws_provider.tf` under the `terraform/` directory and paste the following contents:
  ```
  /*
  Input AWS and GitHub credentials
  
  */
  provider "aws" {
    region                      = "${var.region}"
    access_key                  = ""
    secret_key                  = ""
  }
  
  
  variable "swen514_repo_fork" {
    description = "Input the github repo url to host the amplify app to (If you're a collaborator of the original repo then you need to create a fork and reference that)"
    default     = "https://github.com/jym2584/SWEN514-Team3"
  }
  
  variable "github_token" {
    description = "Input github token (classic) to deploy amplify app"
    default     = ""
  }
  ```
  - From the above, fill in the required variables.

## Installing Dependencies
Assuming you have all of the dependencies installed:
- Run `sh setup_dependencies.sh` or `.\setup_dependencies.bat` OR:
  - On the root directory, run `pip install -r requirements.txt`
  - On the root directory, run `cd terraform/ && terraform init`
  - **FOR LOCAL FRONTEND DEVELOPMENT:** run `cd frontend/ && npm install --force`
    - If you're just concerned with deploying the AWS infrastructure then this is not needed.

## Deploy/Teardown AWS Infrastructure
Scripts have been provided to aid with the deployment process.
- `deploy (.bat|.sh)` - Deploys the AWS infrastructure using Terraform then uploads the datasets to AWS S3
  - **MANUAL COMMANDS:**
    - `cd terraform/ && terraform apply` - Required to deploy the AWS infrastructure
    - `cd data/ && py upload_datasets.py` - Required to upload the stored datasets to s3 --> comprehend --> dynamodb
- `teardown (.bat|.sh)` - Destroys the AWS infrastructure
  - **MANUAL COMMANDS:**
    - `cd terraform/ && terraform destroy`

### Deploying the front-end locally
After the AWS Infrastructure has been setup then run:
- `cd frontend/ && npm start`

## After Deploying
- Go to the AWS Console > Amplify to get the link of the full stack application (Sentiment Analysis App).
  - It should be automatically deployed, but if not then run the build within the console.
- Once it has been deployed then you'll be able to interact with the datasets.

------------------------------------------------------------------
# GitHub Actions Setup (Not required)
At the moment, this only applies to testing the terraform infrastructure. The workflow does a `terraform plan` with AWS credentials (stored as secrets).  **This only needs to be done.**

## GitHub Secrets

These github secrets are required for the project to deploy:

- `AWS_PEM_KEY` - SSH Key used to deploy the terraform project. Generate a PEM key from the AWS console
- `TF_PLAN_AWS_ACCESS_KEY` - Used for CI/CD unit testing
- `TF_PLAN_AWS_SECRET_KEY` - Used for CI/CD unit testing

## Setting up `terraform plan` for CI/CD workflow

Creating minimal privileges to run the `terraform plan` as part of unit testing

- Navigate to the AWS Console and select "IAM"
- Create a new user: `swen514_terraform_plan`
  - Create a new user group: `swen514_terraform_plan`
    - Create a new policy: `swen514_terraform_plan`
      Paste the JSON contents as a permission to the policy
      ```
      {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Sid": "VisualEditor0",
                  "Effect": "Allow",
                  "Action": [
                      "ec2:DescribeImages"
                  ],
                  "Resource": "*"
              }
          ]
      }
      ```
      After creating the policy:
      1. link the user group to the new policy
      2. create the user group
      3. add the user to the group
      4. create the user
- Retrieve AWS access/secret keys from the new user
  - Go to the user that you just created and navigate to "Security credentials"
  - Create an access key for the CLI use case
- Add the AWS secrets to Github Actions secrets
  - Access Key env name: `TF_PLAN_AWS_ACCESS_KEY`
  - Secret Key env name: `TF_PLAN_AWS_SECRET_KEY`
