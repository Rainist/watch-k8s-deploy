#!/usr/bin/env bash
set -v

mockstartedat="`date +%s`000"

kubeless function call wkd-teller \
    --namespace kubeless \
    --data '{"key": "value"}'
    # --data '{"spec": {"namespace": "kube-system", "deployment": "heapster"}, "hear-at": "http://your.listener", "how-long": 5, "status": "SUCCESS"}'

