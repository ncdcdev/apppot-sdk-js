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
        if(columns[key]){
          this._columns[key] = columns[key];
        }
      });
      let grs = columns.groupsRoles ||
        columns.groupsAndRoles ||
        columns.groupRoleMap ||
        this.groupsRoles;

      if(grs instanceof GroupsRoles){
        grs = [grs];
      }else if(! (grs instanceof Array) ){
        throw 'Invalid arguments groupsRoles';
      }

      this._columns.groupsRoles =
        grs.map((val) => {
          return new GroupsRoles(val);
        });

      return this;
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
          .end(Ajax.end((obj) => {
            resolve(this.set(obj.user));
          }, reject));
      });
    }

    update(columns?, options?: AjaxOptions){
      if(columns){
        this.set(columns);
      }
      return new Promise((resolve, reject) => {
        const obj = this._getObjForUserAPI();
        appPot.getAjax().put(`users/${this.userId}`, options)
          .send(obj)
          .end(Ajax.end((obj) => {
            resolve(this.set(obj.user));
          }, reject));
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
  private _roleId;
  private _groupName;
  constructor(args){
    if(args.group && args.role){
      this._groupId = args.group.groupId;
      this._roleId = Role[args.role.roleName];
      this._groupName = args.group.groupName;
    }
    if(args.groupId){
      this._groupId = args.groupId;
    }
    if(args.roleName && !this._roleId){
      this._roleId = Role[args.roleName];
    }
    if(args.role && !this._roleId){
      this._roleId = args.role;
    }
    if(args.groupName){
      this._groupName = args.groupName;
    }
  }

  setGroupsRoles(obj){
    this._groupId = obj.group.groupId;
    this._roleId = Role[obj.role.roleName];
    return this;
  }

  get groupId(){
    return this._groupId;
  }

  get groupName(){
    return this._groupName;
  }

  get role(){
    return this._roleId;
  }

  get roleName(){
    switch(this._roleId){
      case Role.SuperAdmin:
        return "Super Admin";
      default:
        return Role[this._roleId];
    }
  }

  getGroupsRolesForUserAPI(){
    return {
      group: {
        groupId: this.groupId
      },
      role: {
        roleName: this.roleName
      }
    };
  }
}
