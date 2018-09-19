#!/usr/bin/env bash
set -v

kubeless function delete wkd-watcher --namespace kubeless
kubeless --namespace kubeless trigger kafka delete wkd-watcher-trigger

