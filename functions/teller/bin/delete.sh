#!/usr/bin/env bash
set -v

kubeless function delete wkd-teller --namespace kubeless
kubeless --namespace kubeless trigger kafka delete wkd-teller-trigger
