describe('Group管理APIのテスト', function(){
  var originalTimeout;
  beforeEach(function(done){
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
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

  afterEach(function(){
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
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
  var groupInfo = {
    groupName: randomString(16),
    description: randomString(16)
  };

  it('グループを作成・削除できる', function(done){
    if (__karma__.config.login == 'anonymous') {
      done();
    } else {
      var group = new AppPot.Group(groupInfo);

      group.create().then(function(createdGroup){
        expect(group.groupName).toEqual(createdGroup.groupName);
        expect(group.description).toEqual(createdGroup.description);
        return createdGroup.remove();
      }).then(function(){
        done();
      });
    }
  });

  it('グループを作成できる(App登録あり)', function(done){
    if (__karma__.config.login == 'anonymous') {
      done();
    } else {
      var groupInfoAddApp = {
        groupName: randomString(16),
        description: randomString(16),
        isAddCurrentApp: true
      };
      var group = new AppPot.Group(groupInfoAddApp);

      group.create().then(function(createdGroup){
        expect(group.groupName).toEqual(createdGroup.groupName);
        expect(group.description).toEqual(createdGroup.description);
      }).then(function(){
        done();
      });
    }
  });

  it('グループ一覧を取得できる', function(done){
    AppPot.Group.list()
      .then(function(groups){
        expect(groups instanceof Array).toBeTruthy();
        done();
      });
  });

  it('グループ削除できる', function(done){
    if (__karma__.config.login == 'anonymous') {
      done();
    } else {
      AppPot.Group.list()
        .then(function(groups){
          expect(groups instanceof Array).toBeTruthy();
          var delGroups = groups.filter(function(group){
            return group.groupId != testGroup.id
          });
          return Promise.all(
            delGroups.map(function(group){
              return group.remove({timeout:30000});
            })
          );
        }).then(function(){
          done();
        });
    }
  });

  it('グループの情報を更新できる', function(done){
    if (__karma__.config.login == 'anonymous') {
      done();
    } else {
      var updatedDescription = randomString(16);
      var beforeDescription;
      AppPot.Group.list()
        .then(function(groups){
          var targetGroup = null;
          expect(groups instanceof Array).toBeTruthy();
          groups.forEach(function(group){
            if(group.groupId == testGroup.id){
              targetGroup = group;
            }
          });
          expect(targetGroup).not.toBeNull();
          beforeDescription = targetGroup.description;
          return targetGroup.update({
            description: updatedDescription
          });
        })
        .then(function(group){
          expect(group.description).toEqual(updatedDescription);
          // tearDownのために最初のdescriptionに戻す。
          return group.update({
            description: beforeDescription
          });
        })
        .then(function(group){
          expect(group.description).toEqual(beforeDescription);
          done();
        }).catch(function(err){
          done.fail(JSON.stringify(err));
        });
    }
  });
});
