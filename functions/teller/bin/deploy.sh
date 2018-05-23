#!/usr/bin/env bash
set -v

bin/prepare.sh

kubeless function deploy wkd-teller --runtime nodejs8 \
    --namespace kubeless \
    --from-file .code.zip \
    --dependencies package.json \
    --handler handler.tell \
    --label topic=share-deploy-status

kubeless topic create share-deploy-status

kubeless --namespace kubeless trigger kafka create wkd-teller-trigger \
  --function-selector function=wkd-teller \
r --trigger-topic share-deploy-status
