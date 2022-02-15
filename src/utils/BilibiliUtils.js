// https://www.zhihu.com/question/381784377/answer/1099438784

const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
const tr = table.split('').reduce((r, a, index) => {
  r[a] = index;
  return r;
}, {});
const s = [11, 10, 3, 8, 4, 6];
const xor = 177451812;
const add = 8728348608;

/**
 * bv -> av
 * @param bv
 * @returns {number}
 */
function decodeBv(bv) {
  let r = 0;
  for (let i = 0; i < 6; i++) {
    r += tr[bv[s[i]]] * 58 ** i;
  }
  return (r - add) ^ xor;
}

/**
 * av -> bv
 * @param av
 * @returns {string}
 */
function encodeAv(av) {
  const _av = (av ^ xor) + add;
  const r = 'BV1  4 1 7  '.split('');
  for (let i = 0; i < 6; i++) {
    r[s[i]] = table[Math.floor(_av / 58 ** i) % 58];
  }
  return r.join('');
}

module.exports = {
  decodeBv,
  encodeAv,
};
