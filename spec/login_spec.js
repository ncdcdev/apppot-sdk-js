describe('loginのテスト', function(){
  it('AnonymousTokenが取得できる', function(done){
    AppPot.LocalAuthenticator.getAnonymousToken()
    .then(function(token){
      expect(token).toMatch(/[0-9a-f]+/)
      done();
    });
  });

  it('正しいid/passの組み合わせでログインできる', function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(function(authInfo){
      expect(typeof authInfo).toBe('object')
      expect(AppPot.LocalAuthenticator.isLogined()).toBeTruthy()
      expect(authInfo.getToken()).toMatch(/[0-9a-f]+/)
      done();
    });
  });

  it('間違ったid/passの組み合わせでログインが失敗する', function(done){
    AppPot.LocalAuthenticator.login(account.username, 'wrongpassword')
    .catch(function(error){
      expect(error instanceof AppPot.Error).toBeTruthy()
      expect(error.code).toBe(111)
      done();
    });
  });
});
