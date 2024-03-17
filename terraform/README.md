# AWS Infrasturcture
Terraform code
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
    - Access Key env name: `TF_PLAN_AWS_SECRET_KEY`
    - Secret Key env name: `TF_PLAN_AWS_SECRET_KEY`