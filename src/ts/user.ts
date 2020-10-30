import {Ajax, AjaxOptions} from './ajax';
import {AppPot} from './apppot';

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

    private static _isNumber(x){
      if (typeof(x) === 'number') {
        return Number.isInteger(x);
      } else if(typeof(x) === 'string') {
        return Number.isInteger(Number.parseInt(x));
      }
      return false;
    }

    static findById(userId, options?: AjaxOptions){
      if(!this._isNumber(userId)){
        return Promise.reject('userId is not a number');
      }
      return new Promise((resolve, reject) => {
        appPot.getAjax().get(`users/${userId}`, options)
          .query({ token: appPot.getAuthInfo().getToken() })
          .end(Ajax.end((res) => {
            resolve(new User(res['user']));
          }, reject));
      });
    }

    static list(params, options?: AjaxOptions){
      let _params = {};
      if(this._isNumber(params)){
        _params['groupId'] = params;
      }else{
        _params = params;
      }
      return new Promise((resolve, reject) => {
        appPot.getAjax().get('users', options)
          .query({ token: appPot.getAuthInfo().getToken() })
          .query(_params)
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
  SuperAdmin = 2,
  Admin = 3,
  Manager = 4,
  User = 5
}

export class GroupsRoles {
  private _groupId;
  private _roleName;
  private _groupName;
  private _description;
  constructor(args){
    if(args instanceof GroupsRoles){
      return args;
    }
    //restore
    if(args._groupId && args._groupName && args._roleName){
      this._groupId = args._groupId;
      this._groupName = args._groupName;
      this._roleName = args._roleName;
      return this;
    }
    if(args.group && args.role){
      this._groupId = args.group.groupId;
      this._roleName = args.role.roleName;
      this._groupName = args.group.groupName;
    }
    if(args.groupId){
      this._groupId = args.groupId;
    }
    if(args.roleName && !this._roleName){
      this._roleName = args.roleName;
    }
    if(args.role && !this._roleName){
      console.log('[WARN] roleId or Role enumerator will be can no longer be specify to create GroupsRoles Instance.');
      this._roleName = Role[args.role];
      if(this._roleName == 'SuperAdmin'){
        this._roleName = 'Super Admin';
      }
    }
    if(args.groupName){
      this._groupName = args.groupName;
    }
    if(args.description){
      this._description = args.description;
    }
  }

  setGroupsRoles(obj){
    this._groupId = obj.group.groupId;
    this._roleName = obj.role.roleName;
    return this;
  }

  get groupId(){
    return this._groupId;
  }

  get groupName(){
    return this._groupName;
  }

  get role(){
    console.log('[WARN] roleId or Role enumerator will be can no longer be use.');
    let roleName = this._roleName;
    if(roleName == 'Super Admin'){
      roleName = 'SuperAdmin';
    }
    return Role[roleName];
  }

  get description(){
    return this._description;
  }

  get roleName(){
    return this._roleName;
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
