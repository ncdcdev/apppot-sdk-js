describe('削除のテスト', function(){
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
    this.targetModel = undefined;

    if (__karma__.config.login == 'anonymous') {
      AppPot.LocalAuthenticator.getAnonymousToken()
        .then(function(){
          return AppPot.dropAndCreateDatabase([
            TaskModel,
            PlaceModel
          ]);
        })
        .then(function(result){
          var models = [];
          for(var i = 0; i < self.numOfTask; i++){
            var index = leftPad(i+1, 2);
            models.push(
              new TaskModel({
                title: 'remove_spec' + index,
                description: 'test-description' + index,
                limit: self.numOfTask-i
              })
            );
          }
          var promise = TaskModel.insertAll(models);
          return promise
        })
        .then(function(models){
          self.targetId = models[0].get('objectId');
          self.targetModel = models[0];
          done();
        });
    } else {
      AppPot.LocalAuthenticator.login(account.username, account.password)
        .then(function(){
          return AppPot.dropAndCreateDatabase([
            TaskModel,
            PlaceModel
          ]);
        })
        .then(function(result){
          var models = [];
          for(var i = 0; i < self.numOfTask; i++){
            var index = leftPad(i+1, 2);
            models.push(
              new TaskModel({
                title: 'remove_spec' + index,
                description: 'test-description' + index,
                limit: self.numOfTask-i
              })
            );
          }
          var promise = TaskModel.insertAll(models);
          return promise
        })
        .then(function(models){
          self.targetId = models[0].get('objectId');
          self.targetModel = models[0];
          done();
        });
    }
  });

  it('指定したIDのレコードを削除できる', function(done){
    var self = this;
    TaskModel.findAll().then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      return TaskModel.removeById(self.targetId)
    }).then(function(){
      return TaskModel.findAll();
    }).then(function(models){
        expect(models instanceof Object).toBeTruthy();
        expect(models['Task'] instanceof Array).toBeTruthy();
        expect(models['Task'].length).toBe(self.numOfTask - 1);
        done();
    });
  });

  it('modelインスタンスからレコードを削除できる', function(done){
    var self = this;
    TaskModel.findAll().then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      return TaskModel.findById(self.targetId);
    }).then(function(model){
      return model.remove();
    }).then(function(){
      return TaskModel.findAll();
    }).then(function(models){
        expect(models instanceof Object).toBeTruthy();
        expect(models['Task'] instanceof Array).toBeTruthy();
        expect(models['Task'].length).toBe(self.numOfTask - 1);
        done();
    });
  });
});
