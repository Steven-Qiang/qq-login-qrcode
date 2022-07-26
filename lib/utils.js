/**
 * @file: util.js
 * @description: util.js
 * @package: qq-login-qrcode
 * @create: 2022-07-26 08:48:54
 * @author: qiangmouren (2962051004@qq.com)
 * -----
 * @last-modified: 2022-07-26 09:45:43
 * -----
 */
function getQrToken(qrsig) {
  let hash = 0;
  for (let i = 0; i < qrsig.length; i++) {
    hash += (((hash << 5) & 2147483647) + qrsig[i].charCodeAt(0)) & 2147483647;
    hash &= 2147483647;
  }
  return hash & 2147483647;
}
function parseCookie(arr) {
  return arr.reduce((x, y) => {
    let [k, v] = y.split(';').shift().split('=');
    if (!v) return x;
    x[k.trim()] = v.trim();
    return x;
  }, {});
}
function parseParams(resp) {
  const params = /ptuiCB\('(.*?)'\)/.exec(resp.data)?.pop();
  if (!params) {
    throw new Error('cannot find ptuiCB callback function params');
  }
  let [code, , redirect] = params.replace(/', '/g, "','").split("','");
  code = parseInt(code, 10);
  return { code, redirect };
}

module.exports = {
  parseCookie,
  getQrToken,
  parseParams,
};
