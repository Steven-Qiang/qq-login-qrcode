/**
 * @file: index.js
 * @description: index.js
 * @package: qq-qrcode-login
 * @create: 2022-07-26 08:31:22
 * @author: qiangmouren (2962051004@qq.com)
 * -----
 * @last-modified: 2022-07-26 09:16:50
 * -----
 */

const { default: axios } = require('axios');
const { parseCookie, getQrToken, parseParams } = require('./utils');

const instance = axios.create({
  validateStatus: null,
  headers: {
    referer: 'http://m.qzone.com/infocenter?g_f=',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
  },
});
const msg_of_code = {
  65: '登录二维码已失效，请刷新重试！',
  66: '请使用手机QQ扫码登录',
  67: '正在验证二维码',
};

/**
 * @description 获取二维码
 * @author qiangmouren
 * @param {string} appid appid
 * @return {Promise<{qrsig:string,image:string}>}
 */
async function getQrcode(appid) {
  if (!appid) throw new Error('params appid required');
  const resp = await instance.get('https://ssl.ptlogin2.qq.com/ptqrshow', {
    params: {
      appid,
      l: 'M',
      s: '5',
      t: Date.now(),
    },
    responseType: 'arraybuffer',
  });
  if (!resp.headers['set-cookie']?.length) {
    throw new Error('cannot find set-cookie field');
  }
  const { qrsig } = parseCookie(resp.headers['set-cookie']);
  return {
    qrsig,
    image: 'data:image/png;base64,' + resp.data.toString('base64'),
  };
}

/**
 * @description 获取登录状态和结果
 * @author qiangmouren
 * @param {string} qrsig getQrcode返回的qrsig
 * @param {string} appid appid
 * @return {Promise<{code:number,cookies:any,uin:string,msg:string}>}
 */
async function getResult(qrsig, appid) {
  if (!qrsig) throw new Error('params qrsig required');
  if (!appid) throw new Error('params appid required');
  const resp = await instance.get('https://ssl.ptlogin2.qq.com/ptqrlogin', {
    params: {
      u1: 'https://qun.qq.com/member.html',
      ptqrtoken: getQrToken(qrsig).toString(),
      ptredirect: '1',
      from_ui: '1',
      ptlang: '2052',
      action: `0-0-${Date.now()}`,
      pt_uistyle: '40',
      aid: appid,
      has_onekey: '1',
    },
    headers: { cookie: `qrsig=${qrsig}` },
  });

  const { code, redirect } = parseParams(resp);
  if (msg_of_code[code]) {
    return {
      code,
      msg: msg_of_code[code],
    };
  }

  if (code == 0) {
    const uin = /uin=(\d+)&/.exec(resp.data)?.pop();
    const cookies = {
      ...(await parseCookie(resp.headers['set-cookie'])),
      ...(await getOtherCookie(redirect)),
    };
    return {
      code,
      uin,
      cookies,
      msg: '登录成功',
    };
  }

  return {
    code,
    msg: '未知状态',
  };
}

async function getOtherCookie(redirect) {
  const resp = await instance.get(redirect, { maxRedirects: 0 });
  if (!resp.headers['set-cookie']?.length) {
    throw new Error('cannot find set-cookie field');
  }
  return parseCookie(resp.headers['set-cookie']);
}

module.exports = {
  getQrcode,
  getResult,
};
