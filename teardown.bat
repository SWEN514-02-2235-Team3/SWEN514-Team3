set "CURRENT_DIR=%CD%"
cd "%CURRENT_DIR%\terraform\" && terraform destroy -auto-approve && cd "%CURRENT_DIR%\"