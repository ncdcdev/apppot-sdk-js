describe('メール送信', function(){
  beforeEach(function(done){
    if (__karma__.config.login == 'anonymous') {
      AppPot.LocalAuthenticator.getAnonymousToken()
        .then(function(){
          done()
        });
    } else {
      AppPot.LocalAuthenticator.login(account.username, account.password)
        .then(function(){
          done();
        });
    }
  });

  it('メールが送信できる', function(done){
    var self = this;
    AppPot.sendMail('SES_TEST', 'satoshi.miyazaki@ncdc.co.jp', ['satoshi.miyazaki@ncdc.co.jp'], [], [], 'メール送信テスト', 'メール送信テストボディ(apppot-sdk-js)')
      .then(function(){
        done();
      }).catch(function(err){
        done.fail(JSON.stringify(err));
      });
  });
});
