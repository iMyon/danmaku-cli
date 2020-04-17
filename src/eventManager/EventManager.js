const EventEmitter = require('events');
const kafka = require('../db/kafka');

const producer = kafka.producer();
class EventManager extends EventEmitter {}

const eventManager = new EventManager();
eventManager.on('season', async (id, season) => {
  await producer.connect();
  await producer.send({
    topic: 'danmaku-project-season',
    messages: [
      {
        key: id,
        value: JSON.stringify({
          id,
          season,
        }),
      },
    ],
  });
});
eventManager.on('av', async (id, detail, parts) => {
  await producer.connect();
  await producer.send({
    topic: 'danmaku-project-av',
    messages: [
      {
        key: id,
        value: JSON.stringify({
          id,
          detail,
          parts,
        }),
      },
    ],
  });
});
eventManager.on('comment', async (id, vid, xml, ass) => {
  await producer.connect();
  await producer.send({
    topic: 'danmaku-project-comment',
    messages: [
      {
        key: id.toString(),
        value: JSON.stringify({
          id,
          vid,
          xml,
          ass,
        }),
      },
    ],
  });
});

module.exports = eventManager;
