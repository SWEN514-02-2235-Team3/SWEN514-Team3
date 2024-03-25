# swen514-team3-project
Team name pending :)
- Saranya Dadi
- Greg Villafane
- Jackson Murphy
- Nick Grosskopf
- Jin Moon
________________________
# How to Deploy Locally
Install Terraform CLI
Setup AWS credentials
```
cd <path_to_SWEN514-Team3>/terraform/
terraform apply
```

Terraform apply stands up the AWS infrastructure & code needed to run the application.

# How to Deploy using GitHub
WIP

________________________
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
            1) link the user group to the new policy
            2) create the user group
            3) add the user to the group
            4) create the user
- Retrieve AWS access/secret keys from the new user
    - Go to the user that you just created and navigate to "Security credentials"
    - Create an access key for the CLI use case
- Add the AWS secrets to Github Actions secrets
    - Access Key env name: `TF_PLAN_AWS_ACCESS_KEY`
    - Secret Key env name: `TF_PLAN_AWS_SECRET_KEY`
