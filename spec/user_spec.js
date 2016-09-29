describe('User管理APIのテスト', function(){
  beforeEach(function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
      .then(function(){
        done();
      });
  });

  afterEach(function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
      .then(function(){
        done();
      });
  });

  function randomString(len){
    var c = "abcdefghijklmnopqrstuvwxyz0123456789";
    var cl = c.length;
    var r = "";
    for(var i=0; i<len; i++){
      r += c[Math.floor(Math.random()*cl)];
    }
    return r;
  }

  it('ユーザーを作成できる', function(done){

    var gr = AppPot.getUser().groupsRoles[0];
    var user = new AppPot.User({
      account: randomString(16),
      firstName: 'test',
      lastName: 'account',
      password: 'wohafdslkj',
      groupsRoles: new AppPot.GroupsRoles({
        groupId: gr.groupId,
        role: AppPot.Role.User
      })
    });

    user.create().then(function(){
      return AppPot.LocalAuthenticator.logout();
    }).then(function(){
      return AppPot.LocalAuthenticator.login(
        user.account, user.password
      );
    }).then(function(){
      done();
    });
  });

  it('ユーザー一覧を取得できる', function(done){
    var groupId = AppPot.getUser().groupsRoles[0].groupId;
    AppPot.User.list(groupId)
      .then(function(users){
        expect(users instanceof Array).toBeTruthy();
        expect(users[0] instanceof AppPot.User).toBeTruthy();
        done();
      });
  });
});
