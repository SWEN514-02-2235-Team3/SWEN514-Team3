import boto3
import os
import shutil
import platform
import re
import getpass
import glob
SCRIPT_PATH = os.path.dirname(os.path.realpath(__file__)) # assumes that this script lies <root_repo>/data/
s3_client = None


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
            s3_client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key)
            return True

def get_credentials_from_aws_config():
    """Gets AWS credentials from AWS config
    """
    plat = platform.system()
    credentials_path = None
    if plat == "Windows": credentials_path = f"C:/Users/{os.getenv('USERPROFILE').split('\\')[-1]}/.aws/credentials"
    else: credentials_path = "~/.aws/credentials"
    with open(credentials_path, 'r') as file:
        for line in file:
            if line.startswith("aws_access_key_id"):
                access_key = line.split("=")[1].strip()
            elif line.startswith("aws_secret_access_key"):
                secret_key = line.split("=")[1].strip()
    
    if access_key and secret_key:
        global s3_client
        s3_client = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=secret_key)
        return True
    return False
    
def s3_upload_files(bucket_regex="swen514-sa-datasets"):
    """Upload files to s3
    """
    # get s3 bucket
    response = s3_client.list_buckets()
    bucket_name = None
    for bucket in response['Buckets']:
        if re.match(bucket_regex, bucket['Name']):
            bucket_name = bucket['Name']
    if not bucket_name:
        print(f"{bucket_regex} doesn't exist in the AWS Console. Have you deployed the terraform config?")
        return
    
    # datasets input
    datasets_input = None
    while True:
        try:
            print("Specify which datasets you want to use (number input):\n\t(1) datasets_test\n\t(2) datasets_full")
            datasets_input = int(input(">> "))
            if datasets_input == 1:
                datasets_input = "datasets_test"
                break
            elif datasets_input == 2:
                datasets_input = "datasets_full"
        except: pass
    
    print("Deleting all objects from s3...")
    response = s3_client.list_objects_v2(Bucket=bucket_name)
    if 'Contents' in response:
        objects = [{'Key': obj['Key']} for obj in response['Contents'] if ".csv" in obj['Key']]
        try:
            response = s3_client.delete_objects(Bucket=bucket_name, Delete={'Objects': objects})
            print(f"Deleted .csv files from s3:{bucket_regex}")
        except Exception as e:
            print(f".csv files from s3:{bucket_regex} has already been deleted.")
   
    # upload files to s3
    to_print = f"Uploading {datasets_input} files to s3:{bucket_name}..."
    print("-" * len(to_print))
    print(to_print)
    print("-" * len(to_print))
    
    subdir_path = os.path.join(SCRIPT_PATH, datasets_input)
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
    
    
    s3_upload_files()
    
if __name__ == "__main__":
    main()