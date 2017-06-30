import {AppPot} from './apppot';
import {Promise} from 'es6-promise';

interface GatewayOptions {
  original?: boolean;
}


function request(func: Function, serviceName: String, url: String, params?: Object, body?: Object, options?: GatewayOptions){
  let _response = 'json';
  let _orig = false;

  if( options && options.original ){
    _response = 'original';
    _orig = true;
  }

  let _params = params ? params : {};
  let _body = body ? body : [];
  if( !(_body instanceof Array) ){
    _body = [_body];
  }

  let _url = url.replace(/^\//, '').replace(/\/$/, '');
  return new Promise( ( resolve, reject ) => {
    func(`gateway/${serviceName}/${_response}/${_url}`).query(_params).send(_body).end((err, res) => {
      if(_orig){
        return resolve({error: err, response: res});
      }
      if(err){
        return reject( {"status":"error", "results": err, "response": res} );
      }
      const obj = JSON.parse(res.text);
      if(obj.status == 'OK'){
        resolve(obj.results);
      }else{
        return reject( {"status":"error", "results": err, "response": res} );
      }
    });
  });
}

class Gateway {
  private _ajax;
  constructor(appPot: AppPot){
    this._ajax = appPot.getAjax();;
  }

  get(serviceName: String, url: String, params: Object, body: Object, options: GatewayOptions) {
    return request(this._ajax.get.bind(this._ajax), serviceName, url, params, body, options);
  }

  post(serviceName: String, url: String, params: Object, body: Object, options: GatewayOptions) {
    return request(this._ajax.post.bind(this._ajax), serviceName, url, params, body, options);
  }

  put(serviceName: String, url: String, params: Object, body: Object, options: GatewayOptions) {
    return request(this._ajax.put.bind(this._ajax), serviceName, url, params, body, options);
  }
  
  remove (serviceName: String, url: String, params: Object, body: Object, options: GatewayOptions) {
    return request(this._ajax.remove.bind(this._ajax), serviceName, url, params, body, options);
  }
}

export function getGateway(appPot:AppPot){
  return new Gateway(appPot);
}
