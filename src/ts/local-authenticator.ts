import {Ajax} from './ajax';
import {AppPot} from './apppot';
import {Promise} from 'es6-promise';
const objectAssign = require('object-assign');

export class LocalAuthenticator {

  private _appPot: AppPot;
  private _isLogined: boolean;

  constructor(appPot:AppPot){
    this._appPot = appPot;
  }

  login = (user: string, pass: string) => {
    return this.getAnonymousToken()
      .then(()=>{ return this.apiLogin(user, pass); });
  }

  logout = () => {
    return this.apiLogout();
  }

  isLogined = () => {
    return this._isLogined;
  }

  getAnonymousToken = () => {
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().get('anonymousTokens')
        .query(`appKey=${this._appPot.getConfig().appKey}`)
        .query(`deviceUDID=${this._appPot.getConfig().deviceUDID}`)
        .end(Ajax.end(resolve, reject, (obj) => {
          this._appPot.getAuthInfo().setToken(obj.results);
          resolve(obj.results);
        }));
    });
  }

  private apiLogin(user:string, pass:string){
    this._appPot.getAuthInfo().clearUser();
    return new Promise((resolve, reject) => {
      this._appPot.getAjax().post('auth/login')
        .set('apppot-token', this._appPot.getAuthInfo().getToken())
        .send({
          username: user,
          password: pass,
          appId: this._appPot.getConfig().appId,
          deviceUDID: this._appPot.getConfig().deviceUDID,
          isPush: false,
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
