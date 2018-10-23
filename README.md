# AppPot SDK for JavaScript

[![NPM](https://nodei.co/npm/apppot-sdk.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/apppot-sdk/)

[![npm version](https://badge.fury.io/js/apppot-sdk.svg)](https://badge.fury.io/js/apppot-sdk)

AppPot SDK for JavaScript.

## Getting Started

### インストール
ブラウザ上で利用する場合は、以下のタグをHTMLに追記して下さい。

```html
<script src="https://cdn.rawgit.com/NCDCHub/apppot-sdk-js/v2.3/dist/apppot.min.js"></script>
```
  

Webpackなどの、Node.jsのビルドシステムで利用する場合は、[npm](http://npmjs.org)で以下の様にインストールしてください。

```sh
npm install apppot-sdk
```

### 設定
以下の様に、接続設定をします。
url, appId, appKey, appVersion, companyidは、ご利用になるAppPotサーバーの管理コンソール上で設定したものを使用します。

```javascript
var window.AppPot = AppPotSDK.getService({
  url: 'http://example.com/apppot/',
  appId: 'apppot-test-app',
  appKey: '1234567890abcdef1234567890abcdef',
  appVersion: '1.0.0',
  companyId: 1,
});
```

### モデル定義
アプリケーションで使用するモデルを定義します。
ここで定義したモデルを元に、サーバーのデータベース上にテーブルが生成されます。

```javascript
window.Models = {
  Customer: AppPot.defineModel('Customer', {
    'name': {
      type: AppPot.DataType.Varchar
    },
    'address': {
      type: AppPot.DataType.Varchar,
      length: 255
    },
    'age': {
      type: AppPot.DataType.Long
    },
    'birthday': {
      type: AppPot.DataType.DateTime
    },
    'isHuman': {
      type: AppPot.DataType.Bool
    }
  }),
  Item: AppPot.defineModel('Item', {
    'name': {
      type: AppPot.DataType.Varchar
    },
    'description': {
      type: AppPot.DataType.Varchar
    },
  }),
  ...
};
```

### データベースの作成
先程定義したモデルを使って、テーブルを生成します。

```javascript
AppPot.createDatabase(Object.values(window.Models))
  .then(()=>{
    console.log('database is created!!');
  });
```

### 終わり
ここまでで、AppPotSDKを利用する準備ができました。


## 詳細
詳しい利用方法などは以下を参照してください。
[http://docs.apppot.jp/apppot/sdk-javascript.html](http://docs.apppot.jp/apppot/sdk-javascript.html)


## License

This SDK is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
