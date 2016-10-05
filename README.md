# AppPot SDK for JavaScript

[![NPM](https://nodei.co/npm/apppot-sdk.svg?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/apppot-sdk/)
[![npm version](https://badge.fury.io/js/apppot-sdk.svg)](https://badge.fury.io/js/apppot-sdk)

AppPot SDK for JavaScript, available for browsers and smart devices, or Node.js.

## How to Use

1. To use the SDK in the browser, add the following script tag to your HTML page

```html
<script src="https://raw.githubusercontent.com/NCDCHub/apppot-sdk-js/master/dist/apppot.js"></script>
```
  
To use in the Node.js, use the [npm](http://npmjs.org) package manager. Type the following into a terminal.

```sh
npm install apppot-sdk
```

2. As follows, configure the connection destination and apps information like following.
(`url`, `appId`, `appKey`, `appVersion`, `companyId` and `groupId` should be set a value corresponding to the environment.)

```javascript
var window.AppPot = AppPotSDK.getService({
  url: 'http://example.com/apppot/',
  appId: 'apppot-test-app',
  appKey: '1234567890abcdef1234567890abcdef',
  appVersion: '1.0.0',
  companyId: 1,
  groupId: 1
});
```

3. Define models for your App.

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

4. Create DataBase for your App.

```javascript
AppPot.createDatabase(Object.values(window.Models))
  .then(()=>{
    console.log('database is created!!');
  });
```
  
## Other API or usage
You can find a documents at:  
http://docs.apppot.jp/apppot/index.html


## License

This SDK is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)