import {Ajax, AjaxOptions} from './ajax';
import {AppPot} from './apppot';
import {Promise} from 'es6-promise';

export function getGroupClass(appPot:AppPot){
  return class Group {
    private _columns;

    constructor(columns){
      this._columns = {
        groupId: null,
        groupName: "",
        description: ""
      };
      this.set(columns);
    }

    set groupId(val){
      this._columns.groupId = val;
    }

    set groupName(val){
      this._columns.groupName = val;
    }

    set description(val){
      this._columns.description = val;
    }

    get groupId(){
      return this._columns.groupId;
    }

    get groupName(){
      return this._columns.groupName;
    }

    get description(){
      return this._columns.description;
    }

    set(columns){
      Object.keys(this._columns).forEach((key) => {
        if(columns[key]){
          this._columns[key] = columns[key];
        }
      });
      return this;
    }

    static list(options?: AjaxOptions){
      return new Promise((resolve, reject) => {
        appPot.getAjax().get('groups', options)
          .query({ token: appPot.getAuthInfo().getToken() })
          .end(Ajax.end((res)=>{
            const groups = res['groups'].map((group)=>{
              return new Group(group);
            });
            resolve(groups);
          }, reject));
      });
    }

    create(columns?, options?: AjaxOptions){
      return new Promise((resolve, reject) => {
        appPot.getAjax().post('groups', options)
          .send(this._columns)
          .end(Ajax.end((res)=>{
            resolve( this.set(res.group) );
          }, reject));
      });
    }

    update(columns?, options?: AjaxOptions){
      if(columns){
        this.set(columns);
      }
      return new Promise((resolve, reject) => {
        appPot.getAjax().update(`groups/${this.groupId}`, options)
          .send(this._columns)
          .end(Ajax.end((res)=>{
            resolve( this.set(res.group) );
          }, reject));
      });
    }

    remove(options?){
      return Group.remove(this.groupId, options);
    }

    static remove(groupId: number, options?: AjaxOptions){
      return new Promise((resolve, reject)=>{
        appPot.getAjax().remove(`groups/${groupId}`, options)
          .query({ token: appPot.getAuthInfo().getToken() })
          .end(Ajax.end(resolve, reject));
      });
    }
  }
}
