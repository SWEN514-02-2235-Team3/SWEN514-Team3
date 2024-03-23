variable "availability_zone" {
  description = "Availability zone"
  default     = "us-east-1a"
}

variable "region" {
  description = "AWS Region"
  default     = "us-east-1"
}

/*
Dynamically retrieve csv files from data/ on local repository
*/
locals {
  data_dirs = ["reddit", "youtube", "twitter"]

  csv_files = flatten([
    for dir in local.data_dirs: [
      for file in fileset("../data/${dir}", "*.csv") : {
        path = "../data/${dir}/${file}"
        key  = "${dir}/${file}"
      }
    ]
  ])
}