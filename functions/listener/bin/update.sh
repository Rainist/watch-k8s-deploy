#!/usr/bin/env bash
set -v

bin/prepare.sh

kubeless function update wkd-listener \
    --namespace kubeless \
    --from-file .code.zip \
    --dependencies package.json \
    --handler handler.listen

