export class Error {
  private _code: number;
  private _description: string;
  constructor(code, description){
    this._code = code;
    this._description = description;
  }
  get code(){
    return this._code;
  }
  get description(){
    return this._description;
  }
}
