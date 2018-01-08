'use strict'

const _ = require('lodash')
const Kafka = require('node-rdkafka')
const kafkaPort = process.env.KAFKA_BROKCER_PORT || 9092
const kafkaHost = process.env.KAFKA_BROCKER_HOST || 'broker.kubeless'

function produce(topic, message) {
  const stringifiedMsg = _.isObject(message) ? JSON.stringify(message) : _.toString(message)
  const bufferedMsg = new Buffer(stringifiedMsg)

  return new Promise((resolve, reject) => {
    const producer = new Kafka.Producer({
      'metadata.broker.list': `${kafkaHost}:${kafkaPort}`,
      'dr_cb': true
    })

    producer.connect()

    producer.on('ready', () => {
      try {
        const result = producer.produce(
          topic,
          null,
          bufferedMsg,
          '',
          Date.now()
        )
        resolve(result)
      }
      catch (err) {
        console.warn(err)
        reject(err)
      }
    })

    producer.on('event.error', err => {
      console.warn(err)
      reject(err)
    })
  })
}

module.exports = { produce }