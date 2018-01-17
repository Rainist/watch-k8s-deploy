'use strict'

const { Apis, Features, K8SAuthType, DeploymentStatusType } = require('k8s-ops')
const { deploy } = Features

const authType = K8SAuthType.InCluster

function KubeClientDeployNotReadyException(message) {
  this.message = message
  this.name = 'KubeClientDeployNotReadyException'
}

function checkExist(namespace, deployment) {
  const apis = Apis(authType, namespace)
  return deploy(apis, deployment).res.get()
}

function assertStatusAsDesired(namespace, deployment) {
  const apis = Apis(authType, namespace)

  return deploy(apis, deployment)
    .assertStatus(DeploymentStatusType.AsDesired)
    .catch(err => new KubeClientDeployNotReadyException('Status is not as desired'))
}

module.exports = { checkExist, assertStatusAsDesired, KubeClientDeployNotReadyException }