'use strict'

const fs = require('fs')
const Api = require('kubernetes-client')
const apiUrl = process.env.K8S_API_URL || 'https://kubernetes.default'
const tokenFilePath = '/var/run/secrets/kubernetes.io/serviceaccount/token'
const caFilePath = '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'
const token = process.env.K8S_SECRET_TOKEN || fs.readFileSync(tokenFilePath, 'utf8');
const ca = fs.readFileSync(caFilePath)

function v1beta1(ns) {
  return new Api.Extensions({
    url: apiUrl,
    version: 'v1beta1',
    namespace: ns,
    ca: ca,
    auth: {
      bearer: token
    },
    request: {
      timeout: 3000
    },
    promises: true
  })
}

function checkExist({ namespace, deployment }) {
  return v1beta1(namespace).namespaces.deployments(deployment).get()
}

module.exports = { checkExist }