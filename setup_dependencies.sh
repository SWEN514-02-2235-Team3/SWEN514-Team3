#!/bin/bash

CURRENT_DIR=$(pwd)
pip install -r requirements.txt
cd "$CURRENT_DIR/terraform/" && terraform init
cd "$CURRENT_DIR/frontend/" && npm install