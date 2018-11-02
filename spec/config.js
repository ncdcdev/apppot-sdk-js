window.AppPot = AppPotSDK.getService({
  url: 'http://trial.apppot.net/apppotv4/',
  appId: 'jp.co.ncdc.sdk',
  appKey: 'b8f7bcd6dd394d57bb9d34e31b8002e3',
  appVersion: '1.0.0',
  companyId: 1,
});

window.account = {
  username: 'jssdk0003',
  password: 'aaaa'
};

window.testGroup = {
  id: 2,
  name: 'testgroup1',
  description: 'oyp00vbye9jsnnzr'
};

window.TaskModel = AppPot.defineModel('Task', {
    'title': {
      type: AppPot.DataType.Varchar,
      length: 100,
    },
    'description': {
      type: AppPot.DataType.Text,
      length: 255
    },
    'limit': {
      type: AppPot.DataType.Long
    },
    'num': {
      type: AppPot.DataType.Integer
    },
    'value': {
      type: AppPot.DataType.Decimal
    },
    'placeId': {
      type: AppPot.DataType.Varchar
    },
    'done': {
      type: AppPot.DataType.Bool
    },
    'registeredDate': {
      type: AppPot.DataType.DateTime
    },
    'scopeType': {
      type: AppPot.Model.ScopeType.All
    },
    'testMethod': function(arg1) {
      return this.limit + '-' + this.num + '-' + arg1;
    }
  }
);

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
