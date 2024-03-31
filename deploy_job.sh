#!/bin/bash
CURRENT_DIR=$(pwd)
cd "${CURRENT_DIR}/terraform/" && terraform destroy -auto-approve && terraform apply -auto-approve && cd "${CURRENT_DIR}/data/" && python upload_datasets.py && cd "${CURRENT_DIR}"