describe('Group管理APIのテスト', function(){
  beforeEach(function(done){
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
  var groupInfo = {
    groupName: randomString(16),
    description: randomString(16) 
  };

  it('グループを作成・削除できる', function(done){

    var group = new AppPot.Group(groupInfo);

    group.create().then(function(createdGroup){
      expect(group.groupName).toEqual(createdGroup.groupName);
      expect(group.description).toEqual(createdGroup.description);
      return group.remove();
    }).then(function(){
      done();
    });
  });

  it('グループ一覧を取得できる', function(done){
    AppPot.Group.list()
      .then(function(groups){
        expect(groups instanceof Array).toBeTruthy();
        done();
      });
  });

  it('グループの情報を更新できる', function(done){
    var updatedDescription = randomString(16);
    AppPot.Group.list()
      .then(function(groups){
        var targetGroup = null;
        expect(groups instanceof Array).toBeTruthy();
        groups.forEach(function(group){
          if(group.groupId == 202){
            targetGroup = group;
          }
        });
        expect(targetGroup).not.toBeNull();
        return targetGroup.update({
          description: updatedDescription
        });
      })
      .then(function(group){
        expect(group.description).toEqual(updatedDescription);
        done();
      });
  });
});
