window.AppPot = AppPotSDK.getService({
  url: 'http://trial-ec2a-01.apppot.net/apppot/',
  appId: 'jp.co.ncdc.sdk',
  appKey: '10fcdcde414145f18d890518d0333607',
  appVersion: '1.0.0',
  companyId: 4,
});

window.account = {
  userId: 205,
  username: 'user001',
  password: 'aaaa'
};

window.TaskModel = AppPot.defineModel('Task', {
  'title': {
    type: AppPot.DataType.Varchar,
    length: 100,
  },
  'description': {
    type: AppPot.DataType.Varchar,
    length: 255
  },
  'limit': {
    type: AppPot.DataType.Long
  },
  'num': {
    type: AppPot.DataType.Integer
  },
  'placeId': {
    type: AppPot.DataType.Varchar
  },
  'done': {
    type: AppPot.DataType.Bool
  },
  'registeredDate': {
    type: AppPot.DataType.DateTime
  }
});

window.PlaceModel = AppPot.defineModel('Place', {
  'zipcode': {
    type: AppPot.DataType.Varchar,
    length: 7
  },
  'address': {
    type: AppPot.DataType.Varchar,
    length: 255
  }
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
