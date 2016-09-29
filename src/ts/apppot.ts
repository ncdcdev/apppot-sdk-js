/// <reference path="../../typings/index.d.ts" />
declare var APPPOT_BUILD_UTC: number;
declare var APPPOT_VERSION: Array<String>;
import {Config} from './config';
import {AuthInfo} from './auth-info';
import {Ajax} from './ajax';
import {LocalAuthenticator} from './local-authenticator';
import {Database} from './database';
import {Model} from './model';
import {getUserClass, GroupsRoles, Role} from './user';
import {DataType} from './types';
import {Error} from './error';
import {Promise} from 'es6-promise';

export class AppPot {
  private _config: Config;
  private _authInfo: AuthInfo;
  private _ajax: Ajax;
  private _inst;
  public User;
  public Model;
  public Role;
  public GroupsRoles;
  public DataType;
  public Error;

  constructor(props?){
    if(!props){
      return this._inst;
    }
    this._inst = this;
    this._config = new Config(props);
    this._authInfo = new AuthInfo(this);
    this._ajax = new Ajax(this._config, this._authInfo);
    const authenticators = {
      "LocalAuthenticator": LocalAuthenticator
    };
    for(let idx in authenticators){
      this[idx] =
        new authenticators[idx](this, this._config, this._authInfo);
    }
    this['User'] = getUserClass(this);
    this['Model'] = Model;
    this['Role'] = Role;
    this['GroupsRoles'] = GroupsRoles;
    this['DataType'] = DataType;
    this['Error'] = Error;
  }
  getAjax(){
    return this._ajax;
  }
  getConfig(){
    return this._config;
  }
  getAuthInfo(){
    return this._authInfo;
  }
  getUser(){
    return this._authInfo.getUser();
  }
  defineModel(className, modelColumns){
    return Model.define(this, className, modelColumns);
  }
  createDatabase(models){
    return Database.createDatabase(this, models);
  }
  dropAndCreateDatabase(models){
    return Database.dropAndCreateDatabase(this, models);
  }
  getBuildDate(){
    return APPPOT_BUILD_UTC || "unknown";
  }
  getVersion(){
    return APPPOT_VERSION.join('.') || "unknown";
  }
  log(str, level = 'MONITOR'){
    if(!this['LocalAuthenticator'].isLogined()){
      return Promise.reject('not logined');
    }
    return new Promise((resolve, reject)=>{
      this._ajax
      .post('logs')
      .send({
        message: str,
        logLevel: level
      })
      .end(Ajax.end(resolve, reject));
    });
  }
}

let appPotInst = null;

export function getService(props?){
  if(props){
    if(appPotInst){
      throw 'AppPot is already configured';
    }
    appPotInst = new AppPot(props);
  }
  return appPotInst;
};
