# Sentiment Analysis Project (Team 3)

- Saranya Dadi
- Greg Villafane
- Jackson Murphy
- Nick Grosskopf
- Jin Moon

# Cloud Architecture

![image](https://github.com/jym2584/SWEN514-Team3/assets/67706639/521b4a72-9b17-487c-83f0-a2a8341443f4)

---

# How to Deploy using GitHub

WIP

---

# Local Development & Deployment

## Dependencies

- Node.js
- Terraform CLI
  - https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli#install-terraform
- Python

You can run `setup_dependencies.bat` or `setup_dependencies.sh` to setup the local repository or inspect the script and run the commands.

## How to Deploy Locally

**Pre-requisites**

- Terraform CLI is installed
- AWS Credentials are setup via terraform or within a terraform script
  - If you want to set it up locally within the repository
    - Fetch your AWS Access and Secret Key from the AWS Console
    - Create `aws_provider.tf` under `terraform/` (this file will not be checked into the remote repository)
      ```
      provider "aws" {
          region = "${var.region}"
          access_key = "<YOUR AWS ACCESS KEY HERE>"
          secret_key = "<YOUR AWS SECRET KEY HERE>"
      }
      ```

**Instructions**

```
cd terraform/
terraform apply                    # standup aws infrastructure
python ../data/upload_datasets.py  # this is used to upload the datasets after deploying the terraform infrastructure
```

Terraform apply stands up the AWS infrastructure & code needed to run the application.

## How to develop locally

TODO INSTRUCTIONS

- If needed, deploy the entire terraform backend stack.
  - This will allow you to develop lambda code.
- Front-end
  - **TODO INSTRUCTIONS**: Setup configuration to fetch required endpoints to run the application
  - Run the node.js application: `cd frontend/ && npm start`

---

# GitHub Repository Setup

This only needs to be done once as an initial setup

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
