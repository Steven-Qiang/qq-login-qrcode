# QQ-Qrcode-Login

基于 node.js 开发的 QQ 扫码登录模块

## Installing

Using npm:

```bash
$ npm install qq-qrcode-login
```

Using yarn:

```bash
$ yarn add qq-qrcode-login
```

## Example

```js
const login = require('qq-qrcode-login');
```

## API

##### getQrcode(appid)

```js
// 获取验证码和qrsig

// appid为QQ互联提供的appid
// 如QQ群网页管理的appid为 715030901
// 如要登录腾讯自家服务，请自行抓包获取

login.getQrcode(appid).then((ret) => {
  console.log('qrsig', ret.qrsig);
  console.log('二维码图片', ret.image);
});
```


##### getResult(qrsig, appid)

```js
// 获取状态的cookies

// qrsig参数来源于getQrcode(appid)
login.getQrcode(appid).then((ret) => {
  console.log('qrsig', ret.qrsig);
  console.log('二维码图片', ret.image);
});
```

## License

[MIT](LICENSE)