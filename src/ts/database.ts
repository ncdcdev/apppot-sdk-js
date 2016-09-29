import {AppPot} from './apppot';
import {DataType} from './types';
import {Ajax} from './ajax';
import {Config} from './config';
import {AuthInfo} from './auth-info';
import {Promise} from 'es6-promise';
import {Error} from './error';

export class Database {

  static dropAndCreateDatabase(appPot: AppPot, models:any[]){
    return Database._createAppData(appPot, models, true);
  }

  static createDatabase(appPot: AppPot, models:any[]){
    return Database._createAppData(appPot, models, false);
  }

  /*checkDatabase(){
    return new Promise((resolve, reject) => {
      this._ajax.get('schemas')
        .query(`appId=${this._config.appId}`)
        .query(`appVersion=${this._config.appVersion}`)
        .query(`companyId=${this._config.companyId}`)
        .end((err, res) => {
          if(err){
            reject(err);
          }else{
            let json = JSON.parse(res.text);
            if(json.status == 'error'){
              reject(json);
            }else{
              resolve(json);
            }
          }
        })
    });
  }*/

  private static _makeDefaultTable(tableName){
    return {
      'primary_key': 'objectId',
      'name': tableName,
      'columns': [
        {
          'colName': 'objectId',
          'type': 'varchar'
        },
        {
          'colName': 'scopeType',
          'type': 'varchar'
        },
        {
          'colName': 'createTime',
          'type': 'long'
        },
        {
          'colName': 'updateTime',
          'type': 'long'
        }
      ]
    };
  }

  private static _buildColumnItem(name, col){
    let column = {
      colName: name,
      type: DataType[col.type].toLowerCase()
    };
    switch(column.type){
      case 'varchar':
        column['fieldLength'] = col.length;
        break;
      case 'bool':
        column['type'] = 'varchar';
        column['fieldLength'] = 1;
        break;
      case 'datetime':
        column['type'] = 'long';
        break;
    }
    return column;
  }

  private static _createAppData(appPot, models, reset){
    let tables = [];
    let errors = [];
    for(let idx in models){
      let cols = models[idx].modelColumns;
      let tableName = models[idx].className;
      if(!tableName){
        return Promise.reject(new Error(-1, 'table name is Required'));
      }
      let table = Database._makeDefaultTable(tableName);
      for(let name in cols){
        if(name == 'objectId'){
          errors.push(`invalid column name: ${tableName}.${name}`);
          continue;
        }
        table.columns.push(Database._buildColumnItem(name, cols[name]));
      }
      tables.push(table);
    }
    if(errors.length != 0){
      return Promise.reject(new Error(-1, errors.join('\n')));
    }
    let request = {
      appId: appPot.getConfig().appId,
      appVersion: appPot.getConfig().appVersion,
      isResetDatabase: reset,
      companyId: appPot.getConfig().companyId,
      tables: tables
    };
    return new Promise((resolve, reject) => {
      appPot.getAjax().post('schemas')
        .send(request)
        .end(Ajax.end(resolve, reject));
    });
  }
}
