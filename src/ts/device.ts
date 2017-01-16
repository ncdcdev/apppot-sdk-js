export default class Device {
  private _columns;

  constructor(args){
    this._columns = {
      udid: "",
      name: "",
      osType: "",
      token: ""
    };
    Object.keys(this._columns).forEach((key)=>{
      if(args[key]){
        this._columns[key] = args[key];
      }
    });
  }

  get udid(){
    return this._columns['udid'];
  }

  get token(){
    return this._columns['token'];
  }

  get name(){
    return this._columns['name'];
  }

  get osType(){
    return this._columns['osType'];
  }
}
