describe('GatewayAPI', function(){
  beforeEach(function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(function(){
        done();
    });
  });

  const serviceName = 'mysql-service';
  const tableName = 'Building';

  it('postでデータを送信できる', function(done){
    var self = this;
    AppPot.Gateway.post(serviceName, tableName, null, {
      "BUILDINGID":"00001",
      "BUILDINGNAME":"NCDC00001",
      "CREATEDDATE":"2017/01/01 09:10",
      "UPDATEDATE":"2017/01/01 09:10"
    })
      .then(function(json){
        expect(json instanceof Object).toBeTruthy();
        return AppPot.Gateway.post(serviceName, tableName, null, {
          "BUILDINGID":"NCDC00001",
          "BUILDINGNAME":"NCDC00001",
          "CREATEDDATE":"2017/01/01 09:10",
          "UPDATEDATE":"2017/01/01 09:10"
        });
      }).then(function(json){
        expect(json instanceof Object).toBeTruthy();
        done();
      });
  });

  it('get jsonでデータが受け取れる(option未指定)', function(done){
    var self = this;
    AppPot.Gateway.get(serviceName, tableName, {
        "BUILDINGID":"NCDC00001",
      })
      .then(function(json){
        expect(json instanceof Object).toBeTruthy();
        done();
      });
  });

  it('get jsonでデータが受け取れる(option指定)', function(done){
    var self = this;
    AppPot.Gateway.get(serviceName, tableName, {
        "BUILDINGID":"NCDC00001",
      }, null, { original: false })
      .then(function(json){
        expect(json instanceof Object).toBeTruthy();
        done();
      });
  });

  it('get 連携先のデータそのまま', function(done){
    var self = this;
    AppPot.Gateway.get(serviceName, tableName, {
        "BUILDINGID":"NCDC00001",
      }, null, { original: true })
      .then(function(result){
        done();
      });
  });

  it('get select文を発行し、データを取得できる', function(done){
    var self = this;
    AppPot.Gateway.get(serviceName, 'query', {
      query: "select BUILDINGID, BUILDINGNAME from Building where BUILDINGNAME like 'NCDC%'"
    })
      .then(function(json){
        expect(json instanceof Object).toBeTruthy();
        done();
      });
  });

  it('putでデータを更新できる', function(done){
    var self = this;
    AppPot.Gateway.post(serviceName, tableName, null, {
      "BUILDINGID":"00002",
      "BUILDINGNAME":"NCDC00001",
      "CREATEDDATE":"2017/01/01 09:10",
      "UPDATEDATE":"2017/01/01 09:10"
    })
      .then(function(json){
        expect(json instanceof Object).toBeTruthy();
        return AppPot.Gateway.put(serviceName, tableName, {
          "BUILDINGID":"00002",
        }, {
          "BUILDINGNAME":"NCDC00002",
        });
      }).then(function(json){
        expect(json instanceof Object).toBeTruthy();
        return AppPot.Gateway.get(serviceName, tableName, {
          "BUILDINGID":"00002",
        });
      }).then(function(json){
        expect(json instanceof Object).toBeTruthy();
        expect(json['BUILDINGNAME']).toEqual('00002');
        done();
      });
  });

  it('removeで削除できる', function(done){
    var self = this;
    AppPot.Gateway.remove(serviceName, tableName, {
        "BUILDINGID":"NCDC00001",
    }).then(function(json){
        expect(json instanceof Object).toBeTruthy();
        done();
      });
  });
});
