import {DataType} from './types';
import {Ajax} from './ajax';
import {Error} from './error';
import {AppPot} from './apppot';
import * as moment from 'moment';
import {Promise} from 'es6-promise';
const objectAssign = require('object-assign');

export namespace Model {

  export class Expression {

    private _query;
    private _params;

    constructor(...args){
      let params;
      if(args.length == 1 &&
         args[0] instanceof Array){
        this._query = args[0][0];
        params = args[0].slice(1);
      }else{
        this._query = args[0];
        params = args.slice(1);
      }
      if(params instanceof Array){
        this._params = params;
      }else{
        this._params = [params];
      }
    }

    getQuery() {
      let qobj = {
        'source': this._query
      };
      if(this._params){
        qobj['params'] = this._params;
      }
      return qobj;
    }
  }

  export enum ScopeType {
    User = 1,
    Group = 2,
    All = 3
  }

  export enum JoinType {
    LeftInner = 1,
    LeftOuter = 2
  }

  export enum Order {
    asc,
    desc
  }

  let classList = {};

  function createModelInstance(className, columns?:any[]){
    if(columns){
      return new classList[className](columns);
    }else{
      return new classList[className]();
    }
  }

  const modelMethods = [
    "isNew",
    "get",
    "set",
    "insert",
    "update",
    "save",
    "remove"
  ];

  export function define(appPot:AppPot, _className: string, modelColumns:any[]){

    Object.keys(modelColumns).forEach((key) => {
      if(modelMethods.indexOf(key) != -1){
        throw new Error(-1, 'Invalid column name: ' + key);
      }
    });

    classList[_className] = class ModelClass {

      private _columns = {};
      static className = _className;
      static modelColumns = modelColumns;

      constructor(columns?){
        Object.keys(modelColumns).forEach((key) => {
          Object.defineProperty(this, key, {
            get: function () {
                return this._columns[key];
            },
            set: function (value) {
                this._columns[key] = value;
            },
            enumerable: true,
            configurable: true
          });
        });
        if(columns){
          this.set(columns);
        }
      }

      static _rawInsert(formatedColumns: Object[]){
          return new Promise((resolve, reject)=>{
            appPot.getAjax().post(`data/batch/addData`)//${_className}`)
            .send({
              objectName: _className,
              data: formatedColumns
            })
            .end(Ajax.end(resolve, reject));
          });
      }

      static insertAll(objects: ModelClass[] | Object[]){
        let _columns;
        let _models;
        if(objects[0] instanceof ModelClass){
          _models = objects;
          _columns = _models.map((model) => {
            return model.get();
          });
        }else{
          _columns = objects;
          _models = _columns.map((column) => {
            return createModelInstance(_className, column);
          });
        }
        const _formatedColumns = _columns.map((record)=>{
          return classList[_className].formatColumns(record, true);
        });
        return classList[_className]._rawInsert(_formatedColumns)
          .then((obj)=>{
            obj['results'].forEach((val, idx) => {
              _models[idx].set(val);
            });
            return _models;
          });
      }

      static insert(data: Object){
        if(data instanceof Array){
          throw 'invalid argument type: use insertAll';
        }
        const _formatedColumns = [classList[_className].formatColumns(data, true)];
        
        return classList[_className]._rawInsert(_formatedColumns)
          .then((obj)=>{
            const ret = [];
            const createdColumns = objectAssign(
              {},
              _formatedColumns[0],
              obj['results'][0]
            );
            return createModelInstance(_className, createdColumns);
          });
      }

      static findById(id:string){
        const func = (resolve, reject) => {
           appPot.getAjax().get(`data/${_className}/${id}`)
             .end(Ajax.end((obj) => {
               const inst = createModelInstance(_className, obj[_className][0]);
               resolve(inst);
             }, reject));
        };
        return new Promise(func);
      }

      static findAll(){
        return classList[_className].select().findList();
      }

      static select(alias?:string){
        if(alias){
          alias = alias.replace(/^#+/, '');
        }
        return new Query(appPot, _className, alias);
      }

      isNew(){
        return !this._columns['objectId'];
      }

      get(colName?: string){
        if(colName){
          return this._columns[colName];
        }else{
          return this._columns;
        }
      }

      set(...args){
        let toBe = {};
        if(args.length == 1 && typeof args[0] == 'object'){
          toBe = args[0];
        }else{
          toBe[args[0]] = args[1];
        }
        this._columns = objectAssign({}, this._columns, toBe);
        this._columns = classList[_className].sliceColumns(this._columns);
        this._columns = classList[_className].parseColumns(this._columns);
        Object.keys(this._columns).forEach((key) => {
          if(modelMethods.indexOf(key) != -1){
            throw new Error(-1, 'Invalid column name: ' + key);
          }
        });
        Object.keys(this._columns).forEach((key) => {
          Object.defineProperty(this, key, {
            get: function () {
                return this._columns[key];
            },
            set: function (value) {
                this._columns[key] = value;
            },
            enumerable: true,
            configurable: true
          });
        });
        return this;
      }

      static const noNeedColumns = [
        'groupIds',
      ]

      static sliceColumns(columns){
        classList[_className].noNeedColumns.forEach((val) => {
           delete columns[val];
        });
        return columns;
      }

      static const dateColumns = [
        'serverUpdateTime',
        'serverCreateTime'
      ]

      static parseColumns(columns){
        let _columns = {};
        objectAssign(_columns, columns);
        classList[_className].dateColumns.forEach((val) => {
          if(!(columns[val] instanceof Date)){
            _columns[val] = moment(columns[val]).toDate();
          }
        });
        Object.keys(modelColumns).forEach((key) => {
          if(columns[key] === null || columns[key] === undefined){
            return;
          }
          if(modelColumns[key]['type'] == DataType.Long ||
             modelColumns[key]['type'] == DataType.Integer){
            _columns[key] = parseInt(columns[key]);
          }else if(modelColumns[key]['type'] == DataType.Bool &&
                  typeof _columns[key] != 'boolean' ){
            _columns[key] = !!parseInt(columns[key]);
          }else if(modelColumns[key]['type'] == DataType.DateTime &&
                   !(_columns[key] instanceof Date) ){
            _columns[key] = new Date(parseInt(columns[key]));
          }else if(modelColumns[key]['type'] == DataType.Double){
            _columns[key] = parseFloat(columns[key]);
          }
        });
        return _columns;
      }

      static formatColumns(columns, isCreate){
        let _columns = {};
        objectAssign(_columns, columns);
        classList[_className].dateColumns.forEach((val) => {
          if((columns[val] instanceof Date)){
            _columns[val] = moment(columns[val])
                .utcOffset(9)
                .format('YYYY-MM-DDTHH:mm:ss.SSSZ');
          }
        });
        Object.keys(modelColumns).forEach((key) => {
          if(columns[key] === null || columns[key] === undefined){
            return;
          }
          if(modelColumns[key]['type'] == DataType.Bool){
            _columns[key] = columns[key] ? 1 : 0;
          }else if(modelColumns[key]['type'] == DataType.DateTime){
            if(!(columns[key] instanceof Date)){
              throw new Error(-1, 'invalid type: column ' + _className + '"."' + key + '"');
            }
            _columns[key] = columns[key].getTime();
          }else if(modelColumns[key]['type'] == DataType.Double){
            if(typeof columns[key] != 'number'){
              throw new Error(-1, 'invalid type: column ' + _className + '"."' + key + '"');
            }
            _columns[key] = columns[key] + "";
          }
        });
        if(isCreate){
          _columns['createTime'] = Date.now()/1000;
        }
        _columns['updateTime'] = Date.now()/1000;
        return classList[_className].doDefinedColumnOnly(_columns);
      }

      static doDefinedColumnOnly(columns){
        let filteredColumns = {};
        Object.keys(modelColumns).forEach((col)=>{
          filteredColumns[col] = columns[col];
        });
        filteredColumns['objectId'] = columns['objectId'];
        filteredColumns['scopeType'] = columns['scopeType'] || 1;
        filteredColumns['serverCreateTime'] = columns['serverCreateTime'];
        filteredColumns['serverUpdateTime'] = columns['serverUpdateTime'];
        filteredColumns['createTime'] = columns['createTime'];
        filteredColumns['updateTime'] = columns['updateTime'];
        return filteredColumns;
      }

      insert(...args){
        this.set.apply(this, args);
        if(!this.isNew()){
          return Promise.reject(new Error(-1, 'object is created'));
        }
        const func = (resolve, reject) => {
          var columns = classList[_className].formatColumns(this._columns, true);
          appPot.getAjax().post(`data/batch/addData`)
            .send({
              objectName: _className,
              data: [columns]
            })
            .end(Ajax.end((obj) => {
              resolve( this.set(obj['results'][0]) );
            }, reject));
        }
        return new Promise(func);
      }

      update(...args){
        if(this.isNew()){
          return Promise.reject(new Error(-1, 'object is not created'));
        }
        this.set.apply(this, args);
        const func = (resolve, reject) => {
          var columns = classList[_className].formatColumns(this._columns, false);
          appPot.getAjax().post('data/batch/updateData')
            .send({
              objectName: _className,
              data: [columns]
            })
            .end(Ajax.end((obj) => {
              this.set(obj['results'][0]);
              resolve(this);
            }, reject));
        };
        return new Promise(func);
      }

      save(...args){
        if(this.isNew()){
          return this.insert.apply(this, args);
        }else{
          return this.update.apply(this, args);
        }
      }

      static removeById(_id){
        return classList[_className].findById(_id).then(function(model){
          return model.remove();
        });
      }

      remove(){
        const func = (resolve, reject) => {
          appPot.getAjax().post('data/batch/deleteData')
            .send({
              objectName: _className,
              objectIds: [{
                objectId: this.get('objectId'),
                serverUpdateTime: moment(this.get('serverUpdateTime'))
                  .utcOffset(9)
                  .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
              }]
            })
            .end(Ajax.end(resolve, reject));
        };
        return new Promise(func);
      }
    };

    return classList[_className]
  }

  class Query {

    private _queryObj: any;
    private _className: string;
    private _ajax: Ajax;

    constructor(appPot:AppPot, className:string, alias?:string){
      this._className = className;
      this._queryObj = {
        'from': {
          'phyName': this._className
        }
      };
      this._ajax = appPot.getAjax();
      if(alias){
        this._queryObj['from']['alias'] = alias;
      }else{
        this._queryObj['from']['alias'] = this._className;
      }
    }

    private normalizeExpression(args){
      if(args.length >= 2){
        return new Expression(args);
      }else if(args[0] instanceof Expression){
        return args[0]
      }else if(typeof args[0] == 'string'){
        return new Expression(args[0]);
      }else{
        throw 'faild to normalize expression: ' + JSON.stringify(args);
      }
    }

    valuesIn(columnName, values){
      const alias = this._queryObj['from']['alias'];
      let query = `#${alias}.${columnName} = ?`;
      for(let i = 0; i < values.length-1; i++){
        query += ` or #${alias}.${columnName} = ?`;
      }
      const exp = this.normalizeExpression([
        query, ...values
      ]);
      if(!this._queryObj['where']){
        this._queryObj['where'] = {};
      }
      this._queryObj['where']['expression'] = exp.getQuery();
      return this;
    }

    where(...args){
      const exp = this.normalizeExpression(args);
      if(!this._queryObj['where']){
        this._queryObj['where'] = {};
      }
      this._queryObj['where']['expression'] = exp.getQuery();
      return this;
    }

    join(modelClass, ...args){
      let joinType:number;
      if(typeof args[0] == 'number'){
        joinType = args.shift();
      }
      let joinStr = 'LEFT JOIN';
      switch(joinType){
        case JoinType.LeftOuter:
          joinStr = 'LEFT OUTER';
          break;
        case JoinType.LeftInner:
          joinStr = 'LEFT JOIN';
          break;
      }
      const exp = this.normalizeExpression(args);
      if(!this._queryObj['join']){
        this._queryObj['join'] = [];
      }
      this._queryObj['join'].push({
        type: joinStr,
        entity: modelClass.className,
        entityAlias: modelClass.className,
        expression: exp.getQuery()
      });
      return this;
    }

    orderBy(...args){
      if(!this._queryObj['orderBy']){
        this._queryObj['orderBy'] = [];
      }
      let order = {};
      if(typeof args[0] == 'string'){
        order['column'] = args[0];
        if(args.length == 1){
          order['type'] = 'asc';
        }else{
          if(typeof args[1] == 'string'){
            order['type'] = args[1];
          }else{
            order['type'] = Order[args[1]];
          }
        }
      }
      this._queryObj['orderBy'].push(order);
      return this;
    }

    limit(...args){
      this._queryObj['range'] = {
        limit: args[0] || 1000,
        offset: 1
      };
      if(args.length == 2){
        this._queryObj['range']['offset'] = args[1]+1;
      }
      return this;
    }

    resetQuery(){
      this._queryObj = {};
      return this;
    }

    findOne(){
      this._queryObj['range'] = this._queryObj['range'] || {
        limit: 1,
        offset: 1
      };
      return this._post()
        .then((obj) => {
          let ret = {};
          Object.keys(obj).forEach((key) => {
            ret[key] = createModelInstance(key, obj[key][0]);
          });
          return ret;
        });
    }

    findList(){
      return this._post()
        .then((obj) => {
          let ret = {};
          Object.keys(obj).forEach((key) => {
            ret[key] = [];
            obj[key].forEach((valval, idx) => {
              ret[key].push(createModelInstance(key, valval));
            })
          });
          return ret;
        });
    }

    private _post(){
      const func = (resolve, reject) => {
          this._ajax.post(`data/${this._className}`)
            .send(this._queryObj)
            .end(Ajax.end(resolve, (err)=>{
              if(err.response.statusCode == 404){
                let models = [this._className];
                if(this._queryObj.join instanceof Array){
                  this._queryObj.join.forEach((joinObj)=>{
                    models.push(joinObj.entity);
                  });
                }
                let emptyArrays = {};
                models.forEach((name)=>{
                  emptyArrays[name] = [];
                });
              }else{
                reject(err);
              }
            }));
        };
        return new Promise(func);
    }
  }
}
