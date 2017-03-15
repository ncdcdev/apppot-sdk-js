describe('複数取得のテスト', function(){
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
            title: 'select_spec' + index,
            description: 'test-descriptions' + index,
            limit: self.numOfTask-i,
            placeId: self.placeIds[i%self.numOfPlace]
          })
        )
      }
      var promise = TaskModel.insertAll(models);
      return promise
    })
    .then(function(models){
      done();
    });
  });

  it('条件無しですべてのレコードを取得できる', function(done){
    var self = this;
    TaskModel.select().findList().then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      done();
    });
  });

  it('orderを指定したfindOneで順序どおりの最初の一件が取得できる', function(done){
    var self = this;
    TaskModel.select().orderBy('#Task.limit').findOne().then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof TaskModel).toBeTruthy();
      expect(models['Task'].title).toBe('select_spec'+self.numOfTask);
      done();
    });
  });

  it('where条件を指定して、レコードを取得できる', function(done){
    var limitCondition = 5;
    TaskModel.select()
    .where('#Task.limit <= ?', limitCondition)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(limitCondition);
      done();
    });
  });

  it('joinを指定して、複数テーブルのレコードを取得できる', function(done){
    var self = this;
    TaskModel.select()
    .join(PlaceModel, '#Place.objectId = #Task.placeId')
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      expect(models['Place'] instanceof Array).toBeTruthy();
      expect(models['Place'].length).toBe(self.numOfTask);
      for(var i = 0; i < self.numOfTask; i++){
        expect(models['Task'][i].get('placeId')).toBe(models['Place'][i].get('objectId'));
      }
      done();
    });
  });

  it('whereとjoinを指定して、複数テーブルのレコードを取得できる', function(done){
    var self = this;
    var limitCondition = 5;
    TaskModel.select()
    .join(PlaceModel, '#Place.objectId = #Task.placeId')
    .where('#Task.limit <= ?', limitCondition)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(limitCondition);
      expect(models['Place'] instanceof Array).toBeTruthy();
      expect(models['Place'].length).toBe(limitCondition);
      for(var i = 0; i < limitCondition; i++){
        expect(models['Task'][i].get('placeId')).toBe(models['Place'][i].get('objectId'));
      }
      done();
    });
  });

  it('joinでaliasを指定できる', function(done){
    var self = this;
    var limitCondition = 5;
    TaskModel.select()
    .join(PlaceModel, {alias:'p'}, '#p.objectId = #Task.placeId')
    .where('#Task.limit <= ?', limitCondition)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(limitCondition);
      expect(models['p'] instanceof Array).toBeTruthy();
      expect(models['p'].length).toBe(limitCondition);
      for(var i = 0; i < limitCondition; i++){
        expect(models['Task'][i].get('placeId')).toBe(models['p'][i].get('objectId'));
      }
      done();
    });
  });

  it('orderByを使用し、整列されたレコードを取得できる(順序未指定)', function(done){
    var self = this;
    TaskModel.select()
    .orderBy('#Task.limit')
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      var lastLimitVal = models['Task'][0].get('limit');
      for(var i = 1; i < self.numOfTask; i++){
        var currentLimitVal = models['Task'][i].get('limit');
        expect(currentLimitVal).toBeGreaterThan(lastLimitVal);
        lastLimitVal = currentLimitVal;
      }
      done();
    });
  });

  it('orderByを使用し、整列されたレコードを取得できる(desc)', function(done){
    var self = this;
    TaskModel.select()
    .orderBy('#Task.limit', AppPot.Model.Order.desc)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(self.numOfTask);
      var lastLimitVal = models['Task'][0].get('limit');
      for(var i = 1; i < self.numOfTask; i++){
        var currentLimitVal = models['Task'][i].get('limit');
        expect(currentLimitVal).toBeLessThan(lastLimitVal);
        lastLimitVal = currentLimitVal;
      }
      done();
    });
  });

  it('limitでレコード数を制限して取得できる', function(done){
    var self = this;
    var limit = 8;
    TaskModel.select()
    .limit(limit)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(limit);
      done();
    });
  });

  it('orderByとlimitで指定した順序で、レコード数を制限して取得できる', function(done){
    var self = this;
    var limit = 9;
    TaskModel.select()
    .limit(limit)
    .orderBy('#Task.limit', AppPot.Model.Order.asc)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(limit);
      expect(models['Task'][0].get('limit')).toBe(1);
      done();
    });
  });

  it('orderByとoffsetを指定したlimitで指定した順序で、レコード数を制限して取得できる', function(done){
    var self = this;
    var limit = 9;
    var offset = 10
    TaskModel.select()
    .limit(limit, offset)
    .orderBy('#Task.limit', AppPot.Model.Order.asc)
    .findList()
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(limit);
      expect(models['Task'][0].get('limit')).toBe(offset + 1);
      done();
    });
  });
});
