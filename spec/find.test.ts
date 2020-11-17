import {
  AppPot,
  TaskModel,
  PlaceModel,
  account
} from './config'

describe('単件取得のテスト', function(){
  beforeEach(function(done){
    var self = this;
    var models = [
      TaskModel,
      PlaceModel
    ];
    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(() => AppPot.dropAndCreateDatabase(models))
    .then(function(){
      self.columns = {
        title: 'find_spec',
        description: 'test-description',
        num: 2,
        done: false,
        registeredDate: new Date()
      };
      var promise = TaskModel.insert(self.columns);
      return promise
    })
    .then(function(model){
        self.objectId = model.get('objectId');
        done();
    });
  });

  it('idで一件のレコードを取得できる', function(done){
    var self = this;
    TaskModel.findById(this.objectId)
    .then(function(model){
      expect(model.get('objectId')).toBe(self.objectId);
      expect(typeof model.title).toBe('string');
      expect(model.get('title')).toBe(self.columns['title']);
      expect(typeof model.description).toBe('string');
      expect(model.get('description')).toBe(self.columns['description']);
      expect(typeof model.num).toBe('number');
      expect(model.get('num')).toBe(self.columns['num']);
      expect(typeof model.done).toBe('boolean');
      expect(model.get('done')).toBe(self.columns['done']);
      expect(model.registeredDate instanceof Date).toBeTruthy();
      expect(model.get('registeredDate').getTime()).toBe(self.columns['registeredDate'].getTime());
      done();
    });
  });

  it('modelのプロパティとして、カラムの値を取得できる', function(done){
    var self = this;
    TaskModel.findById(this.objectId)
    .then(function(model){
      expect(model.objectId).toBe(self.objectId);
      expect(model.title).toBe(self.columns['title']);
      expect(model.description).toBe(self.columns['description']);
      expect(model.done).toBe(self.columns['done']);
      expect(model.registeredDate.getTime()).toBe(self.columns['registeredDate'].getTime());
      done();
    });
  });
});
