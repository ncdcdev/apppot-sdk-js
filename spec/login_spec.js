describe('loginのテスト', function(){
  var anonymousUser = null;

  it('AnonymousTokenが取得できる', function(done){
    AppPot.LocalAuthenticator.getAnonymousToken()
    .then(function(authInfo){
      anonymousUser = authInfo.getAnonymousUser();
      expect(authInfo.getToken()).toMatch(/[0-9a-f]+/)
      expect(anonymousUser.groupsRoles[0].roleName).toEqual("Anonymous User")
      expect(anonymousUser.groupsRoles[0].roleId).toEqual(6)
      done();
    });
  });

  it('AnonymousTokenでログアウトできる', function(done){
    AppPot.LocalAuthenticator.logout()
    .then(function(authInfo){
      expect(authInfo.getToken()).toEqual("")
      done();
    })
  });

  it('accountを指定して同じアカウントのAnonymousTokenが取得できる', function(done){
    AppPot.LocalAuthenticator.getAnonymousToken(anonymousUser.account)
    .then(function(authInfo){
      expect(authInfo.getAnonymousUser().account).toEqual(anonymousUser.account)
      done();
    });
  });

  it('AnonymousTokenでデバイス登録ができる', function(done){
    var device = new AppPot.Device({
      token: "Anonymous device token",
      osType: "iOS",
      name: "iPhone X",
      udid: "90284830E1DA-2C5B-4F97-BC61-E9J5J94J"
    });

    AppPot.LocalAuthenticator.setDevice(device)
    .then(function(result){
      expect(result.errCode).toEqual(0)
      done();
    })
  })

  it('正しいid/passの組み合わせでログインできる', function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(function(authInfo){
      expect(typeof authInfo).toBe('object')
      expect(AppPot.LocalAuthenticator.isLogined()).toBeTruthy()
      expect(authInfo.getToken()).toMatch(/[0-9a-f]+/)
      done();
    });
  });

  it('ログイン後、GroupsRolesの各種情報が取得できる', function(done){
    AppPot.LocalAuthenticator.login(account.username, account.password)
    .then(function(){
      var user = AppPot.getUser();
      expect(user.groupsRoles[0].groupId).toEqual(testGroup.id)
      expect(user.groupsRoles[0].groupName).toEqual(testGroup.name)
      expect(user.groupsRoles[0].description).toEqual(testGroup.description)
      expect(user.groupsRoles[0].roleName).toEqual('Admin')
      expect(user.groupsRoles[0].roleId).toEqual(3)
      done();
    });
  });

  it('ログイン後、デバイス登録ができる', function(done){
    var device = new AppPot.Device({
      token: "device token 1",
      osType: "iOS",
      name: "iPhone X",
      udid: "E9J5J94J-2C5B-4F97-BC61-90284830E1DA"
    });

    AppPot.LocalAuthenticator.setDevice(device)
    .then(function(result){
      expect(result.errCode).toEqual(0)
      done();
    })
  })

  it('間違ったid/passの組み合わせでログインが失敗する', function(done){
    AppPot.LocalAuthenticator.login(account.username, 'wrongpassword')
    .catch(function(error){
      expect(error instanceof AppPot.Error).toBeTruthy()
      expect(error.code).toBe(111)
      done();
    });
  });
});
