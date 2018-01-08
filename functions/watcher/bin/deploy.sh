#!/usr/bin/env bash
set -v

bin/prepare.sh

kubeless function deploy wkd-watcher --runtime nodejs8 \
    --namespace kubeless \
    --from-file .code.zip \
    --dependencies package.json \
    --handler handler.watch \
    --trigger-topic check-deploy-status