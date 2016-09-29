describe('Modelのテスト', function(){
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

    this.numOfPlace = 5;
    this.numOfTask = 20;
    this.placeIds = [];

    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(function(){
      return AppPot.dropAndCreateDatabase([
        TaskModel,
        PlaceModel
      ])
    })
    .then(function(){
      var models = [];
      for(var i = 0; i < self.numOfPlace; i++){
        var index = leftPad(i+1, 2);
        models.push(
          new PlaceModel({
            zipcode: 'zip--' + index,
            address: 'address:' + index,
          })
        );
      }
      var promise = PlaceModel.insertAll(models);
      return promise
    })
    .then(function(models){
      models.forEach(function(model){
        self.placeIds.push(model.get('objectId'));
      });
    })
    .then(function(){
      var models = [];
      for(var i = 0; i < self.numOfTask; i++){
        var index = leftPad(i+1, 2);
        models.push(
          new TaskModel({
          title: 'model_spec' + index,
          description: 'test-descriptions' + index,
          limit: self.numOfTask-i,
          placeId: self.placeIds[i%self.numOfPlace]
          })
        );
      }
      var promise = TaskModel.insertAll(models);
      return promise
    })
    .then(function(models){
      self.testTarget = models[self.numOfTask-1];
      done();
    });
  });

  it('modelのプロパティとして、カラムの値を取得できる', function(done){
    var self = this;
    TaskModel.findById(self.testTarget.objectId)
    .then(function(model){
      expect(model.objectId).toBe(self.testTarget.get('objectId'));
      expect(model.title).toBe(self.testTarget.get('title'));
      expect(model.description).toBe(self.testTarget.get('description'));
      expect(model.registeredDate instanceof Date).toBeTruthy();
      done();
    });
  });

  it('findAllですべてのレコードを取得できる', function(done){
    var self = this;
    TaskModel.findAll().then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      done();
    });
  });

  it('インスタンスメソッドのinsertからinsertできる', function(done){
    var self = this;
    var task = new TaskModel({
      title: 'save title',
      limit: 10000
    });
    task.description = 'save description';
    expect(task.isNew()).toBeTruthy();
    task.insert().then(function(model){
      expect(model.objectId).toMatch(/Task_[0-9a-f]+/);
      expect(model.isNew()).not.toBeTruthy();
      expect(model.title).toBe('save title');
      expect(model.description).toBe('save description');
      expect(task.objectId).toMatch(/Task_[0-9a-f]+/);
      expect(task.isNew()).not.toBeTruthy();
      expect(task.title).toBe('save title');
      expect(task.description).toBe('save description');
      return TaskModel.findById(model.objectId);
    }).then(function(model){
      expect(model.isNew()).not.toBeTruthy();
      expect(model.title).toBe('save title');
      expect(model.description).toBe('save description');
      done();
    });
  });

  it('createでもupdateでもsaveメソッドで出来る', function(done){
    var self = this;
    var objectId;
    var task = new TaskModel({
      title: 'save title',
      description: 'save description',
      limit: 10000
    });
    expect(task.isNew()).toBeTruthy();
    task.save().then(function(model){
      objectId = model.objectId;
      expect(task.objectId).toBe(objectId);
      expect(model.isNew()).not.toBeTruthy();
      expect(model.title).toBe('save title');
      expect(task.isNew()).not.toBeTruthy();
      expect(task.title).toBe('save title');
      return model.save({
        title: 'updated title'
      });
    })
    .then(function(model){
      expect(model.objectId).toBe(objectId);
      expect(model.isNew()).not.toBeTruthy();
      expect(model.title).toBe('updated title');
      expect(task.objectId).toBe(objectId);
      expect(task.isNew()).not.toBeTruthy();
      expect(task.title).toBe('updated title');
      done();
    });
  });

});
