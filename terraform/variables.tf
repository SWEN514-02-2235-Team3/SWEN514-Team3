variable "key_name" {
  description = "Name of an existing EC2 KeyPair to enable SSH access to the instance"
}

variable "instance_type" {
  description = "WebServer EC2 instance type"
  default     = "t2.micro"
}

variable "ssh_location" {
  description = "The IP address range that can be used to SSH to the EC2 instances"
  default     = "0.0.0.0/0"
}

variable "availability_zone" {
  description = "Availability zone"
  default     = "us-east-1a"
}

variable "region" {
  description = "AWS Region"
  default     = "us-east-1"
}

data "aws_ami" "selected" {
  most_recent = true

  filter {
    name   = "name"
    values = ["*amzn2-ami-hvm-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}