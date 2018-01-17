'use strict'

const _ = require('lodash')
const moment = require('moment')
const { assertStatusAsDesired, KubeClientDeployNotReadyException } = require('./lib/k8s')
const { produce } = require('./lib/kafka')
const { WATCH_TOPIC, TELL_TOPIC, TIME_OUT, NOT_READY, SUCCESS, FAIL } = require('./lib/config')
const SLEEP_SECONDS = 30

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function publishToWatch({ spec, startedAt, until, hearAt, attemptCount }) {
  await sleep(SLEEP_SECONDS * 1000)

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
  return new Promise((resolve, reject) => {
    const untilTime = moment(until)
    const diff = moment().diff(untilTime)
    const isTimedOut = diff > 0

    if (isTimedOut) {
      reject({ diff, status: TIME_OUT })
      return
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
  }
}

function performWatch({ spec, until, 'started-at': startedAt, 'hear-at': hearAt, 'attempt-count': attemptCount }) {
  const { namespace, deployment } = spec
  const howLongF = moment().diff(moment(startedAt), 's') / 60
  const howLong = _.round(howLongF, 1)

  checkTimeout(until)
    .then(() => assertStatusAsDesired(namespace, deployment))
    .then(() => publishToTell({ spec, howLong, hearAt, status: SUCCESS}))
    .catch(err => {
      if (_.isObject(err) && err.status === TIME_OUT) {
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
