#!/bin/bash
CURRENT_DIR=$(pwd)
cd "${CURRENT_DIR}/terraform/" && terraform destroy -auto-approve