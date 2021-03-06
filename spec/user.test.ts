import {
  AppPot,
  TaskModel,
  PlaceModel,
  account
} from './config';

describe('User管理APIのテスト', function(){
  var originalTimeout;
  beforeEach(function(done){
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    AppPot.LocalAuthenticator.login(account.username, account.password)
      .then(function(){
        done();
      });
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

  var targetUser = null;

  it('ユーザーを作成できる', function(done){
    var gr = AppPot.getUser().groupsRoles[0];

    targetUser = new AppPot.User({
      account: randomString(16),
      firstName: 'test',
      lastName: 'account',
      password: 'wohafdslkj',
      groupsRoles: [
        new AppPot.GroupsRoles({
          groupId: gr.groupId,
          role: AppPot.Role.User
        }),
        new AppPot.GroupsRoles({
          groupId: gr.groupId,
          roleName: 'Admin'
        }),
      ]
    });


    targetUser.create().then(function(user){
      expect(user instanceof AppPot.User).toBeTruthy();
      expect(user.groupsRoles instanceof Array).toBeTruthy();
      expect(user.groupsRoles[0] instanceof AppPot.GroupsRoles).toBeTruthy();
      expect(user.groupsRoles[0].groupId).toEqual(gr.groupId);
      expect(user.groupsRoles[0].groupName).toEqual(gr.groupName);
      expect(user.groupsRoles[0].roleName).toEqual('User');
      expect(user.groupsRoles[1] instanceof AppPot.GroupsRoles).toBeTruthy();
      expect(user.groupsRoles[1].groupId).toEqual(gr.groupId);
      expect(user.groupsRoles[1].groupName).toEqual(gr.groupName);
      expect(user.groupsRoles[1].role).toEqual(AppPot.Role.Admin);
      return AppPot.LocalAuthenticator.logout();
    }).then(function(){
      return AppPot.LocalAuthenticator.login(
        targetUser.account, targetUser.password
      );
    }).then(function(){
      done();
    });
  })

  it('ユーザーID(数値)で取得できる', function(done){
    var groupId = AppPot.getUser().groupsRoles[0].groupId;
    AppPot.User.findById(account.userId)
      .then(function(user){
        expect(user instanceof AppPot.User).toBeTruthy();
        expect(user.account).toEqual(account.username);
        expect(user.groupsRoles instanceof Array).toBeTruthy();
        done();
      });
  });;

  it('ユーザーID(文字列)で取得できる', function(done){
    var groupId = AppPot.getUser().groupsRoles[0].groupId;
    AppPot.User.findById(String(account.userId))
      .then(function(user){
        expect(user instanceof AppPot.User).toBeTruthy();
        expect(user.account).toEqual(account.username);
        expect(user.groupsRoles instanceof Array).toBeTruthy();
        done();
      });
  });

  it('ユーザー一覧を取得できる', function(done){
    var groupId = AppPot.getUser().groupsRoles[0].groupId;
    AppPot.User.list(groupId)
      .then(function(users){
        expect(users instanceof Array).toBeTruthy();
        expect(users[0] instanceof AppPot.User).toBeTruthy();
        expect(users[0].groupsRoles instanceof Array).toBeTruthy();
        expect(users[0].groupsRoles[0] instanceof AppPot.GroupsRoles).toBeTruthy();
        expect(users[0].groupsRoles[0].groupId).toEqual(groupId);
        expect(users[0].groupsRoles[0].groupName).toEqual('group001');
        done();
      });
  });

  it('ユーザー情報を更新できる', function(done){
    var updatedFirstName = randomString(16);
    var groupId = AppPot.getUser().groupsRoles[0].groupId;
    AppPot.LocalAuthenticator.logout()
      .then(function(){
        return AppPot.LocalAuthenticator.login(
          targetUser.account, targetUser.password
        );
      }).then(function(){
        expect(targetUser instanceof AppPot.User).toBeTruthy();
        return targetUser.update({firstName: updatedFirstName});
      }).then(function(){
        return AppPot.LocalAuthenticator.logout()
      }).then(function(){
        return AppPot.LocalAuthenticator.login(account.username, account.password)
      }).then(function(){
        return AppPot.User.list(groupId)
      }).then(function(users){
        var len = users.length;
        for(var i = 0; i < len; i++){
          if(users[i].userId == targetUser.userId){
            expect(users[i].firstName).toEqual(updatedFirstName);
            return true;
          }
        }
        return false
      }).then(function(result){
        if(result){
          done();
        }else{
          throw 'failed';
        }
      }).catch(function(e){
        console.log(e);
        throw 'failed';
      });
  });

  it('ユーザーを削除できる', function(done){
    var groupId = AppPot.getUser().groupsRoles[0].groupId;
    AppPot.User.list(groupId)
      .then(function(users){
        expect(users instanceof Array).toBeTruthy();
        var delUsers = users.filter(function(user){
          return user.account != 'user001';
        });
        return Promise.all(
          delUsers.map(function(user){
            return user.remove({timeout:30000});
          })
        );
      }).then(function(){
        return AppPot.User.list(groupId)
      }).then(function(users){
        expect(users instanceof Array).toBeTruthy();
        expect(users.length).toEqual(1);
        done();
      });
  });
});
