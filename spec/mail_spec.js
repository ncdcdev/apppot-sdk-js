describe('メール送信', function(){
  beforeEach(function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(function(){
        done();
    });
  });

  it('メールが送信できる', function(done){
    var self = this;
    AppPot.sendMail('SES_TEST', 'kano@ncdc.co.jp', ['kano@ncdc.co.jp'], [], [], 'メール送信テスト', 'メール送信テストボディ(apppot-sdk-js)')
      .then(function(){
        done();
      }).catch(function(err){
        done.fail(JSON.stringify(err));
      });
  });
});
