export default class SqliteClauseTranslator {
  private _params;
  private _keyClassMap;
  private _classList;

  constructor(){
    this._params = [];
  }

  static getQueueTableName(tableName) {
    return `apppot_${tableName}_queue`;
  }

  translateDelete(tableName, id){
    console.log('translateDelete');
    return {
      query: `DELETE FROM ${tableName} WHERE objectId = ?`,
      params: [id]
    }
  }

  translateUpdate(tableName, id, columns){
    const params = [];
    const sets = Object.keys(columns).map( key => {
      params.push( columns[key] );
      return `\`${key}\` = ?`
    });
    params.push(id);

    return {
      query: `UPDATE ${tableName} SET ${sets.join(',')} WHERE objectId = ?`,
      params
    }
  }

  translateSelect(queryObj, keyClassMap, classList){
    this._keyClassMap = keyClassMap;
    this._classList = classList;
    const sql = this.selectFromJoin(queryObj) + ' ' +
      this.where(queryObj) + ' ' +
      this.order(queryObj) + ' ' +
      this.limit(queryObj);
    return {
      query: sql,
      params: this._params
    };
  }

  getClass(alias){
    return this._classList[ this._keyClassMap[ alias ] ];
  }

  expression(source, params){
    this._params = this._params.concat( params );
    return source.replace(/#/g, '');
  }

  limit(queryObj){
    if(!queryObj.range){
      return '';
    }
    const limit = queryObj.range;
    return `LIMIT ${limit.limit} OFFSET ${limit.offset - 1}`;
  }

  order(queryObj){
    if(!queryObj.orderBy || queryObj.orderBy.length == 0){
      return '';
    }
    const orderBys = queryObj['orderBy'];
    return 'order by ' + orderBys.map( orderBy => {
      return `${orderBy['column']} ${orderBy['type']}`;
    }).join(',');
  }

  where(queryObj){
    if(queryObj.where && queryObj.where.expression){
      const exp = queryObj['where']['expression'];
      return 'WHERE ' + this.expression(exp.source, exp.params);
    }
    return '';
  }

  selectFromJoin(queryObj){
    const mainTableAlias = queryObj['from']['alias'];
    const mainTableClass = this.getClass( mainTableAlias );
    let select = Object.keys(mainTableClass.modelColumns).map( col => {
      return `\`${mainTableAlias}\`.\`${col}\` AS ${mainTableAlias}____${col}`;
    });
    select.push(`\`${mainTableAlias}\`.\`objectId\` AS ${mainTableAlias}____objectId`);

    let from = `FROM ${queryObj['from']['phyName']}`
    if(queryObj['from']['phyName'] != queryObj['from']['alias']){
      from += ` AS ${queryObj['from']['alias']}`;
    }

    if(queryObj.join && queryObj.join.length > 0){
      queryObj.join.forEach( joinObj => {
        const alias = joinObj.entityAlias;
        from += ` ${joinObj.type} ${joinObj.entity}`
        if(joinObj.entity != alias){
          from += ` AS ${alias}`
        }
        let expression = this.expression(joinObj.expression.source, joinObj.expression.params);
        from += ` ON ${expression} `
        let joinColumns = Object.keys(this.getClass( alias ).modelColumns).map( col => {
          return `\`${alias}\`.\`${col}\` AS ${alias}____${col}`
        });
        joinColumns.push(`\`${alias}\`.\`objectId\` AS ${alias}____objectId`);
        select = select.concat( joinColumns );
      });
    }

    return `SELECT ${select.join(',')} ${from}`;
  }
}
