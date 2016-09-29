import {Ajax, AjaxOptions} from './ajax';
import {AppPot} from './apppot';
import {Promise} from 'es6-promise';

export function getUserClass(appPot:AppPot){
  return class User {
    private _columns;

    constructor(columns){
      this._columns = {
        account: '',
        firstName: '',
        lastName: '',
        password: '',
        userId: null
      };
      this.set(columns);
    }

    set(columns){
      Object.keys(this._columns).forEach((key) => {
        this._columns[key] = columns[key];
      });
      let grs = columns.groupsRoles ||
        columns.groupsAndRoles ||
        columns.groupRoleMap;

      if(grs instanceof GroupsRoles){
        grs = [grs];
      }else if(! (grs instanceof Array) ){
        throw 'Invalid arguments groupsRoles';
      }

      this._columns.groupsRoles =
        grs.map((val) => {
          return new GroupsRoles({
            groupId: val.groupId, roleName: val.roleName
          });
        });
    }

    set account(value){
      this._columns.account = value;
    }

    get account(){
      return this._columns.account;
    }

    set firstName(value){
      this._columns.firstName = value;
    }

    get firstName(){
      return this._columns.firstName;
    }

    set lastName(value){
      this._columns.lastName = value;
    }

    get lastName(){
      return this._columns.lastName;
    }

    get userId(){
      return this._columns.userId;
    }

    set password(value){
      this._columns.password = value;
    }

    get password(){
      return this._columns.password;
    }

    set groupsRoles(value){
      if(! (value instanceof GroupsRoles) ){
        throw 'arguments is invalid type of class'
      }
      this._columns.groupsRoles = value;
    }

    get groupsRoles(){
      return this._columns.groupsRoles;
    }

    static list(groupId: number, options?: AjaxOptions){
      return new Promise((resolve, reject) => {
        appPot.getAjax().get('users', options)
          .query({ token: appPot.getAuthInfo().getToken() })
          .query({ groupId: groupId })
          .end(Ajax.end((res) => {
            const users = res['users'];
            const userInsts = users.map((user) => {
              return new User(user);
            });
            resolve(userInsts);
          }, reject));
      });
    }
    
    _getObjForUserAPI(){
      return {
        account:   this.account,
        firstName: this.firstName,
        lastName:  this.lastName,
        password:  this.password,
        groupRoleMap: this.groupsRoles.map((gr)=>{
          return gr.getGroupsRolesForUserAPI()
        })
      };
    }

    create(options?: AjaxOptions){
      return new Promise((resolve, reject) => {
        const obj = this._getObjForUserAPI();
        appPot.getAjax().post('users', options)
          .send(obj)
          .end(Ajax.end(resolve, reject, (obj) => {

            resolve(new User(obj.user));
          }));
      });
    }

    remove(options?){
      return User.remove(this.userId, options);
    }

    static remove(userId: number, options?: AjaxOptions){
      return new Promise((resolve, reject)=>{
        appPot.getAjax().remove(`users/${userId}`, options)
          .query({ token: appPot.getAuthInfo().getToken() })
          .end(Ajax.end(resolve, reject));
      });
    }
  }
}

export enum Role {
  SuperAdmin,
  Admin,
  Manager,
  User
}

export class GroupsRoles {
  private _groupId;
  private _role;
  constructor(args){
    if(args.groupId){
      this._groupId = args.groupId;
    }
    if(args.roleName){
      this._role = Role[args.roleName];
    }
    if(args.role){
      this._role = args.role;
    }
  }

  setGroupsRoles(obj){
    this._groupId = obj.group.groupId;
    this._role = Role[obj.role.roleName];
    return this;
  }

  get groupId(){
    return this._groupId;
  }

  get role(){
    return this._role;
  }

  get roleName(){
    switch(this._role){
      case Role.SuperAdmin:
        return "Super Admin";
      default:
        return Role[this._role];
    }
  }

  getGroupsRolesForUserAPI(){
    return {
      group: {
        groupId: this._groupId
      },
      role: {
        roleName: this.roleName
      }
    };
  }
}
