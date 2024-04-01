"""
Run `upload_datasets.py` to upload the datasets to the s3 bucket after the AWS infrastructure is deployed.

Requires AWS credentials through either:
    - terraform/aws_provider.tf
    - AWS config
    - Manually supplied key inputs
    
"""

import boto3
import os
import time
import platform
import re
import glob
import alive_progress

SCRIPT_PATH = os.path.dirname(os.path.realpath(__file__)) # assumes that this script lies <root_repo>/data/
s3_client = None
lambda_client = None
cloudwatch_client = None
ACCESS_KEY = None
SECRET_KEY = None

def get_credentials_from_terraform(path=f"{SCRIPT_PATH}/../terraform/aws_provider.tf"):
    """Gets AWS credentials from a terraform file
    """
    access_key_pattern = re.compile(r'access_key\s*=\s*"([^"]+)"')
    secret_key_pattern = re.compile(r'secret_key\s*=\s*"([^"]+)"')

    with open(path, 'r') as file:
        file_content = file.read()
        access_key_match = access_key_pattern.search(file_content)
        secret_key_match = secret_key_pattern.search(file_content)

    if access_key_match and secret_key_match:
        access_key = access_key_match.group(1)
        secret_key = secret_key_match.group(1)
        global s3_client
        global lambda_client
        global cloudwatch_client
        global ACCESS_KEY
        global SECRET_KEY
        ACCESS_KEY = access_key
        SECRET_KEY = secret_key
        s3_client = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
        lambda_client = boto3.client('lambda', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
        cloudwatch_client = boto3.client('logs', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
        return True
    return False

def get_credentials_from_aws_config():
    """Gets AWS credentials from AWS config
    """
    plat = platform.system()
    credentials_path = None
    if plat == "Windows": 
        pass
        # credentials_path = f"C:/Users/{os.getenv('USERPROFILE').split('\\')[-1]}/.aws/credentials"
    else: credentials_path = "~/.aws/credentials"
    with open(credentials_path, 'r') as file:
        for line in file:
            if line.startswith("aws_access_key_id"):
                access_key = line.split("=")[1].strip()
            elif line.startswith("aws_secret_access_key"):
                secret_key = line.split("=")[1].strip()
    
    if access_key and secret_key:
        global s3_client
        global lambda_client
        global cloudwatch_client
        global ACCESS_KEY
        global SECRET_KEY
        ACCESS_KEY = access_key
        SECRET_KEY = secret_key
        s3_client = boto3.client('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
        lambda_client = boto3.client('lambda', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
        cloudwatch_client = boto3.client('logs', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY)
        return True
    return False

def s3_get_bucket_name(bucket_regex="swen514-sa-datasets"):
    """Gets the full bucket name from a partial name
    """
    response = s3_client.list_buckets()
    bucket_name = None
    for bucket in response['Buckets']:
        if re.match(bucket_regex, bucket['Name']):
            bucket_name = bucket['Name']
            return bucket_name
    if not bucket_name:
        raise ValueError(f"{bucket_regex} doesn't exist in the AWS Console. Have you deployed the terraform infrastructure?")
        
    

def s3_delete_files(bucket_name):
    """Deletes files from s3 bucket
    """
    print(f"Deleting all objects from s3:{bucket_name}...")
    response = s3_client.list_objects_v2(Bucket=bucket_name)
    if 'Contents' in response:
        objects = [{'Key': obj['Key']} for obj in response['Contents'] if ".csv" in obj['Key']]
        try:
            response = s3_client.delete_objects(Bucket=bucket_name, Delete={'Objects': objects})
            print(f"Deleted .csv files from s3:{bucket_name}")
        except Exception as e:
            print(f".csv files from s3:{bucket_name} has already been deleted.")
            
def s3_upload_files(bucket_name, datasets_name):
    """Upload files to s3
    
    datasets_name is either datasets_full or datasets_test
    """      
    # upload files to s3
    to_print = f"Uploading {datasets_name} files to s3:{bucket_name}..."
    print("-" * len(to_print))
    print(to_print)
    print("-" * len(to_print))
    
    subdir_path = os.path.join(SCRIPT_PATH, datasets_name)
    for foldername in os.listdir(subdir_path): # Iterate through each subfolder in the current subdirectory
        folder_path = os.path.join(subdir_path, foldername)
        
        if os.path.isdir(folder_path): # Check if the path is a directory
            platform_name = os.path.split(folder_path)[1]
            print(platform_name)

            for file_path in glob.glob(os.path.join(folder_path, '*.csv')): # Iterate through each .csv file in the current subfolder
                filename = os.path.split(file_path)[1]
                s3_client.upload_file(file_path, bucket_name, f"{platform_name}/{filename}")
                print(f"\t{filename}")
    print("Done!")

def get_datasets_lambda(lambda_regex="swen514-datasets-lambda"):
    response = lambda_client.list_functions()
    for fun in response['Functions']:
        if lambda_regex in fun['FunctionName']:
            return fun['FunctionName']
    
    raise ValueError(f"{lambda_regex} doesn't exist in the AWS Console. Have you deployed the terraform infrastructure?")

def delete_lambda_logs(lambda_log_group_name):
    response = cloudwatch_client.describe_log_groups()
    if not response:
        return
    for log_group in response['logGroups']:
        if lambda_log_group_name == log_group['logGroupName']:
            cloudwatch_client.delete_log_group(logGroupName=lambda_log_group_name)
            print(f"Log group '{lambda_log_group_name}' deleted.")
    
def check_if_lambda_logs_generated(lambda_log_group_name, bucket_name):
    response = cloudwatch_client.describe_log_groups()
    if not response:
        return False

    for event in response['logGroups']:
        if lambda_log_group_name == event['logGroupName']:
            s3_client.delete_object(Bucket=bucket_name,Key="upload_datasets_test.csv")
            return True
    
    s3_client.upload_file(f"{SCRIPT_PATH}/upload_datasets_test.csv", bucket_name, "upload_datasets_test.csv")
    s3_client.delete_object(Bucket=bucket_name,Key="upload_datasets_test.csv")
    return False

def main():
    credentials_found = False
    while not credentials_found:
        if get_credentials_from_terraform():
            credentials_found = True
            print("Found AWS credentials from terraform.")
            break
        elif get_credentials_from_aws_config():
            credentials_found = True
            print("Found AWS credentials from the AWS config.")
            break
        
        while not credentials_valid:
            aws_access_key = input("AWS Access Key: ")
            aws_secret_key = input("AWS Secret Key: ")
            try: 
                global s3_client
                s3_client = boto3.client('s3', aws_access_key_id=aws_access_key, aws_secret_access_key=aws_secret_key)
                credentials_found = True
                credentials_valid = True
            except:
                print("AWS Credentials are not valid")
                
    # datasets input
    datasets_input = None
    while True:
        try:
            print("Specify which datasets you want to use (number input):\n\t(1) datasets_test\n\t(2) datasets_full\n")
            datasets_input = int(input(">> "))
            if datasets_input == 1:
                datasets_input = "datasets_test"
                break
            elif datasets_input == 2:
                datasets_input = "datasets_full"
                break
            else:
                print("Invalid input")
        except: pass
    
    # get the s3 bucket and delete the files associated with the bucket
    print("**************DELETING FILES FROM S3**************")
    bucket_name = s3_get_bucket_name()
    s3_delete_files(bucket_name)
    
    print("\n")
    print("**************CHECK IF S3 TRIGGER IS FULLY INITIALIZED**************")
    lambda_func_name = get_datasets_lambda() # get current lambda log deployed
    print(lambda_func_name)
    group_name = f"/aws/lambda/{lambda_func_name}" # get log group of current lambda
    delete_lambda_logs(group_name) # delete logs of associated lambda (if it exists)
    
    with alive_progress.alive_bar(60, title="Waiting 60s until the s3 trigger is initialized...", stats=False, spinner=None) as bar:
        for _ in range(0, 60):
            time.sleep(1)
            bar()
            
    logs_generated = check_if_lambda_logs_generated(group_name, bucket_name) # check if the currently deployed lambda has logs
    with alive_progress.alive_bar(title="Polling until the s3 trigger is initalized...", monitor=False, stats=False, spinner=None) as bar:
        i = 0
        while not logs_generated:
            time.sleep(0.1)
            bar()
            i+=1
            if i == 20: # 20 seconds
                logs_generated = check_if_lambda_logs_generated(group_name, bucket_name)
                i = 0
    print()
    print("*****************S3 trigger is fully initialized!*****************")
    delete_lambda_logs(group_name) # delete test logs once we know the lambda is now deployed
    print("\n")
    s3_upload_files(bucket_name, datasets_input)
    
if __name__ == "__main__":
    main()
    pass