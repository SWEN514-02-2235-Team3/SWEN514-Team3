# How to authenticate into AWS
## aws_provider.tf
Create a `aws_provider.tf` config file and input the values.
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
## aws configure
Configure AWS access and secret keys. You'll still need the variables to input the repo fork and github token from the above step.
