const AppPotSDK = require('./dist/apppot.js');

console.log(AppPotSDK);

const AppPot = AppPotSDK.getService({
  url: 'http://trial-ec2a-01.apppot.net/apppot/',
  appId: 'jp.co.ncdc.sdk',
  appKey: '10fcdcde414145f18d890518d0333607',
  appVersion: '1.0.0',
  companyId: 4,
});

console.log(AppPot.getBuildDate());
console.log(AppPot.getVersion());
