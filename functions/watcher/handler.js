'use strict'

const _ = require('lodash')
const moment = require('moment')
const { assertStatusAsDesired, KubeClientDeployNotReadyException } = require('./lib/k8s')
const { produce } = require('./lib/kafka')
const { WATCH_TOPIC, TELL_TOPIC, TIME_OUT, NOT_READY, SUCCESS, FAIL } = require('./lib/config')
const SLEEP_SECONDS = 30

function DeployWatchTimeoutException(message) {
  this.message = message
  this.name = 'DeployWatchTimeout'
}

function sleep(s) {
  const ms = s * 1000
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function publishToWatch({ spec, startedAt, until, hearAt, attemptCount }) {
  await sleep(SLEEP_SECONDS)

  const message = {
    spec, until,
    'started-at': startedAt,
    'hear-at': hearAt,
    'attempt-count': attemptCount + 1
  }

  return produce(WATCH_TOPIC, message)
}

function publishToTell({ spec, howLong, hearAt, status}) {
  const message = {
    spec, status,
    'how-long': howLong,
    'hear-at': hearAt,
  }
  return produce(TELL_TOPIC, message)
}

function checkTimeout(until) {
  return new Promise((resolve) => {
    const untilTime = moment(until)
    const diff = moment().diff(untilTime)
    const isTimedOut = diff > 0

    if (isTimedOut) {
      throw new DeployWatchTimeoutException('Time-out exceeded')
    }
    resolve()
  })
}

function watch(context) {
  let message = null
  try {
    message = JSON.parse(context)
  }
  catch (e) {
    console.warn(e)
  }

  if (message) {
    performWatch(message)
  }
  else {
    console.warn("Couldn't parse context:", context)
    publishToTell({ status: FAIL })
  }
}

function performWatch({ spec, until, 'started-at': startedAt, 'hear-at': hearAt, 'attempt-count': attemptCount }) {
  const { namespace, deployment } = spec
  const howLongF = moment().diff(moment(startedAt), 's') / 60
  const howLong = _.round(howLongF, 1)
  const sleepSeconds = attemptCount > 0 ? 0 : 20 // wait 20 seconds if it's the first attempt

  checkTimeout(until)
    .then(() => sleep(sleepSeconds))
    .then(() => assertStatusAsDesired(namespace, deployment))
    .then(() => publishToTell({ spec, howLong, hearAt, status: SUCCESS}))
    .catch(err => {
      if (err instanceof DeployWatchTimeoutException) {
        return publishToTell({ spec, howLong, hearAt, status: TIME_OUT})
      }
      else {
        throw err
      }
    })
    .catch(err => {
      if (err instanceof KubeClientDeployNotReadyException) {
        return publishToWatch({ spec, startedAt, until, hearAt, attemptCount })
      }
      else {
        throw err
      }
    })
    .catch(err => {
      console.warn(err)
      return publishToTell({ spec, howLong, hearAt, status: FAIL})
    })
    .catch(err => {
      console.warn('FAILED WITH EVERY FALLBACK')
      console.warn(err)
    })
}

module.exports = { watch }
