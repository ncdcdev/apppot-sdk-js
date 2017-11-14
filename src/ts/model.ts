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
              return this.get(key);
            },
            set: function (value) {
              this.set(key, value);
            },
            enumerable: true,
            configurable: true
          });
        });
        if(columns){
          this.set(columns);
        }
      }

      static _getColumnsPlaceholders(includeDates){
        const colNames = Object.keys(classList[_className].filterDefinedColumnOnly({})).map(colName => {
          return colName
        });

        const placeholders = colNames.map( _ => {
          return '?'
        });

        return {
          colNames,
          placeholders
        };
      }

      static _insertAllLocal(objects: ModelClass[] | Object[]){

        let { columns, models } = classList[_className]._normalizeColumns(objects);

        const {colNames, placeholders} =  classList[_className]._getColumnsPlaceholders();

        const objectIds = [];
        const records = columns.map( (record, idx) => {
          return colNames.map( key => {
            if( key == 'objectId' && ( record[key] === null||record[key] === undefined ) ){
              const id = `${_className}_${appPot.uuid()}`;
              models[idx].set('objectId', id);
              objectIds[idx] = id;
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

          const createTables = Database.getSqliteTableDefinition(classList[_className]);

          db.transaction((tx)=>{
            createTables.forEach(table => {
              tx.executeSql(table);
            });
            records.forEach( (record, idx) => {
              const escapedColNames = colNames.map(name => "`"+name+"`");
              const query = `INSERT INTO ${_className} ( ${escapedColNames.join(',')} ) VALUES ( ${placeholders.join(',')} )`;
              console.log( query );
              console.log( JSON.stringify( record ) );
              tx.executeSql(query, record, () => {
                const query = `INSERT INTO ${SqliteClauseTranslator.getQueueTableName(_className)} ( \`type\`, \`id\`, \`serverUpdateTime\` ) VALUES ( ?, ?, ? )`;
                const params = ['created', objectIds[idx], null];
                console.log( query );
                console.log( JSON.stringify( params ) );
                tx.executeSql(query, params);
              });
            });
          }, (error) => {
            reject(error);
          }, () => {
            console.log('success');
            resolve(models);
          });
        });
      }

      static _insertAll(objects: ModelClass[] | Object[]){
        let { columns, models } = classList[_className]._normalizeColumns(objects);
        return classList[_className]._rawInsert(columns)
          .then((obj)=>{
            obj['results'].forEach((val, idx) => {
              models[idx].set(val);
            });
            return models;
          });
      }

      static insertAll(objects: ModelClass[] | Object[]){
        if(appPot.isOnline()){
          return classList[_className]._insertAll(objects);
        }else{
          return classList[_className]._insertAllLocal(objects);
        }
      }

      static _insertLocal(data: Object){
        return classList[_className]._insertAllLocal([data])
          .then(models => models[0]);
      }

      static _insert(data: Object){
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

      static insert(data: Object){
        if(appPot.isOnline()){
          return classList[_className]._insert(data);
        }else{
          return classList[_className]._insertLocal(data);
        }
      }

      static _findByIdLocal(id:string){
        console.log('findbyidlocal id: ' + id);
        return classList[_className]._selectLocal()
          .where('objectId = ?', id)
          .findOne()
          .then(obj => {
            console.log('findbyidlocal');
            console.log(obj);
            if(!obj[_className]) {
              return Promise.reject('not found');
            }
            return obj[_className];
          });
      }

      static _findById(id:string){
        const func = (resolve, reject) => {
           appPot.getAjax().get(`data/${_className}/${id}`)
             .end(Ajax.end((obj) => {
               const inst = new (this||classList[_className])(obj[_className][0]);
               resolve(inst);
             }, reject));
        };
        return new Promise(func);
      }

      static findById(id:string){
        if(appPot.isOnline()){
          return classList[_className]._findById(id);
        }else{
          return classList[_className]._findByIdLocal(id);
        }
      }

      static _findAllLocal(){
        return classList[_className]._selectLocal().findList();
      }

      static _findAll(){
        return classList[_className].select().findList();
      }

      static findAll(){
        if(appPot.isOnline()){
          return classList[_className]._findAll();
        }else{
          return classList[_className]._findAllLocal();
        }
      }

      static _selectLocal(alias?:string){
        if(alias){
          alias = alias.replace(/^#+/, '');
        }
        return new Query(appPot, this||classList[_className], alias, appPot.getLocalDatabase());
      }

      static _select(alias?:string){
        if(alias){
          alias = alias.replace(/^#+/, '');
        }
        return new Query(appPot, this||classList[_className], alias);
      }

      static select(alias?:string){
        if(appPot.isOnline()){
          return classList[_className]._select(alias);
        }else{
          return classList[_className]._selectLocal(alias);
        }
      }

      static count(alias?:string) {
        return classList[_className].select().count(alias);
      }

      _insertLocal(...args){
        this.set.apply(this, args);
        if(!this.isNew()){
          return Promise.reject(new Error(-1, 'object is created'));
        }
        return classList[_className]
          ._insertLocal( this.get() )
          .then(() => {
            return this;
          });
      }

      _insert(...args){
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

      insert(...args){
        if(appPot.isOnline()){
          return this._insert.apply(this, args);
        }else{
          return this._insertLocal.apply(this, args);
        }
      }

      _updateLocal(...args){
        if(this.isNew()){
          return Promise.reject(new Error(-1, 'object is not created'));
        }
        this.set.apply(this, args);
        var columns = classList[_className].formatColumns(this._columns, false);

        const queryObj = (new SqliteClauseTranslator()).translateUpdate(_className, columns['objectId'], columns);

        return new Promise( ( resolve, reject ) => {
          const db = appPot.getLocalDatabase();
          db.transaction((tx)=>{
            console.log(queryObj.query);
            console.log(queryObj.params);
            tx.executeSql(queryObj.query, queryObj.params, (...args) => {
              const query = `INSERT OR IGNORE INTO ${SqliteClauseTranslator.getQueueTableName(_className)} ( \`type\`, \`id\`, \`serverUpdateTime\` ) VALUES ( ?, ?, ? )`;
              const params = ['updated', columns['objectId'], null];
              console.log( query );
              console.log( JSON.stringify( params ) );
              tx.executeSql(query, params);
            });
          }, (error) => {
            reject(error);
          }, () => {
            console.log('success');
            resolve(this);
          });
        });
      }

      _update(...args){
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

      update(...args){
        if(appPot.isOnline()){
          return this._update.apply(this, args);
        }else{
          return this._updateLocal.apply(this, args);
        }
      }

      _saveLocal(...args) {
        if(this.isNew()){
          return this._insertLocal.apply(this, args);
        }else{
          return this._updateLocal.apply(this, args);
        }
      }

      _save(...args){
        if(this.isNew()){
          return this._insert.apply(this, args);
        }else{
          return this._update.apply(this, args);
        }
      }

      save(...args){
        if(appPot.isOnline()){
          return this._save.apply(this, args);
        }else{
          return this._saveLocal.apply(this, args);
        }
      }

      static removeById(_id){
        return classList[_className].findById(_id).then(function(model){
          return model.remove();
        });
      }

      _removeLocal(){
        return new Promise( ( resolve, reject ) => {
          const db = appPot.getLocalDatabase();
          db.transaction((tx)=>{
            const queryObj = (new SqliteClauseTranslator()).translateDelete(_className, this.get('objectId'));
            console.log(queryObj.query);
            console.log(queryObj.params);
            tx.executeSql(queryObj.query, queryObj.params);
            const query = `SELECT type FROM ${SqliteClauseTranslator.getQueueTableName(_className)} WHERE id = ?`
            const params = [this.get('objectId')];
            console.log(query);
            console.log(params);
            tx.executeSql(query, params, (...args) => {
              let query = `INSERT OR REPLACE INTO ${SqliteClauseTranslator.getQueueTableName(_className)} ( \`type\`, \`id\`, \`serverUpdateTime\` ) VALUES ( ?, ?, ? )`;
              let params = ['deleted', this.get('objectId'), this.get('serverUpdateTime')];
              if(args[1].rows.length > 0 && args[1].rows.item(0).type == 'created'){
                query = `DELETE FROM ${SqliteClauseTranslator.getQueueTableName(_className)} WHERE id = ?`;
                params = [this.get('objectId')];
              }
              console.log(query);
              console.log(params);
              tx.executeSql(query, params);
            });
          }, (error) => {
            console.log('error');
            console.log(error);
            reject(error);
          }, () => {
            console.log('success');
            resolve(true);
          });
        });
      }

      _remove(){
        const func = (resolve, reject) => {
          appPot.getAjax().post('data/batch/deleteData')
            .send({
              objectName: _className,
              objectIds: [{
                objectId: this.get('objectId'),
                serverUpdateTime: this.get('serverUpdateTime')
              }]
            })
            .end(Ajax.end(resolve, reject));
        };
        return new Promise(func);
      }

      remove(){
        if(appPot.isOnline()){
          return this._remove.apply(this);
        }else{
          return this._removeLocal.apply(this);
        }
      }

      isNew(){
        return !this._columns['objectId'];
      }

      static countUnsent(){
        return new Promise( ( resolve, reject ) => {
          let num = null;
          const db = appPot.getLocalDatabase();
          db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM ' + SqliteClauseTranslator.getQueueTableName(_className), [], (...args) => {
              num = {
                created: 0,
                updated: 0,
                deleted: 0
              };
              for(var i = 0; i < args[1].rows.length; i++){
                const record = args[1].rows.item(i);
                num[record.type]++;
              }
            });
          }, (error) => {
            reject(error);
          }, () => {
            resolve(num);
          });
        });
      }

      static getUnsents(){
        return new Promise( ( resolve, reject ) => {
          let returnObj = {
            created: [],
            updated: [],
            deleted: []
          };
          const db = appPot.getLocalDatabase();
          db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM ' + SqliteClauseTranslator.getQueueTableName(_className), [], (...args) => {
              for(var i = 0; i < args[1].rows.length; i++){
                const record = args[1].rows.item(i);
                returnObj[record.type].push({
                  objectId: record.id,
                  serverUpdateTime: record.serverUpdateTime
                });
              }
            });
          }, (error) => {
            reject();
          }, () => {
            resolve(returnObj);
          });
        }).then((obj) => {
          return Promise.all([
            classList[_className]._selectLocal()
              .valuesIn('objectId', obj['created'].map(o=>o['objectId']) )
              .findList(),
            classList[_className]._selectLocal()
              .valuesIn('objectId', obj['updated'].map(o=>o['objectId']) )
              .findList(),
            Promise.resolve(obj['deleted'])
          ]);
        }).then((results) => {
          return {
            created: results[0][_className],
            updated: results[1][_className],
            deleted: results[2]
          };
        });
      }

      static downlink(alias?:string){
        if( ! appPot.isOnline()){
          throw "offline mode";
        }
        if( appPot.isLocked(_className) ){
          throw "now locking";
        }
        return new QueryLimited(appPot, this||classList[_className], alias)
          .setLocalDatabase(appPot.getLocalDatabase());
      }

      static clearQueue(type){
        return new Promise( ( resolve, reject ) => {
          const db = appPot.getLocalDatabase();
          db.transaction((tx)=>{
            const query = 'DELETE FROM ' + SqliteClauseTranslator.getQueueTableName(_className) + ' WHERE type = ?';
            tx.executeSql(query, [type]);
          }, (error) => {
            reject(error);
          }, () => {
            resolve();
          });
        })
      }

      static uplink(conflict){
        if( ! appPot.isOnline()){
          throw "offline mode";
        }
        if( appPot.isLocked(_className) ){
          throw "now locking";
        }

        if(!conflict){
          conflict = () => {};
        }
        let queueList = null;
        const conflicted = {
          update: [],
          delete: []
        };

        appPot.lock(_className);
        return classList[_className].getUnsents().then(results => {
          queueList = results;
          return classList[_className]._insertAll( queueList['created'] );
        }).then(() => {
          return classList[_className].clearQueue('created');
        }).then(() => {
          return Promise.all(
            queueList['updated'].map(model => {
              return model.update()
                .catch(err => {
                  console.log(err);
                  //if(err.code == 130){
                    conflicted['update'].push(model);
                  //}
                  //return Promise.reject(err);
                  return Promise.resolve();
                });
            })
          );
        }).then(() => {
          return classList[_className].clearQueue('updated');
        }).then(() => {
          return Promise.all(
            queueList['deleted'].map(obj => {
              return new Promise( ( resolve, reject ) => {
                appPot.getAjax().post('data/batch/deleteData')
                  .send({
                    objectName: _className,
                    objectIds: [{
                      objectId: obj['objectId'],
                      serverUpdateTime: obj['serverUpdateTime']
                    }]
                  }).end(Ajax.end(resolve, reject));
              }).catch(err => {
                console.log(err);
                //if(err.code == 130){
                  conflicted['delete'].push(obj);
                //}
                //return Promise.reject(err);
                return Promise.resolve();
              });
            })
          );
        }).then(() => {
          return classList[_className].clearQueue('deleted');
        }).then(() => {
          appPot.unlock(_className);
          if(conflicted['update'] && conflicted['update'].length != 0 || conflicted['deleted'] && conflicted['deleted'].length != 0){
            conflict(conflicted);
          }
        }).catch(err => {
          appPot.unlock(_className);
          return Promise.reject(err);
        });
      }

      static _debug(){
        let returnArray = [];
        return new Promise( ( resolve, reject ) => {
          const db = appPot.getLocalDatabase();
          db.transaction((tx)=>{
            tx.executeSql('SELECT * FROM ' + _className, [], (...args) => {
              for(var i = 0; i < args[1].rows.length; i++){
                returnArray.push(args[1].rows.item(i));
              }
              tx.executeSql('SELECT * FROM ' + SqliteClauseTranslator.getQueueTableName(_className), [], (...args) => {
                for(var i = 0; i < args[1].rows.length; i++){
                  returnArray.push(args[1].rows.item(i));
                }
              });
            });
          }, (error) => {
            reject(error);
          }, () => {
            console.log('success');
            resolve(returnArray);
          });
        });
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
              return this.get(key);
            },
            set: function (value) {
              this.set(key, value);
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

      static parseColumns(columns){
        let _columns = {};
        objectAssign(_columns, columns);
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
        return classList[_className].filterDefinedColumnOnly(_columns);
      }

      static filterDefinedColumnOnly(columns){
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
    };

    return classList[_className]
  }

  class Query {

    protected _queryObj: any;
    protected _class;
    protected _appPot;
    protected _ajax: Ajax;
    protected _keyClassMap;
    protected _localDB: any;
    protected _useLocal: Boolean;

    constructor(appPot:AppPot, classObj, alias?:string, localDB?:any){
      this._class = classObj;
      this._queryObj = {
        'from': {
          'phyName': this._class.className
        }
      };
      this._appPot = appPot;
      this._localDB = localDB || false;
      this._useLocal = !!localDB;
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
      if(this._useLocal){
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
      if(this._useLocal){
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

    count() {
      return this._post(true)
        .then((obj) => {
          return obj;
        })
    }

    private _queryToLocal(){
      console.log('_queryToLocal');
      return (new Promise( (resolve, reject) => {
        const queryObj = (new SqliteClauseTranslator()).translateSelect( this._queryObj, this._keyClassMap, classList);
        if(!this._localDB){
          reject('Local Database is undefined');
        }
        let returnArray = [];
        this._localDB.transaction((tx)=>{
          console.log(queryObj.query);
          console.log(queryObj.params);
          tx.executeSql(queryObj.query, queryObj.params, (...args) => {
            for(var i = 0; i < args[1].rows.length; i++){
              returnArray.push(args[1].rows.item(i));
            }
          });
        }, (error) => {
          reject(error);
        }, () => {
          console.log('success');
          resolve(returnArray);
        });
      })).then( (records:Object[]) => {
        let preReturnObject = {};
        Object.keys(this._keyClassMap).forEach( alias => {
          preReturnObject[alias] = [];
        });
        records.forEach( (record, idx) => {
          Object.keys(record).forEach( colName => {
            const matches = colName.match(/(.*)____(.*)/);
            const alias = matches[1];
            const trueColName = matches[2];
            if(!preReturnObject[alias][idx]){
              preReturnObject[alias][idx] = {};
            };
            preReturnObject[alias][idx][trueColName] = record[colName];
          });
        });
        let returnObject = {};
        Object.keys(preReturnObject).forEach( alias => {
          returnObject[alias] = preReturnObject[alias].map( record => {
            return createModelInstance( this._keyClassMap[alias], record );
          });
        });
        return returnObject;
      });
    }

    private _post(isCount=false){
      let count = "";
      if (isCount) {
        count = "/count";
      }
      const func = (resolve, reject) => {
          this._ajax.post(`data/query/${this._class.className}${count}`)
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

  class QueryLimited extends Query {
    findOne(){
      return Promise.reject("Cannot use \"findOne\" method to downlink. Please use \"execute\" method.");
    }

    findList(){
      return Promise.reject("Cannot use \"findList\" method to downlink. Please use \"execute\" method.");
    }

    setLocalDatabase(db){
      this._localDB = db;
      return this;
    }

    execute(){
      const promiseFunc = results => (resolve, reject) => {
        this._localDB.transaction((tx)=>{
          const className = this._class.className;

          const {colNames, placeholders} =  classList[className]._getColumnsPlaceholders();
          const escapedColNames = colNames.map( c => '`' + c + '`' );

          const createTables = Database.getSqliteTableDefinition(this._class);

          createTables.forEach(table => {
            console.log(table);
            tx.executeSql(table);
          });

          console.log(`DELETE FROM ${className}`);
          tx.executeSql(`DELETE FROM ${className}`);
          console.log(`DELETE FROM ${SqliteClauseTranslator.getQueueTableName(className)}`);
          tx.executeSql(`DELETE FROM ${SqliteClauseTranslator.getQueueTableName(className)}`);

          const query = `INSERT INTO ${className} (${escapedColNames.join(',')}) VALUES (${placeholders.join(',')});`
          console.log(query);
          results[className].forEach( model => {
            const params = colNames.map( key => {
              return model.get(key);
            });
            console.log(params);
            tx.executeSql(query, params);
          });
        }, (error) => {
          this._appPot.unlock(this._class.className);
          reject(error);
        }, () => {
          this._appPot.unlock(this._class.className);
          resolve();
        });
      };

      this._appPot.lock(this._class.className);
      return super.findList()
        .then(results => {
          return new Promise(promiseFunc(results));
      });
    }
  }
}
