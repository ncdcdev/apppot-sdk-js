import {DataType} from './types';
import {Ajax} from './ajax';
import {Error} from './error';
import {AppPot} from './apppot';
import * as moment from 'moment';
import {Promise} from 'es6-promise';
import {Database} from './database';
import SqliteClauseTranslator from './sqlite-clause-translator.ts';
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
    LeftOuter = 2,
    RightOuter = 3,
    Inner = 4
  }

  export enum Order {
    asc,
    desc
  }

  let classList = {};

  function createModelInstance(className, columns?:any[], classObj?){
    const _class = classObj ? classObj : classList[className];
    if(columns){
      return new _class(columns);
    }else{
      return new _class();
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

      /* ローカル系 メソッド */
      static saveToLocal(...args){
        let query = classList[_className].select();
        if(args.length != 0){
          query = query.where(args);
        }
        return query.findList()
          .then(result => {
            return classList[_className].insertAllLocal(result[_className]);
          })
      }

      static findAllLocal(){
        return classList[_className].selectLocal().findList();
      }

      static findByIdLocal(id:string){
        return classList[_className].selectLocal()
          .where('objectId = ?', id)
          .findOne();
      }

      static insertLocal(data: Object){
        return classList[_className].insertAllLocal([data])
          .then(models => models[0]);
      }

      static insertAllLocal(objects: ModelClass[] | Object[]){

        let { columns, models } = classList[_className]._normalizeColumns(objects);
        const colNames = Object.keys(columns[0]).map(colName => {
          return colName
        });
        const placeHolders = colNames.map( _ => {
          return '?'
        }).join(',');
        console.log(columns);
        console.log(models);
        const records = columns.map( (record, idx) => {
          return colNames.map( key => {
            if( key == 'objectId' && ( record[key] === null||record[key] === undefined ) ){
              const id = `${_className}_${appPot.uuid()}`;
              models[idx].set('objectId', id);
              console.log('assign objectId: '+id);
              return id;
            }
            return record[key];
          });
        });

        return new Promise( ( resolve, reject ) => {

          const db = appPot.getLocalDatabase();
          if(!db){
            reject('Local Database is undefined');
          }

          const createTable = Database.getSqliteTableDefinition(classList[_className]);


          db.transaction((tx)=>{
            console.log(createTable);
            tx.executeSql(createTable);
            records.forEach( record => {
              const escapedColNames = colNames.map(name => "`"+name+"`");
              const query = `INSERT INTO ${_className} ( ${escapedColNames.join(',')} ) VALUES ( ${placeHolders} )`;
              console.log(query);
              console.log(record);
              //console.log( JSON.stringify( record ) );
              tx.executeSql(query, record);
            });
          }, (error) => {
            reject(error);
          }, () => {
            console.log('success');
            resolve(models);
          });
        });
      }

      static selectLocal(alias?:string){
        if(alias){
          alias = alias.replace(/^#+/, '');
        }
        return new Query(appPot, this||classList[_className], alias, appPot.getLocalDatabase());
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

      static _normalizeColumns(objects: ModelClass[] | Object[]){
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
            const model =  new (this||classList[_className])(column);
            return model;
          });
        }
        return {
          columns: _models.map((_model) => {
            return classList[_className].formatColumns(_model.get(), true);
          }),
          models: _models
        }
      }

      static insertAll(objects: ModelClass[] | Object[]){
        let { columns, models } = classList[_className]._normalizeColumns(objects);
        return classList[_className]._rawInsert(columns)
          .then((obj)=>{
            obj['results'].forEach((val, idx) => {
              models[idx].set(val);
            });
            return models;
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
            return new (this||classList[_className])(createdColumns);
          });
      }

      static findById(id:string){
        const func = (resolve, reject) => {
           appPot.getAjax().get(`data/${_className}/${id}`)
             .end(Ajax.end((obj) => {
               const inst = new (this||classList[_className])(obj[_className][0]);
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
        return new Query(appPot, this||classList[_className], alias);
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
            if(columns[key] === ""){
              _columns[key] = null;
            }else{
              _columns[key] = parseInt(columns[key]);
            }
          }else if(modelColumns[key]['type'] == DataType.Bool &&
                  typeof _columns[key] != 'boolean' ){
            if(columns[key] === ""){
              _columns[key] = null;
            }else{
              _columns[key] = !!parseInt(columns[key]);
            }
          }else if(modelColumns[key]['type'] == DataType.DateTime &&
                   !(_columns[key] instanceof Date) ){
            if(columns[key] === ""){
              _columns[key] = null;
            }else{
              _columns[key] = new Date(parseInt(columns[key]));
            }
          }else if(modelColumns[key]['type'] == DataType.Double){
            if(columns[key] === ""){
              _columns[key] = null;
            }else{
              _columns[key] = parseFloat(columns[key]);
            }
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
            if(typeof columns[key] == 'number'){
              _columns[key] = columns[key] + "";
            }else{
              _columns[key] = parseFloat(columns[key]) + "";
            }
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
        filteredColumns['scopeType'] = columns['scopeType'] || 2;
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
    private _class;
    private _ajax: Ajax;
    private _keyClassMap;
    private _localDB: any;

    constructor(appPot:AppPot, classObj, alias?:string, localDB?:any){
      this._class = classObj;
      this._queryObj = {
        'from': {
          'phyName': this._class.className
        }
      };
      this._localDB = localDB || false;
      this._ajax = appPot.getAjax();
      if(alias){
        this._queryObj['from']['alias'] = alias;
      }else{
        this._queryObj['from']['alias'] = this._class.className;
      }
      this._keyClassMap = {};
      this._keyClassMap[ this._queryObj['from']['alias'] ] = this._class.className;
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
      let joinType:number = JoinType.LeftInner;
      let alias:string = modelClass.className;
      if(typeof args[0] == 'number'){
        joinType = args.shift();
      }
      if(typeof args[0] == 'object'){
        let opts = args.shift();
        alias = opts.alias ? opts.alias : alias;
        joinType = opts.joinType ? opts.joinType : joinType;
      }
      let joinStr = 'LEFT JOIN';
      switch(joinType){
        case JoinType.LeftOuter:
          joinStr = 'LEFT OUTER JOIN';
          break;
        case JoinType.LeftInner:
          joinStr = 'LEFT JOIN';
          break;
        case JoinType.RightOuter:
          joinStr = 'RIGHT OUTER JOIN';
          break;
        case JoinType.Inner:
          joinStr = 'INNER JOIN';
          break;
      }
      const exp = this.normalizeExpression(args);
      if(!this._queryObj['join']){
        this._queryObj['join'] = [];
      }
      this._queryObj['join'].push({
        type: joinStr,
        entity: modelClass.className,
        entityAlias: alias,
        expression: exp.getQuery()
      });
      this._keyClassMap[alias] = modelClass.className;
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
      if(this._localDB){
        return this._queryToLocal()
          .then( result => {
            let returnResult = {};
            Object.keys(result).forEach( alias => {
              returnResult[alias] = result[alias][0];
            });
            return returnResult;
          });
      }
      return this._post()
        .then((obj) => {
          let ret = {};
          Object.keys(this._keyClassMap).forEach(key => {
            const className = this._keyClassMap[key];
            let classObj = false;
            if(className == this._class.className){
              classObj = this._class;
            }
            if(obj[key]){
              ret[key] = createModelInstance(className, obj[key][0], classObj);
            }else{//指定したaliasでなく、classNameがkey名だった場合
              ret[key] = createModelInstance(className, obj[className][0], classObj);
            }
          });
          return ret;
        });
    }

    findList(){
      if(this._localDB){
        return this._queryToLocal();
          
      }
      return this._post()
        .then((obj) => {
          let ret = {};
          Object.keys(this._keyClassMap).forEach(key => {
            ret[key] = [];
            const className = this._keyClassMap[key];
            let classObj = false;
            if(className == this._class.className){
              classObj = this._class;
            }
            const models = obj[key] ? obj[key] : obj[className];
            models.forEach((valval, idx) => {
              ret[key].push( createModelInstance(className, valval, classObj) );
            });
          });
          return ret;
        });
    }

    private _queryToLocal(){
      console.log('_queryToLocal');
      return (new Promise( (resolve, reject) => {
        const queryObj = (new SqliteClauseTranslator()).translate( this._queryObj, this._keyClassMap, classList);
        if(!this._localDB){
          reject('Local Database is undefined');
        }
        this._localDB.transaction((tx)=>{
          console.log(queryObj.query);
          console.log(queryObj.params);
          tx.executeSql(queryObj.query, queryObj.params, (...args) => {
            console.log('callback 2');
            console.log(args);
            let returnArray = [];
            for(var i = 0; i < args[1].rows.length; i++){
              returnArray.push(args[1].rows.item(i));
            }
            console.log(returnArray);
            resolve(returnArray);
          }, (...args) => {
            console.log('callback 1');
            console.log(args);
            reject(args[0].message);
          });
        });
      })).then( (records:Object[]) => {
        let preReturnObject = {};
        Object.keys(this._keyClassMap).forEach( alias => {
          preReturnObject[alias] = [];
        });
        records.forEach( (record, idx) => {
          Object.keys(record).forEach( colName => {
            const matches = colName.match(/(.*)____(.*)/);
            console.log(matches);
            const alias = matches[1];
            const trueColName = matches[2];
            if(!preReturnObject[alias][idx]){
              preReturnObject[alias][idx] = {};
            };
            preReturnObject[alias][idx][trueColName] = record[colName];
          });
        });
        console.log(preReturnObject);
        let returnObject = {};
        Object.keys(preReturnObject).forEach( alias => {
          returnObject[alias] = preReturnObject[alias].map( record => {
            return createModelInstance( this._keyClassMap[alias], record );
          });
        });
        console.log(returnObject);
        return returnObject;
      });
    }

    private _post(){
      const func = (resolve, reject) => {
          this._ajax.post(`data/query/${this._class.className}`)
            .send(this._queryObj)
            .end(Ajax.end(resolve, (err)=>{
              if(err.response && err.response.statusCode == 404){
                let models = [this._class.className];
                if(this._queryObj.join instanceof Array){
                  this._queryObj.join.forEach((joinObj)=>{
                    models.push(joinObj.entity);
                  });
                }
                let emptyArrays = {};
                models.forEach((name)=>{
                  emptyArrays[name] = [];
                });
                resolve(emptyArrays);
              }else{
                reject(err);
              }
            }));
        };
        return new Promise(func);
    }
  }
}
