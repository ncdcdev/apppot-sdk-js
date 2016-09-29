export class Config {
  private props:any;
  constructor(props){
    this.props = props;
    const url = this.props.url;
    if( url.charAt(url.length - 1) != '/'){
      this.props.url += '/';
    }
    this.props.deviceUDID = 'apppotsdkjs';
  }
  get entryPoint(){
    return this.props.url + 'api/'
        + this.props.companyId + '/'
        + this.props.appId + '/'
        + this.props.appVersion + '/';
  }
  get timeout(){
    return this.props.timeout || 10000;
  }
  get url(){
    return this.props.url;
  }
  get appId(){
    return this.props.appId;
  }
  get appKey(){
    return this.props.appKey;
  }
  get appVersion(){
    return this.props.appVersion;
  }
  get deviceUDID(){
    return this.props.deviceUDID;
  }
  get companyId(){
    return this.props.companyId;
  }
  get groupId(){
    return this.props.groupId;
  }
}
