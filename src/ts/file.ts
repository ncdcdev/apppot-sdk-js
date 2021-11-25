import {Ajax, AjaxOptions} from './ajax';
import {AppPot} from './apppot';

export function getFileClass(appPot:AppPot){
  return class File {
    private _name: string;
    private _url: string;
    constructor(name, url){
      this._name = name;
      this._url = url;
    }
    static getUrl(filename: string, asFilename?: string){
      return `${appPot.getConfig().entryPoint}files/${filename}?userToken=${appPot.getAuthInfo().getToken()}`
        + (asFilename ? `&?asFilename=${asFilename}` : ``);
    }
    get url(){
      return `${appPot.getConfig().entryPoint}files/${this.name}?userToken=${appPot.getAuthInfo().getToken()}`;
    }
    get name(){
      return this._name;
    }
    static create(filename: string, content, progress){
      const prog = progress ? progress : ()=>{};
      const entity = JSON.stringify({name: filename});
      return new Promise((resolve, reject)=>{
        appPot.getAjax().post('files', {
          'contentType': 'no-set'
        })
        .field('entity', entity)
        .attach('file', content)
        .on('progress', prog)
        .end(Ajax.end((res)=>{
          let file = new File(res.results.name, res.results.url);
          resolve(file);
        }, reject))
      });
    }
    get(progress){
      return File.get(this.name, progress);
    }
    static get(filename: string, progress){
      const prog = progress ? progress : ()=>{};
      return new Promise((resolve, reject)=>{
        appPot.getAjax().get(`files/${filename}`)
        .query(`userToken=${appPot.getAuthInfo().getToken()}`)
        .on('progress', prog)
        .end(Ajax.end((res)=>{
          resolve(res);
        }, reject))
      });
    }
    update(filename: string, content, progress){
      const prog = progress ? progress : ()=>{};
      const entity = JSON.stringify({name: filename});
      return new Promise((resolve, reject)=>{
        appPot.getAjax().put(`files/${this.name}`, {
          'contentType': 'no-set'
        })
        .field('entity', entity)
        .attach('file', content)
        .on('progress', prog)
        .end(Ajax.end((res)=>{
          let file = new File(res.results.name, res.results.url);
          resolve(file);
        }, reject))
      });
    }
    remove(filename: string){
      return new Promise((resolve, reject)=>{
        appPot.getAjax().remove(`files/${this.name}`)
        .end(Ajax.end((res)=>{
          resolve(res);
        }, reject))
      });
    }
  }
}
