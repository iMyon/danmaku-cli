const assert = require('assert');
const { encodeAv, decodeBv } = require('../../src/utils/BilibiliUtils');

describe('BilibiliUtils', function() {
  it('encodeAv', async function() {
    assert.strictEqual(encodeAv(789232), 'BV1Ws411o7h3');
  });

  it('decodeBv', async function() {
    assert.strictEqual(decodeBv('BV1Ws411o7h3'), 789232);
  });

  it('decodeBv(encodeAv(x)) === x', async function() {
    console.log(789232);
    const av = 170001;
    assert.strictEqual(decodeBv(encodeAv(av)), av);
  });
});
