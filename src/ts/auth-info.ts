const objectAssign = require('object-assign');

interface Serializable {
  serialize(): string;
  deserialize(str: string);
}

export class AuthInfo implements Serializable {

  private _token: string = '';
  private _user: any;
  private apppot;

  constructor(apppot){
    this.apppot = apppot;
  }

  hasToken(){
    return this._token !== '';
  }

  getToken(){
    return this._token;
  }

  getUser(){
    return this._user;
  }

  setUser(user){
    this._user = user;
  }

  setToken(token){
    this._token = token;
  }

  clearUser(){
    this._user = null;
  }

  clearToken(){
    this._token = '';
  }

  serialize(){
    let obj = {};
    obj['token'] = this._token;
    obj['user'] = this._user._columns;
    return JSON.stringify(obj);
  }

  deserialize(str) {
    const obj = JSON.parse(str);
    if(obj){
      this.setToken(obj['token']);
      const user = new (this.apppot.User)(obj['user'])
      this.setUser(user);
      return true;
    }
    return false;
  }
}
