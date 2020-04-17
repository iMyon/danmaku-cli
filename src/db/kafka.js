const { Kafka } = require('kafkajs');
const config = require('../config/index');

const kafka = new Kafka({
  clientId: 'danmaku-project',
  brokers: [config.kafkaHost],
});

module.exports = kafka;
