import {Ajax} from './ajax';
import {AppPot} from './apppot';
import {Promise} from 'es6-promise';
import Device from './device';
const objectAssign = require('object-assign');

export class LocalAuthenticator {

  private _appPot: AppPot;
  private _isLogined: boolean;

  constructor(appPot:AppPot){
    this._appPot = appPot;
  }

  login = (user: string, pass: string, isPush?: boolean, device?: Device) => {
    return this.getAnonymousToken(device)
      .then(()=>{
        if(isPush && device){
          return this.devices(device);
        }else{
          return true;
        }
      })
      .then(()=>{ return this.apiLogin(user, pass, isPush, device); });
  }

  logout = () => {
    return this.apiLogout();
  }

  isLogined = () => {
    return this._isLogined;
  }

  getAnonymousToken = (device?:Device) => {
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().get('anonymousTokens')
        .query(`appKey=${this._appPot.getConfig().appKey}`)
        .query(`deviceUDID=${device&&device.udid||this._appPot.getConfig().deviceUDID}`)
        .end(Ajax.end(resolve, reject, (obj) => {
          this._appPot.getAuthInfo().setToken(obj.results);
          resolve(obj.results);
        }));
    });
  }

  private devices(device:Device){
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().post('devices')
        .set('apppot-token', this._appPot.getAuthInfo().getToken())
        .send({
          deviceToken: device.token,
          deviceUDID:  device.udid,
          deviceName:  device.name,
          osType: device.osType
        })
        .end(Ajax.end(resolve, reject, (obj) => {
          resolve();
        }));
    });
  }

  private apiLogin(user:string, pass:string, isPush:boolean,  device?:Device){
    this._appPot.getAuthInfo().clearUser();
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().post('auth/login')
        .set('apppot-token', this._appPot.getAuthInfo().getToken())
        .send({
          username: user,
          password: pass,
          appId: this._appPot.getConfig().appId,
          deviceUDID: device ? device.udid : this._appPot.getConfig().deviceUDID,
          isPush: !!isPush,
          appVersion: this._appPot.getConfig().appVersion,
          companyId: this._appPot.getConfig().companyId
        })
        .end(Ajax.end(
          (obj) => {
            if(obj.authInfor){
              obj.authInfo = obj.authInfor;
              delete obj.authInfor;
            }
            this._appPot.getAuthInfo().setToken(obj.authInfo.userTokens);
            const user = new (this._appPot.User)(
              objectAssign(
                {},
                obj.authInfo,
                obj.authInfo['userInfo']
              )
            );
            this._appPot.getAuthInfo().setUser(user);
            this._isLogined = true;

            resolve(this._appPot.getAuthInfo());
          },
          (obj) => {
            this._isLogined = false;
            reject(obj);
          }
        ));
    });
  }

  private apiLogout(){
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().post('auth/logout')
        .set('apppot-token', this._appPot.getAuthInfo().getToken())
        .send({})
        .end(Ajax.end((obj) => {
          this._appPot.getAuthInfo().clearToken();
          this._appPot.getAuthInfo().clearUser();
          this._isLogined = false;
          resolve(this._appPot.getAuthInfo());
        }, reject));
    });
  }
}
