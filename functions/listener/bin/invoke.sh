#!/usr/bin/env bash
set -v

kubeless function call wkd-listener \
    --namespace kubeless \
    --data '{"key": "value"}'
    # --data '{"namespace": "kube-system", "deployment": "heapster", "hear-at": "http://your.listener", "how-long": 5}'

