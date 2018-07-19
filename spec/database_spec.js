describe('createDatabaseのテスト', function(){
  beforeEach(function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
      .then(function(){
        done()
      });
  });

  it('新しいスキーマを作成できる', function(done){

    var models = [
      TaskModel,
      PlaceModel
    ];
    AppPot.createDatabase(models).then(function(res){
      expect(typeof res).toEqual('object');
      expect(res.status).toEqual('OK');
      done();
    });
  });

  it('予約語のカラム名を含むテーブルを定義できない', function(){
    expect(function(){
      AppPot.defineModel('Test', {
        'insert': {
          type: AppPot.DataType.Varchar,
          length: 255
        },
        'aaaaa': {
          type: AppPot.DataType.Varchar,
          length: 255
        }
      });
    }).toThrow();
  });

  it('テーブルの中身をリセットして新しいスキーマを作成できる', function(done){
    var columns = {
      title: 'test-title',
      description: 'test-description'
    };
    AppPot.createDatabase([
      TaskModel,
      PlaceModel
    ]).then(function(res){
      expect(typeof res).toEqual('object');
      expect(res.status).toEqual('OK');
    })
    .then(function(){
      return TaskModel.insert(columns)
    })
    .then(function(model){
      expect(model instanceof TaskModel).toBe(true);
      expect(model.get('objectId')).toMatch(/Task_[0-9a-f]+/);
      expect(model.get('title')).toEqual(columns.title);
      expect(model.get('description')).toEqual(columns.description);
      expect(typeof model.get('serverUpdateTime')).toEqual('string');
    })
    .then(function(){
      return AppPot.dropAndCreateDatabase([
        TaskModel,
        PlaceModel
      ])
    })
    .then(function(res){
      expect(typeof res).toEqual('object');
      expect(res.status).toEqual('OK');
    })
    .then(function(){
      return TaskModel.select().findList();
    })
    .then(function(models){
      expect(models instanceof Object).toBeTruthy();
      expect(models['Task'] instanceof Array).toBeTruthy();
      expect(models['Task'].length).toBe(0);
      done();
    }).catch(function(err){
      done.fail(JSON.stringify(err));
    });
  });
});
