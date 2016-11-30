import * as superagent from 'superagent';
import {AuthInfo} from './auth-info';
import {Config} from './config';
import {Error} from './error';
const objectAssign = require('object-assign');

export interface AjaxOptions {
  entryPoint?: string;
  timeout?: number;
}

export class Ajax {

  private _config:Config;
  private _authInfo: AuthInfo;

  constructor(config: Config, authInfo:AuthInfo){
    this._config = config;
    this._authInfo = authInfo;
  }

  private setToken(agent){
    if(this._authInfo.hasToken()){
      const ret = agent.set('apppot-token', this._authInfo.getToken());
      return ret;
    }else{
      return agent;
    }
  }

  private buildOpts(options?){
    return objectAssign({
      entryPoint: this._config.entryPoint,
      timeout: this._config.timeout,
      contentType: 'application/json'
    }, options);
  }
  
  get(url, options?: AjaxOptions){
    const opts = this.buildOpts(options);
    let agent = superagent
        .get(opts.entryPoint + url)
        .timeout(opts.timeout);
    return this.setToken(agent);
  }

  post(url, options?: AjaxOptions){
    const opts = this.buildOpts(options);
    let agent = superagent
      .post(opts.entryPoint + url)
      .timeout(opts.timeout)
      .set('Content-Type', opts.contentType);
    return this.setToken(agent);
  }

  update(url, options?: AjaxOptions){
    return this.put(url, options);
  }
  
  put(url, options?: AjaxOptions){
    const opts = this.buildOpts(options);
    let agent = superagent
      .put(opts.entryPoint + url)
      .timeout(opts.timeout)
      .set('Content-Type', opts.contentType);
    return this.setToken(agent);
  }

  remove(url, options?: AjaxOptions){
    const opts = this.buildOpts(options);
    let agent = superagent
      .del(opts.entryPoint + url)
      .timeout(opts.timeout)
      .set('Content-Type', opts.contentType);
    return this.setToken(agent);
  }

  static end(resolve, reject, success?: (obj) => void, failed?: (obj) => void ){
    return function(err, res){
      if(err){
        const obj = {"status":"error", "results": err, "response": res};
        if(failed){
          failed(obj);
        }else{
          reject(obj);
        }
      }else{
        const obj = JSON.parse(res.text);
        if(obj.hasOwnProperty('status') && obj['status'] == 'error'){
          if(failed){
            failed(new Error(obj['errCode'], obj['description']));
          }else{
            reject(new Error(obj['errCode'], obj['description']));
          }
        }else{
          if(success){
            success(obj);
          }else{
            resolve(obj);
          }
        }
      }
    };
  }
}
