describe('logoutのテスト', function(){
  beforeEach(function(done){
    if (__karma__.config.login == 'anonymous') {
      AppPot.LocalAuthenticator.getAnonymousToken()
        .then(function(){
          done()
        });
    } else {
      AppPot.LocalAuthenticator.login(account.username, account.password)
        .then(function(){
          done()
        });
    }
  });

  it('ログアウト後に、認証に必要なAPI呼び出しに失敗する', function(done){
    var models = [
      TaskModel,
      PlaceModel
    ];
    AppPot.createDatabase(models).then(function(res){
      expect(typeof res).toEqual('object');
      expect(res.status).toEqual('OK');
      return AppPot.LocalAuthenticator.logout();
    }).then(function(){
      return AppPot.createDatabase(models)
    }).catch(function(error){
      expect(error instanceof AppPot.Error).toBeTruthy();
      expect(error.code).toBe(121);
      done();
    });
  });
});
