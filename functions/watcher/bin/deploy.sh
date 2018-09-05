#!/usr/bin/env bash
set -v

bin/prepare.sh

kubeless function deploy wkd-watcher --runtime nodejs8 \
    --namespace kubeless \
    --from-file .code.zip \
    --dependencies package.json \
    --handler handler.watch \
    --label topic=check-deploy-status

kubeless topic create check-deploy-status

kubeless --namespace kubeless trigger kafka create wkd-watcher-trigger \
  --function-selector function=wkd-watcher \
  --trigger-topic check-deploy-status

