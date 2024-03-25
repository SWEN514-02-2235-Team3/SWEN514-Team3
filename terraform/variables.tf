variable "availability_zone" {
  description = "Availability zone"
  default     = "us-east-1a"
}

variable "region" {
  description = "AWS Region"
  default     = "us-east-1"
}

variable "dataset_selection" {
  description = "Specify the type of dataset to use: 'datasets_test' or 'datasets_full'"
  type        = string
  default     = "datasets_test"

  validation {
    condition     = var.dataset_selection == "datasets_test" || var.dataset_selection == "datasets_full"
    error_message = "Invalid value for dataset selection. Allowed values are 'datasets_test' or 'datasets_full'"
  }
}
/*
Dynamically retrieve csv files from data/$var.dataset_selection on local repository
*/
locals {
  data_dirs = ["reddit", "youtube", "twitter"]

  csv_files = flatten([
    for dir in local.data_dirs: [
      for file in fileset("../data/${var.dataset_selection}/${dir}", "*.csv") : {
        path = "../data/${var.dataset_selection}/${dir}/${file}"
        key  = "${dir}/${file}"
      }
    ]
  ])
}