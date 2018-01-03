'use strict'

const Api = require('kubernetes-client')
const ns = process.env.K8S_NAMESPACE || 'default'
const apiUrl = process.env.K8S_API_URL || 'http://kubernetes.default'
const fs = require('fs')
const tokenFilePath = '/var/run/secrets/kubernetes.io/serviceaccount/token'
const token = process.env.K8S_SECRET_TOKEN || fs.readFileSync(tokenFilePath, 'utf8');

const v1beta1 = new Api.Extensions({
  url: apiUrl,
  version: 'v1beta1',
  namespace: ns,
  auth: {
    bearer: token
  }
});

function handle(err, result) {
  if(err) {
    console.warn(err)
  }
  else {
    const { status } = result
    const {
      replicas: desired,
      readyReplicas: ready,
      updatedReplicas: updated,
      availableReplicas: available
    } = status

    if (desired === ready &&
      desired === ready &&
      desired === updated &&
      desired === available) {
      // done
      console.log('Deployment complete')
    }
    else {
      console.log('need to check later or determine this as fail')
    }
  }
}

function perform(context) {
  console.log(context)
  v1beta1.namespaces.deployments('test').get(handle)
}

module.exports = {
  perform: perform
}
