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

  login = (user: string, pass: string) => {
    return this.apiLogin(user, pass);
  }

  logout = () => {
    return this.apiLogout();
  }

  setDevice = (device) => {
    return this.devices(device);
  }

  isLogined = () => {
    return this._isLogined;
  }

  getAnonymousToken = (account?: string) => {
    return new Promise((resolve, reject) => {
      let sendOption = {
        appKey:this._appPot.getConfig().appKey
      }
      const anonymousUser = this._appPot.getAuthInfo().getAnonymousUser();
      if (account) {
        sendOption['account'] = account;
      } else {
        if (anonymousUser) {
          sendOption['account'] = anonymousUser.account;
        }
      }
      this._appPot.getAjax().post('anonymousTokens')
        .send(sendOption)
        .end(Ajax.end(resolve, reject, (obj) => {
          this._appPot.getAuthInfo().setToken(obj.authInfo.userTokens);
          if (!anonymousUser) {
            const user = new (this._appPot.User)(
              objectAssign(
                {},
                obj.authInfo,
                obj.authInfo['userInfo'],
                {groupsRoles:obj.authInfo['groupsAndRoles']}
              )
            );
            this._appPot.getAuthInfo().setAnonymousUser(user);
          }
          resolve(this._appPot.getAuthInfo());
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
          resolve(obj);
        }));
    });
  }

  private apiLogin(user:string, pass:string){
    this._appPot.getAuthInfo().clearUser();
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().post('auth/login')
        .send({
          account: user,
          password: pass,
          appKey: this._appPot.getConfig().appKey
        })
        .end(Ajax.end(
          (obj) => {
            this._appPot.getAuthInfo().setToken(obj.authInfo.userTokens);
            const user = new (this._appPot.User)(
              objectAssign(
                {},
                obj.authInfo,
                obj.authInfo['userInfo'],
                {groupsRoles:obj.authInfo['groupsAndRoles']}
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
