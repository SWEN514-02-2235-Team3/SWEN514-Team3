variable "availability_zone" {
  description = "Availability zone"
  default     = "us-east-1a"
}

variable "region" {
  description = "AWS Region"
  default     = "us-east-1"
}

locals {
  directories = ["../data/reddit", "../data/youtube", "../data/facebook"]

  csv_files = flatten([
    for dir in local.directories : [
      for file in fileset(dir, "*.csv") : {
        path = "${dir}/${file}"
        key  = "${dir}/${file}"
      }
    ]
  ])
}