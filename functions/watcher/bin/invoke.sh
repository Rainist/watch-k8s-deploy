#!/usr/bin/env bash
set -v

kubeless function call wkd-watcher \
    --namespace kubeless \
    --data '{"key": "value"}'
    # --data '{"spec": {"namespace": "kube-system", "deployment": "heapster"}, "hear-at": "http://your.listener", "attempt-count": 5, "started-at": "$mockstartedat"}'