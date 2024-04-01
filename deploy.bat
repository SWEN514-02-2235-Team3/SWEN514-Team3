set "CURRENT_DIR=%CD%"
cd "%CURRENT_DIR%\terraform\" && terraform destroy -auto-approve && terraform apply -auto-approve && cd "%CURRENT_DIR%\data\" && py upload_datasets.py && cd "%CURRENT_DIR%"
pause