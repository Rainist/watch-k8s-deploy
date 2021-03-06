'use strict'

const _ = require('lodash')
const moment = require('moment')
const { checkExist } = require('./lib/k8s')
const { produce } = require('./lib/kafka')
const { WATCH_TOPIC } = require('./lib/config')

function publish({ spec, howLong, hearAt }) {
  const attemptCount = 0

  const message = {
    spec,
    'hear-at': hearAt,
    'started-at': moment().toDate().getTime(),
    'until': moment().add(howLong, 'm').toDate().getTime(),
    'attempt-count': attemptCount
  }

  return produce(WATCH_TOPIC, message)
}

function listen(event, context) {
  const { data: body, extensions: { response: res } } = event
  const { spec, "how-long": howLong, "hear-at": hearAt } = body
  const { namespace, deployment } = spec

  checkExist(namespace, deployment)
    .then(() => publish({ spec, howLong, hearAt }))
    .then(() => res.status(200).end('Scheduled'))
    .catch(err => {
      if (err && err.code && err.code == 404) {
        res.status(404).end('Not Found')
        return
      }

      throw err
    })
    .catch(err => {
      console.error(err)
      res.status(500).end('Error')
    })
}

module.exports = { listen }
