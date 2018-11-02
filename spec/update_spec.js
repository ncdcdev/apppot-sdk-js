describe('更新のテスト', function(){
  beforeEach(function(done){

    var self = this;

    var repeat = function(c, num){
      var str = '';
      for(var i = 0; i < num; i++){
        str += c;
      }
      return str;
    };

    var leftPad = function(str, num){
      return (repeat('0', num) + str).substr(-num);
    };

    this.numOfTask = 20;
    this.targetId = undefined;

    if (__karma__.config.login == 'anonymous') {
      AppPot.LocalAuthenticator.getAnonymousToken()
        .then(function(){
          return AppPot.dropAndCreateDatabase([
            TaskModel,
            PlaceModel
          ])
        })
        .then(function(){
          var models = [];
          for(var i = 0; i < self.numOfTask; i++){
            var index = leftPad(i+1, 2);
            models.push(
              new TaskModel({
                title: 'update_spec' + index,
                description: 'test-description' + index,
                limit: self.numOfTask-i,
                value: '12345678901234567890.123456789012345678'
              })
            );
          }
          var promise = TaskModel.insertAll(models);
          return promise
        })
        .then(function(models){
          self.targetId = models[0].get('objectId');
          done();
        });
    } else {
      AppPot.LocalAuthenticator.login(account.username, account.password)
        .then(function(){
          return AppPot.dropAndCreateDatabase([
            TaskModel,
            PlaceModel
          ])
        })
        .then(function(){
          var models = [];
          for(var i = 0; i < self.numOfTask; i++){
            var index = leftPad(i+1, 2);
            models.push(
              new TaskModel({
                title: 'update_spec' + index,
                description: 'test-description' + index,
                limit: self.numOfTask-i,
                value: '12345678901234567890.123456789012345678'
              })
            );
          }
          var promise = TaskModel.insertAll(models);
          return promise
        })
        .then(function(models){
          self.targetId = models[0].get('objectId');
          done();
        });
    }
  });

  it('modelインスタンスからレコードを更新できる(引数がhash)', function(done){
    var self = this;
    TaskModel.findById(this.targetId)
    .then(function(model){
      expect(model.get('objectId')).toBe(self.targetId);
      expect(model.get('title')).toBe('update_spec01');
      expect(model.get('description')).toBe('test-description01');
      expect(model.get('value')).toBe('12345678901234567890.123456789012345678');
      return model.update({
        title: 'updated title',
        description:'updated description',
        value: '98765432109876543210.876543210987654321'
      });
    }).then(function(model){
      expect(model.get('objectId')).toBe(self.targetId);
      expect(model.get('title')).toBe('updated title');
      expect(model.get('description')).toBe('updated description');
      expect(model.get('value')).toBe('98765432109876543210.876543210987654321');
      return TaskModel.findById(self.targetId);
    }).then(function(model){
      expect(model.get('objectId')).toBe(self.targetId);
      expect(model.get('title')).toBe('updated title');
      expect(model.get('description')).toBe('updated description');
      expect(model.get('value')).toBe('98765432109876543210.876543210987654321');
      done();
    }).catch(function(err){
      done.fail(JSON.stringify(err));
    });
  });

  it('modelインスタンスからレコードを更新できる(引数がkeyとvalue)', function(done){
    var self = this;
    TaskModel.findById(this.targetId)
    .then(function(model){
      expect(model.get('objectId')).toBe(self.targetId);
      expect(model.get('title')).toBe('update_spec01');
      expect(model.get('description')).toBe('test-description01');
      return model.update('description', 'updated description');
    }).then(function(model){
      expect(model.get('objectId')).toBe(self.targetId);
      expect(model.get('title')).toBe('update_spec01');
      expect(model.get('description')).toBe('updated description');
      return TaskModel.findById(self.targetId);
    }).then(function(model){
      expect(model.get('objectId')).toBe(self.targetId);
      expect(model.get('title')).toBe('update_spec01');
      expect(model.get('description')).toBe('updated description');
      done();
    }).catch(function(err){
      done.fail(JSON.stringify(err));
    });
  });
});
