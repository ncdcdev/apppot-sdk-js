//  <reference path="../../typings/index.d.ts" />
declare var APPPOT_BUILD_UTC: number;
declare var APPPOT_VERSION: Array<String>;
import {Config} from './config';
import {AuthInfo} from './auth-info';
import {Ajax} from './ajax';
import {LocalAuthenticator} from './local-authenticator';
import {Database} from './database';
import {Model} from './model';
import Device from './device';
import {getUserClass, GroupsRoles, Role} from './user';
import {getGroupClass} from './group';
import {getFileClass} from './file';
import {getGateway} from './gateway';
import {DataType} from './types';
import {Error} from './error';

export class AppPot {
  private _config: Config;
  private _authInfo: AuthInfo;
  private _ajax: Ajax;
  private _inst;
  private _localDb;
  private _isOnline;
  private _lock = [];
  public User;
  public Group;
  public Model;
  public Device;
  public File;
  public Role;
  public GroupsRoles;
  public DataType;
  public Error;
  public Gateway;
  public LocalAuthenticator;
  constructor(props?){
    if(!props){
      return this._inst;
    }
    this._inst = this;
    this._config = new Config(props);
    this._authInfo = new AuthInfo(this);
    this._ajax = new Ajax(this._config, this._authInfo);
    this._isOnline = true;
    const authenticators = {
      "LocalAuthenticator": LocalAuthenticator
    };
    for(let idx in authenticators){
      this[idx] =
        new authenticators[idx](this, this._config, this._authInfo);
    }
    this['User'] = getUserClass(this);
    this['Model'] = Model;
    this['Device'] = Device;
    this['Role'] = Role;
    this['File'] = getFileClass(this);
    this['GroupsRoles'] = GroupsRoles;
    this['DataType'] = DataType;
    this['Error'] = Error;
    this['Group'] = getGroupClass(this);
    this['Gateway'] = getGateway(this);
  }

  uuid() {
    let uuid = "";
    for (let i = 0; i < 32; i++) {
      let random = Math.random() * 16 | 0;
      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-"
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  isLocked(tableName) {
    return this._lock[tableName];
  }

  lock(tableName){
    this._lock[tableName] = true;
  }

  unlock(tableName){
    this._lock[tableName] = false;
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
  setLocalDatabase(db){
    this._localDb = db;
  }
  getLocalDatabase(){
    return this._localDb;
  }
  getBuildDate(){
    return APPPOT_BUILD_UTC || "unknown";
  }
  getVersion(){
    return APPPOT_VERSION.join('.') || "unknown";
  }
  log(str, level = 'MONITOR'){
    if(!this._authInfo.hasToken()){
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
  sendPushNotification(message, target, title?){
    if(!this._authInfo.hasToken()){
      return Promise.reject('not logined');
    }
    console.log('sending push notification...');

    const _target = (target instanceof Array) ? target : [target];
    let payload = {
      message: message,
      target: _target
    };

    if(title){
      payload['title'] = title;
    }

    return new Promise((resolve, reject)=>{
      this._ajax
        .post('messages')
        .send(payload)
        .end(Ajax.end(resolve, reject));
    });
  }

  isOnline(){
    return this._isOnline;
  }

  online(isOnline: Boolean){
    this._isOnline = isOnline;
  }

  sendMail(sendingRouteName, mailFrom, mailTo, mailCc, mailBcc, subject, body){
    if(!this._authInfo.hasToken()){
      return Promise.reject('not logined');
    }
    if( !(mailTo instanceof Array) ||
       !(mailCc instanceof Array) ||
       !(mailBcc instanceof Array) ){
      return Promise.reject('mailTo, mailCc, mailBcc must be array');
    }
    if( mailTo.length == 0 && mailCc.length == 0 && mailBcc.length == 0 ){
      return Promise.reject('destination address is not specified');
    }

    return new Promise((resolve, reject) => {
      this._ajax.post('emails')
        .send({
          mailFrom: mailFrom,
          mailTo: mailTo,
          mailCc: mailCc,
          mailBcc: mailBcc,
          sendingRouteName: sendingRouteName,
          subject: subject,
          body: body
        })
        .end(Ajax.end(resolve, reject));
    });
  }
}

let appPotInst = null;

export function getService(props?): AppPot {
  if(props){
    if(appPotInst){
      throw 'AppPot is already configured';
    }
    appPotInst = new AppPot(props);
  }
  return appPotInst;
};
