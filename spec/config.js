window.AppPot = AppPotSDK.getService({
  url: 'http://trial-ec2a-01.apppot.net/apppot20161007/',
  appId: 'jp.co.ncdc.sdk',
  appKey: '93df59e1b5334dedae76ba1942548528',
  appVersion: '1.0.0',
  companyId: 7,
});

window.account = {
  userId: 49,
  username: 'jssdk0001',
  password: 'aaaa'
};

window.testGroup = {
  id: 47,
  name: 'jssdk',
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
