describe('insertのテスト', function(){
  beforeEach(function(done){
    var models = [
      TaskModel,
      PlaceModel
    ];
    AppPot.LocalAuthenticator.login(account.username, account.password)
      .then(AppPot.dropAndCreateDatabase(models))
      .then(function(){
        done()
      });
  });

  it('新しいレコードを作成できる', function(done){
    var columns = {
      title: 'insert_spec',
      description: 'test-description',
      done: false,
      registeredDate: new Date()
    };
    TaskModel.insert(columns)
    .then(function(model){
      expect(model instanceof TaskModel).toBeTruthy();
      expect(model.get('objectId')).toMatch(/Task_[0-9a-f]+/);
      expect(model.get('title')).toEqual(columns.title);
      expect(model.get('description')).toEqual(columns.description);
      expect(model.get('serverUpdateTime') instanceof Date).toBeTruthy();
      expect(typeof model.get('done')).toBe('boolean');
      expect(model.get('registeredDate') instanceof Date).toBeTruthy();
      return model.objectId;
    })
    .then(function(objectId){
      return TaskModel.findById(objectId);
    })
    .then(function(model){
      expect(model instanceof TaskModel).toBeTruthy();
      expect(model.objectId).toMatch(/Task_[0-9a-f]+/);
      expect(model.title).toEqual(columns.title);
      expect(model.description).toEqual(columns.description);
      expect(model.serverUpdateTime instanceof Date).toBeTruthy();
      expect(typeof model.done).toBe('boolean');
      expect(model.registeredDate instanceof Date).toBeTruthy();
      done()
    })
    .catch(function(err){
      throw err;
    });
  });

  it('新しいレコードを複数同時に作成できる(modelの配列)', function(done){
    var models = [
      new TaskModel({
        title: 'insert_spec01',
        description: 'test-description01'
      }),
      new TaskModel({
        title: 'insert_spec02',
        description: 'test-description02'
      })
    ];
    TaskModel.insertAll(models)
    .then(function(_models){
      expect(_models instanceof Array).toBe(true);
      expect(_models.length).toBe(2);
      expect(_models[0] instanceof TaskModel).toBe(true);
      expect(_models[0].get('objectId')).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[0].get('title')).toEqual(models[0].title);
      // expect(_models[0].get('description')).toEqual(models[0].description);
      expect(_models[0].get('serverUpdateTime') instanceof Date).toBe(true);
      expect(_models[1] instanceof TaskModel).toBe(true);
      expect(_models[1].get('objectId')).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[1].get('title')).toEqual(models[1].title);
      // expect(_models[1].get('description')).toEqual(models[1].description);
      expect(_models[1].get('serverUpdateTime') instanceof Date).toBe(true);
    })
    .then(function(){
      return TaskModel.findAll();
    })
    .then(function(objects){
      var _models = objects['Task'];
      expect(_models instanceof Array).toBe(true);
      expect(_models.length).toBe(2);
      expect(_models[0] instanceof TaskModel).toBe(true);
      expect(_models[0].objectId).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[0].title).toEqual(models[0].title);
      // expect(_models[0].description).toEqual(models[0].description);
      expect(_models[0].serverUpdateTime instanceof Date).toBe(true);
      expect(_models[1] instanceof TaskModel).toBe(true);
      expect(_models[1].objectId).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[1].title).toEqual(models[1].title);
      // expect(_models[1].description).toEqual(models[1].description);
      expect(_models[1].serverUpdateTime instanceof Date).toBe(true);
      done()
    })
    .catch(function(err){
      throw err;
    });
  });

  it('新しいレコードを複数同時に作成できる(hashの配列)', function(done){
    var columns = [
      {
        title: 'insert_spec01',
        description: 'test-description01'
      },
      {
        title: 'insert_spec02',
        description: 'test-description02'
      }
    ];
    TaskModel.insertAll(columns)
    .then(function(_models){
      expect(_models instanceof Array).toBe(true);
      expect(_models.length).toBe(2);
      expect(_models[0] instanceof TaskModel).toBe(true);
      expect(_models[0].get('objectId')).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[0].get('title')).toEqual(columns[0].title);
      // expect(_models[0].get('description')).toEqual(columns[0].description);
      expect(_models[0].get('serverUpdateTime') instanceof Date).toBe(true);
      expect(_models[1] instanceof TaskModel).toBe(true);
      expect(_models[1].get('objectId')).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[1].get('title')).toEqual(columns[1].title);
      // expect(_models[1].get('description')).toEqual(columns[1].description);
      expect(_models[1].get('serverUpdateTime') instanceof Date).toBe(true);
    })
    .then(function(){
      return TaskModel.findAll();
    })
    .then(function(objects){
      var _models = objects['Task'];
      expect(_models instanceof Array).toBe(true);
      expect(_models.length).toBe(2);
      expect(_models[0] instanceof TaskModel).toBe(true);
      expect(_models[0].objectId).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[0].title).toEqual(columns[0].title);
      // expect(_models[0].description).toEqual(columns[0].description);
      expect(_models[0].serverUpdateTime instanceof Date).toBe(true);
      expect(_models[1] instanceof TaskModel).toBe(true);
      expect(_models[1].objectId).toMatch(/Task_[0-9a-f]+/);
      // expect(_models[1].title).toEqual(columns[1].title);
      // expect(_models[1].description).toEqual(columns[1].description);
      expect(_models[1].serverUpdateTime instanceof Date).toBe(true);
      done()
    })
    .catch(function(err){
      throw err;
    });
  });

  it('objectIdが重複する、複数の新しいレコードをinsertする時にエラーが起きる', function(done){
    var columns = [
      {
        objectId: 'Task_duplicatedobjectid',
        title: 'insert_spec01',
        description: 'test-description01'
      },
      {
        objectId: 'Task_duplicatedobjectid',
        title: 'insert_spec02',
        description: 'test-description02'
      }
    ];
    TaskModel.insertAll(columns)
    .then(function(_models){
      expect(_models instanceof Array).toBe(true);
      expect(_models.length).toBe(2);
      expect(_models[0] instanceof TaskModel).toBe(true);
      expect(_models[0].get('objectId')).toMatch(/Task_[0-9a-f]+/);
      expect(_models[0].get('title')).toEqual(columns[0].title);
      expect(_models[0].get('description')).toEqual(columns[0].description);
      expect(_models[0].get('serverUpdateTime') instanceof Date).toBe(true);
      expect(_models[1] instanceof TaskModel).toBe(true);
      expect(_models[1].get('objectId')).toMatch(/Task_[0-9a-f]+/);
      expect(_models[1].get('title')).toEqual(columns[1].title);
      expect(_models[1].get('description')).toEqual(columns[1].description);
      expect(_models[1].get('serverUpdateTime') instanceof Date).toBe(true);
    })
    .catch(function(err){
      done()
    });
  });
});
