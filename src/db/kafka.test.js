const kafka = require('./kafka');
describe('kafka test', function() {
  it('producer connect', async function() {
    this.timeout(Infinity);
    const producer = kafka.producer();
    await producer.connect();
  });
  it('send message', async function() {
    this.timeout(Infinity);
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'test',
      messages: [{ value: 'Hello KafkaJS user!' }],
    });
  });
});
