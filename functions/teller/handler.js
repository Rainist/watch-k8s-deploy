'use strict'

const _ = require('lodash')
const rp = require('request-promise')

function tell(context) {
  let message = null
  try {
    message = JSON.parse(context)
  }
  catch (e) {
    console.warn(e)
  }

  if (message) {
    performTell(message)
  }
  else {
    console.warn("Couldn't parse context:", context)
  }
}

function performTell({ status, spec, 'how-long': howLong, 'hear-at': hearAt }) {
  //TODO: actually respond
  const body = {
    status, spec,
    'how-long': howLong,
  }

  const options = {
    method: 'POST',
    uri: hearAt,
    json: true,
    body,
  }

  rp(options)
    .then(parsedBody => console.log('response:', parsedBody))
    .catch(err => console.warn('err:', err))
}

module.exports = { tell }
