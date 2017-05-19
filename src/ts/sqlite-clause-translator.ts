export default class SqliteClauseTranslator {
  private _params;
  private _keyClassMap;
  private _classList;

  constructor(){
    this._params = [];
  }

  translate(queryObj, keyClassMap, classList){
    console.log(queryObj);
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
    return source.replace('#', '');
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
    const exp = queryObj['where']['expression'];
    return 'WHERE ' + this.expression(exp.source, exp.params);
  }

  selectFromJoin(queryObj){
    const mainTableAlias = queryObj['from']['alias'];
    const mainTableClass = this.getClass( mainTableAlias );
    let select = Object.keys(mainTableClass.modelColumns).map( col => {
      return `\`${mainTableAlias}\`.\`${col}\` AS ${mainTableAlias}____${col}`;
    });

    let from = `FROM ${queryObj['from']['phyName']}`
    if(queryObj['from']['phyName'] != queryObj['from']['alias']){
      from += ` AS ${queryObj['from']['alias']}`;
    }

    if(queryObj.join && queryObj.join.length > 0){
      queryObj.join.forEach( joinObj => {
        const alias = joinObj.entityAlias;
        from += `${joinObj.type} ${joinObj.entity}`
        if(joinObj.entity != alias){
          from += ` AS ${alias}`
        }
        let expression = this.expression(joinObj.expression.source, joinObj.expression.params);
        from += ` ON ${expression} `
        let joinColumns = Object.keys(this.getClass( alias ).modelColumns).map( col => {
          return `\`${alias}\`.\`${col}\` AS ${alias}____${col}`
        });
        select = select.concat( joinColumns );
      });
    }

    return `SELECT ${select.join(',')} ${from}`;
  }
}
