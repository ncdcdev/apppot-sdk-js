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

    user.create().then(function(user){
      expect(user instanceof AppPot.User).toBeTruthy();
      expect(user.groupsRoles instanceof Array).toBeTruthy();
      expect(user.groupsRoles[0] instanceof AppPot.GroupsRoles).toBeTruthy();
      expect(user.groupsRoles[0].groupId).toEqual(gr.groupId);
      expect(user.groupsRoles[0].groupName).toEqual(gr.groupName);
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
        console.log(users[0].groupsRoles[0]);
        expect(users instanceof Array).toBeTruthy();
        expect(users[0] instanceof AppPot.User).toBeTruthy();
        expect(users[0].groupsRoles instanceof Array).toBeTruthy();
        expect(users[0].groupsRoles[0] instanceof AppPot.GroupsRoles).toBeTruthy();
        expect(users[0].groupsRoles[0].groupId).toEqual(groupId);
        expect(users[0].groupsRoles[0].groupName).toEqual('group001');
        expect(users[0].groupsRoles[0].roleName).toEqual('User');
        done();
      });
  });
});
