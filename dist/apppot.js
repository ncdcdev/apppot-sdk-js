(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AppPotSDK"] = factory();
	else
		root["AppPotSDK"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	/// <reference path="../../typings/index.d.ts" />
	var config_1 = __webpack_require__(1);
	var auth_info_1 = __webpack_require__(2);
	var ajax_1 = __webpack_require__(4);
	var local_authenticator_1 = __webpack_require__(12);
	var database_1 = __webpack_require__(16);
	var model_1 = __webpack_require__(18);
	var device_1 = __webpack_require__(20);
	var user_1 = __webpack_require__(21);
	var group_1 = __webpack_require__(22);
	var file_1 = __webpack_require__(23);
	var gateway_1 = __webpack_require__(24);
	var types_1 = __webpack_require__(17);
	var error_1 = __webpack_require__(11);
	var es6_promise_1 = __webpack_require__(13);
	var AppPot = (function () {
	    function AppPot(props) {
	        this._lock = [];
	        if (!props) {
	            return this._inst;
	        }
	        this._inst = this;
	        this._config = new config_1.Config(props);
	        this._authInfo = new auth_info_1.AuthInfo(this);
	        this._ajax = new ajax_1.Ajax(this._config, this._authInfo);
	        this._isOnline = true;
	        var authenticators = {
	            "LocalAuthenticator": local_authenticator_1.LocalAuthenticator
	        };
	        for (var idx in authenticators) {
	            this[idx] =
	                new authenticators[idx](this, this._config, this._authInfo);
	        }
	        this['User'] = user_1.getUserClass(this);
	        this['Model'] = model_1.Model;
	        this['Device'] = device_1.default;
	        this['Role'] = user_1.Role;
	        this['File'] = file_1.getFileClass(this);
	        this['GroupsRoles'] = user_1.GroupsRoles;
	        this['DataType'] = types_1.DataType;
	        this['Error'] = error_1.Error;
	        this['Group'] = group_1.getGroupClass(this);
	        this['Gateway'] = gateway_1.getGateway(this);
	    }
	    AppPot.prototype.uuid = function () {
	        var uuid = "";
	        for (var i = 0; i < 32; i++) {
	            var random = Math.random() * 16 | 0;
	            if (i == 8 || i == 12 || i == 16 || i == 20) {
	                uuid += "-";
	            }
	            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
	        }
	        return uuid;
	    };
	    AppPot.prototype.isLocked = function (tableName) {
	        return this._lock[tableName];
	    };
	    AppPot.prototype.lock = function (tableName) {
	        this._lock[tableName] = true;
	    };
	    AppPot.prototype.unlock = function (tableName) {
	        this._lock[tableName] = false;
	    };
	    AppPot.prototype.getAjax = function () {
	        return this._ajax;
	    };
	    AppPot.prototype.getConfig = function () {
	        return this._config;
	    };
	    AppPot.prototype.getAuthInfo = function () {
	        return this._authInfo;
	    };
	    AppPot.prototype.getUser = function () {
	        return this._authInfo.getUser();
	    };
	    AppPot.prototype.defineModel = function (className, modelColumns) {
	        return model_1.Model.define(this, className, modelColumns);
	    };
	    AppPot.prototype.createDatabase = function (models) {
	        return database_1.Database.createDatabase(this, models);
	    };
	    AppPot.prototype.dropAndCreateDatabase = function (models) {
	        return database_1.Database.dropAndCreateDatabase(this, models);
	    };
	    AppPot.prototype.setLocalDatabase = function (db) {
	        this._localDb = db;
	    };
	    AppPot.prototype.getLocalDatabase = function () {
	        return this._localDb;
	    };
	    AppPot.prototype.getBuildDate = function () {
	        return (1516077857) || "unknown";
	    };
	    AppPot.prototype.getVersion = function () {
	        return (["2","3","33"]).join('.') || "unknown";
	    };
	    AppPot.prototype.log = function (str, level) {
	        var _this = this;
	        if (level === void 0) { level = 'MONITOR'; }
	        if (!this._authInfo.hasToken()) {
	            return es6_promise_1.Promise.reject('not logined');
	        }
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            _this._ajax
	                .post('logs')
	                .send({
	                message: str,
	                logLevel: level
	            })
	                .end(ajax_1.Ajax.end(resolve, reject));
	        });
	    };
	    AppPot.prototype.sendPushNotification = function (message, target, title) {
	        var _this = this;
	        if (!this._authInfo.hasToken()) {
	            return es6_promise_1.Promise.reject('not logined');
	        }
	        console.log('sending push notification...');
	        var _target = (target instanceof Array) ? target : [target];
	        var payload = {
	            message: message,
	            target: _target
	        };
	        if (title) {
	            payload['title'] = title;
	        }
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            _this._ajax
	                .post('messages')
	                .send(payload)
	                .end(ajax_1.Ajax.end(resolve, reject));
	        });
	    };
	    AppPot.prototype.isOnline = function () {
	        return this._isOnline;
	    };
	    AppPot.prototype.online = function (isOnline) {
	        this._isOnline = isOnline;
	    };
	    AppPot.prototype.sendMail = function (sendingRouteName, mailFrom, mailTo, mailCc, mailBcc, subject, body) {
	        var _this = this;
	        if (!this._authInfo.hasToken()) {
	            return es6_promise_1.Promise.reject('not logined');
	        }
	        if (!(mailTo instanceof Array) ||
	            !(mailCc instanceof Array) ||
	            !(mailBcc instanceof Array)) {
	            return es6_promise_1.Promise.reject('mailTo, mailCc, mailBcc must be array');
	        }
	        if (mailTo.length == 0 && mailCc.length == 0 && mailBcc.length == 0) {
	            return es6_promise_1.Promise.reject('destination address is not specified');
	        }
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            _this._ajax.post('emails')
	                .send({
	                mailFrom: mailFrom,
	                mailTo: mailTo,
	                mailCc: mailCc,
	                mailBcc: mailBcc,
	                sendingRouteName: sendingRouteName,
	                subject: subject,
	                body: body
	            })
	                .end(ajax_1.Ajax.end(resolve, reject));
	        });
	    };
	    return AppPot;
	}());
	exports.AppPot = AppPot;
	var appPotInst = null;
	function getService(props) {
	    if (props) {
	        if (appPotInst) {
	            throw 'AppPot is already configured';
	        }
	        appPotInst = new AppPot(props);
	    }
	    return appPotInst;
	}
	exports.getService = getService;
	;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";
	var Config = (function () {
	    function Config(props) {
	        this.props = props;
	        var url = this.props.url;
	        if (url.charAt(url.length - 1) != '/') {
	            this.props.url += '/';
	        }
	        this.props.deviceUDID = 'apppotsdkjs';
	    }
	    Object.defineProperty(Config.prototype, "entryPoint", {
	        get: function () {
	            return this.props.url + 'api/'
	                + this.props.companyId + '/'
	                + this.props.appId + '/'
	                + this.props.appVersion + '/';
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "timeout", {
	        get: function () {
	            return this.props.timeout || 10000;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "url", {
	        get: function () {
	            return this.props.url;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "appId", {
	        get: function () {
	            return this.props.appId;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "appKey", {
	        get: function () {
	            return this.props.appKey;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "appVersion", {
	        get: function () {
	            return this.props.appVersion;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "deviceUDID", {
	        get: function () {
	            return this.props.deviceUDID;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "companyId", {
	        get: function () {
	            return this.props.companyId;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Config.prototype, "groupId", {
	        get: function () {
	            return this.props.groupId;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return Config;
	}());
	exports.Config = Config;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var objectAssign = __webpack_require__(3);
	var AuthInfo = (function () {
	    function AuthInfo(apppot) {
	        this._token = '';
	        this.apppot = apppot;
	    }
	    AuthInfo.prototype.hasToken = function () {
	        return this._token !== '';
	    };
	    AuthInfo.prototype.getToken = function () {
	        return this._token;
	    };
	    AuthInfo.prototype.getUser = function () {
	        return this._user;
	    };
	    AuthInfo.prototype.setUser = function (user) {
	        this._user = user;
	    };
	    AuthInfo.prototype.setToken = function (token) {
	        this._token = token;
	    };
	    AuthInfo.prototype.clearUser = function () {
	        this._user = null;
	    };
	    AuthInfo.prototype.clearToken = function () {
	        this._token = '';
	    };
	    AuthInfo.prototype.serialize = function () {
	        var obj = {};
	        obj['token'] = this._token;
	        obj['user'] = this._user._columns;
	        return JSON.stringify(obj);
	    };
	    AuthInfo.prototype.deserialize = function (str) {
	        var obj = JSON.parse(str);
	        if (obj) {
	            this.setToken(obj['token']);
	            var user = new (this.apppot.User)(obj['user']);
	            this.setUser(user);
	            return true;
	        }
	        return false;
	    };
	    return AuthInfo;
	}());
	exports.AuthInfo = AuthInfo;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/

	'use strict';
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}

			// Detect buggy property enumeration order in older V8 versions.

			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}

			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}

			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}

	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var superagent = __webpack_require__(5);
	var error_1 = __webpack_require__(11);
	var objectAssign = __webpack_require__(3);
	var Ajax = (function () {
	    function Ajax(config, authInfo) {
	        this._config = config;
	        this._authInfo = authInfo;
	    }
	    Ajax.prototype.setToken = function (agent) {
	        if (this._authInfo.hasToken()) {
	            var ret = agent.set('apppot-token', this._authInfo.getToken());
	            return ret;
	        }
	        else {
	            return agent;
	        }
	    };
	    Ajax.prototype.buildOpts = function (options) {
	        return objectAssign({
	            entryPoint: this._config.entryPoint,
	            timeout: this._config.timeout,
	            contentType: 'application/json'
	        }, options);
	    };
	    Ajax.prototype.get = function (url, options) {
	        var opts = this.buildOpts(options);
	        var agent = superagent
	            .get(opts.entryPoint + url)
	            .timeout(opts.timeout);
	        return this.setToken(agent);
	    };
	    Ajax.prototype.post = function (url, options) {
	        var opts = this.buildOpts(options);
	        var agent = superagent
	            .post(opts.entryPoint + url)
	            .timeout(opts.timeout);
	        if (opts.contentType != 'no-set') {
	            agent.set('Content-Type', opts.contentType);
	        }
	        return this.setToken(agent);
	    };
	    Ajax.prototype.update = function (url, options) {
	        return this.put(url, options);
	    };
	    Ajax.prototype.put = function (url, options) {
	        var opts = this.buildOpts(options);
	        var agent = superagent
	            .put(opts.entryPoint + url)
	            .timeout(opts.timeout);
	        if (opts.contentType != 'no-set') {
	            agent.set('Content-Type', opts.contentType);
	        }
	        return this.setToken(agent);
	    };
	    Ajax.prototype.remove = function (url, options) {
	        var opts = this.buildOpts(options);
	        var agent = superagent
	            .del(opts.entryPoint + url)
	            .timeout(opts.timeout);
	        if (opts.contentType != 'no-set') {
	            agent.set('Content-Type', opts.contentType);
	        }
	        return this.setToken(agent);
	    };
	    Ajax.end = function (resolve, reject, success, failed) {
	        return function (err, res) {
	            if (err) {
	                var obj = { "status": "error", "results": err, "response": res };
	                if (failed) {
	                    failed(obj);
	                }
	                else {
	                    reject(obj);
	                }
	            }
	            else {
	                if (res.type.match('octet-stream')) {
	                    resolve(res.text);
	                    return;
	                }
	                var obj = JSON.parse(res.text);
	                if (obj.hasOwnProperty('status') && obj['status'] == 'error') {
	                    if (failed) {
	                        failed(new error_1.Error(obj['errCode'], obj['description']));
	                    }
	                    else {
	                        reject(new error_1.Error(obj['errCode'], obj['description']));
	                    }
	                }
	                else {
	                    if (success) {
	                        success(obj);
	                    }
	                    else {
	                        resolve(obj);
	                    }
	                }
	            }
	        };
	    };
	    return Ajax;
	}());
	exports.Ajax = Ajax;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Emitter = __webpack_require__(6);
	var reduce = __webpack_require__(7);
	var requestBase = __webpack_require__(8);
	var isObject = __webpack_require__(9);

	/**
	 * Root reference for iframes.
	 */

	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  root = this;
	}

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isHost(obj) {
	  var str = {}.toString.call(obj);

	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}

	/**
	 * Expose `request`.
	 */

	var request = module.exports = __webpack_require__(10).bind(null, Request);

	/**
	 * Determine XHR.
	 */

	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  return false;
	};

	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */

	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */

	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pushEncodedKeyValuePair(pairs, key, obj[key]);
	        }
	      }
	  return pairs.join('&');
	}

	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */

	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (Array.isArray(val)) {
	    return val.forEach(function(v) {
	      pushEncodedKeyValuePair(pairs, key, v);
	    });
	  }
	  pairs.push(encodeURIComponent(key)
	    + '=' + encodeURIComponent(val));
	}

	/**
	 * Expose serialization method.
	 */

	 request.serializeObject = serialize;

	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */

	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var parts;
	  var pair;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    parts = pair.split('=');
	    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	  }

	  return obj;
	}

	/**
	 * Expose parser.
	 */

	request.parseString = parseString;

	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */

	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };

	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */

	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};

	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;

	  lines.pop(); // trailing CRLF

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }

	  return fields;
	}

	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */

	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function type(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function params(str){
	  return reduce(str.split(/ *; */), function(obj, str){
	    var parts = str.split(/ *= */)
	      , key = parts.shift()
	      , val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */

	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this.setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this.setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this.parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype.setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);

	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};

	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */

	Response.prototype.parseBody = function(str){
	  var parse = request.parse[this.type];
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype.setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }

	  var type = status / 100 | 0;

	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;

	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;

	  return err;
	};

	/**
	 * Expose `Response`.
	 */

	request.Response = Response;

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */

	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;

	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
	      return self.callback(err);
	    }

	    self.emit('response', res);

	    if (err) {
	      return self.callback(err, res);
	    }

	    if (res.status >= 200 && res.status < 300) {
	      return self.callback(err, res);
	    }

	    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	    new_err.original = err;
	    new_err.response = res;
	    new_err.status = res.status;

	    self.callback(new_err, res);
	  });
	}

	/**
	 * Mixin `Emitter` and `requestBase`.
	 */

	Emitter(Request.prototype);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */

	Request.prototype.abort = function(){
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr && this.xhr.abort();
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};

	/**
	 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
	 * 'arraybuffer'.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};

	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'basic'
	    }
	  }

	  switch (options.type) {
	    case 'basic':
	      var str = btoa(user + ':' + pass);
	      this.set('Authorization', 'Basic ' + str);
	    break;

	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};

	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/

	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  this._getFormData().append(field, file, filename || file.name);
	  return this;
	};

	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
	};

	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	  *      request.post('/user')
	  *        .send('name=tobi')
	  *        .send('species=ferret')
	  *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];

	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj || isHost(data)) return this;
	  if (!type) this.type('json');
	  return this;
	};

	/**
	 * @deprecated
	 */
	Response.prototype.parse = function serialize(fn){
	  if (root.console) {
	    console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
	  }
	  this.serialize(fn);
	  return this;
	};

	Response.prototype.serialize = function serialize(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};

	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */

	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;

	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;

	  this.callback(err);
	};

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	Request.prototype.timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};

	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */

	Request.prototype.withCredentials = function(){
	  this._withCredentials = true;
	  return this;
	};

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var query = this._query.join('&');
	  var timeout = this._timeout;
	  var data = this._formData || this._data;

	  // store callback
	  this._callback = fn || noop;

	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;

	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }

	    if (0 == status) {
	      if (self.timedout) return self.timeoutError();
	      if (self.aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = 'download';
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }

	  // querystring
	  if (query) {
	    query = request.serializeObject(query);
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }

	  // initiate request
	  if (this.username && this.password) {
	    xhr.open(this.method, this.url, true, this.username, this.password);
	  } else {
	    xhr.open(this.method, this.url, true);
	  }

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }

	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }

	  // send stuff
	  this.emit('request', this);

	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};


	/**
	 * Expose `Request`.
	 */

	request.Request = Request;

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};

	request['del'] = del;
	request['delete'] = del;

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */

	if (true) {
	  module.exports = Emitter;
	}

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	
	/**
	 * Reduce `arr` with `fn`.
	 *
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Mixed} initial
	 *
	 * TODO: combatible error handling?
	 */

	module.exports = function(arr, fn, initial){  
	  var idx = 0;
	  var len = arr.length;
	  var curr = arguments.length == 3
	    ? initial
	    : arr[idx++];

	  while (idx < len) {
	    curr = fn.call(null, curr, arr[idx], ++idx, arr);
	  }
	  
	  return curr;
	};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(9);

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Force given parser
	 *
	 * Sets the body parser no matter type.
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Faux promise support
	 *
	 * @param {Function} fulfill
	 * @param {Function} reject
	 * @return {Request}
	 */

	exports.then = function then(fulfill, reject) {
	  return this.end(function(err, res) {
	    err ? reject(err) : fulfill(res);
	  });
	}

	/**
	 * Allow for extension
	 */

	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}


	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */

	exports.getHeader = exports.get;

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	  this._getFormData().append(name, val);
	  return this;
	};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null != obj && 'object' == typeof obj;
	}

	module.exports = isObject;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }

	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }

	  return new RequestConstructor(method, url);
	}

	module.exports = request;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

	"use strict";
	var Error = (function () {
	    function Error(code, description) {
	        this._code = code;
	        this._description = description;
	    }
	    Object.defineProperty(Error.prototype, "code", {
	        get: function () {
	            return this._code;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Error.prototype, "description", {
	        get: function () {
	            return this._description;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return Error;
	}());
	exports.Error = Error;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var ajax_1 = __webpack_require__(4);
	var es6_promise_1 = __webpack_require__(13);
	var objectAssign = __webpack_require__(3);
	var LocalAuthenticator = (function () {
	    function LocalAuthenticator(appPot) {
	        var _this = this;
	        this.login = function (user, pass, isPush, device) {
	            return _this.getAnonymousToken(device)
	                .then(function () {
	                if (isPush && device) {
	                    return _this.devices(device);
	                }
	                else {
	                    return true;
	                }
	            })
	                .then(function () { return _this.apiLogin(user, pass, isPush, device); });
	        };
	        this.logout = function () {
	            return _this.apiLogout();
	        };
	        this.isLogined = function () {
	            return _this._isLogined;
	        };
	        this.getAnonymousToken = function (device) {
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                _this._appPot.getAjax().get('anonymousTokens')
	                    .query("appKey=" + _this._appPot.getConfig().appKey)
	                    .query("deviceUDID=" + (device && device.udid || _this._appPot.getConfig().deviceUDID))
	                    .end(ajax_1.Ajax.end(resolve, reject, function (obj) {
	                    _this._appPot.getAuthInfo().setToken(obj.results);
	                    resolve(obj.results);
	                }));
	            });
	        };
	        this._appPot = appPot;
	    }
	    LocalAuthenticator.prototype.devices = function (device) {
	        var _this = this;
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            _this._appPot.getAjax().post('devices')
	                .set('apppot-token', _this._appPot.getAuthInfo().getToken())
	                .send({
	                deviceToken: device.token,
	                deviceUDID: device.udid,
	                deviceName: device.name,
	                osType: device.osType
	            })
	                .end(ajax_1.Ajax.end(resolve, reject, function (obj) {
	                resolve();
	            }));
	        });
	    };
	    LocalAuthenticator.prototype.apiLogin = function (user, pass, isPush, device) {
	        var _this = this;
	        this._appPot.getAuthInfo().clearUser();
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            _this._appPot.getAjax().post('auth/login')
	                .set('apppot-token', _this._appPot.getAuthInfo().getToken())
	                .send({
	                username: user,
	                password: pass,
	                appId: _this._appPot.getConfig().appId,
	                deviceUDID: device ? device.udid : _this._appPot.getConfig().deviceUDID,
	                isPush: !!isPush,
	                appVersion: _this._appPot.getConfig().appVersion,
	                companyId: _this._appPot.getConfig().companyId
	            })
	                .end(ajax_1.Ajax.end(function (obj) {
	                if (obj.authInfor) {
	                    obj.authInfo = obj.authInfor;
	                    delete obj.authInfor;
	                }
	                _this._appPot.getAuthInfo().setToken(obj.authInfo.userTokens);
	                var user = new (_this._appPot.User)(objectAssign({}, obj.authInfo, obj.authInfo['userInfo']));
	                _this._appPot.getAuthInfo().setUser(user);
	                _this._isLogined = true;
	                resolve(_this._appPot.getAuthInfo());
	            }, function (obj) {
	                _this._isLogined = false;
	                reject(obj);
	            }));
	        });
	    };
	    LocalAuthenticator.prototype.apiLogout = function () {
	        var _this = this;
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            _this._appPot.getAjax().post('auth/logout')
	                .set('apppot-token', _this._appPot.getAuthInfo().getToken())
	                .send({})
	                .end(ajax_1.Ajax.end(function (obj) {
	                _this._appPot.getAuthInfo().clearToken();
	                _this._appPot.getAuthInfo().clearUser();
	                _this._isLogined = false;
	                resolve(_this._appPot.getAuthInfo());
	            }, reject));
	        });
	    };
	    return LocalAuthenticator;
	}());
	exports.LocalAuthenticator = LocalAuthenticator;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var require;/* WEBPACK VAR INJECTION */(function(process, global) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   3.3.1
	 */

	(function (global, factory) {
	     true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    (global.ES6Promise = factory());
	}(this, (function () { 'use strict';

	function objectOrFunction(x) {
	  return typeof x === 'function' || typeof x === 'object' && x !== null;
	}

	function isFunction(x) {
	  return typeof x === 'function';
	}

	var _isArray = undefined;
	if (!Array.isArray) {
	  _isArray = function (x) {
	    return Object.prototype.toString.call(x) === '[object Array]';
	  };
	} else {
	  _isArray = Array.isArray;
	}

	var isArray = _isArray;

	var len = 0;
	var vertxNext = undefined;
	var customSchedulerFn = undefined;

	var asap = function asap(callback, arg) {
	  queue[len] = callback;
	  queue[len + 1] = arg;
	  len += 2;
	  if (len === 2) {
	    // If len is 2, that means that we need to schedule an async flush.
	    // If additional callbacks are queued before the queue is flushed, they
	    // will be processed by this flush that we are scheduling.
	    if (customSchedulerFn) {
	      customSchedulerFn(flush);
	    } else {
	      scheduleFlush();
	    }
	  }
	};

	function setScheduler(scheduleFn) {
	  customSchedulerFn = scheduleFn;
	}

	function setAsap(asapFn) {
	  asap = asapFn;
	}

	var browserWindow = typeof window !== 'undefined' ? window : undefined;
	var browserGlobal = browserWindow || {};
	var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

	// test for web worker but not in IE10
	var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	// node
	function useNextTick() {
	  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	  // see https://github.com/cujojs/when/issues/410 for details
	  return function () {
	    return process.nextTick(flush);
	  };
	}

	// vertx
	function useVertxTimer() {
	  return function () {
	    vertxNext(flush);
	  };
	}

	function useMutationObserver() {
	  var iterations = 0;
	  var observer = new BrowserMutationObserver(flush);
	  var node = document.createTextNode('');
	  observer.observe(node, { characterData: true });

	  return function () {
	    node.data = iterations = ++iterations % 2;
	  };
	}

	// web worker
	function useMessageChannel() {
	  var channel = new MessageChannel();
	  channel.port1.onmessage = flush;
	  return function () {
	    return channel.port2.postMessage(0);
	  };
	}

	function useSetTimeout() {
	  // Store setTimeout reference so es6-promise will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var globalSetTimeout = setTimeout;
	  return function () {
	    return globalSetTimeout(flush, 1);
	  };
	}

	var queue = new Array(1000);
	function flush() {
	  for (var i = 0; i < len; i += 2) {
	    var callback = queue[i];
	    var arg = queue[i + 1];

	    callback(arg);

	    queue[i] = undefined;
	    queue[i + 1] = undefined;
	  }

	  len = 0;
	}

	function attemptVertx() {
	  try {
	    var r = require;
	    var vertx = __webpack_require__(15);
	    vertxNext = vertx.runOnLoop || vertx.runOnContext;
	    return useVertxTimer();
	  } catch (e) {
	    return useSetTimeout();
	  }
	}

	var scheduleFlush = undefined;
	// Decide what async method to use to triggering processing of queued callbacks:
	if (isNode) {
	  scheduleFlush = useNextTick();
	} else if (BrowserMutationObserver) {
	  scheduleFlush = useMutationObserver();
	} else if (isWorker) {
	  scheduleFlush = useMessageChannel();
	} else if (browserWindow === undefined && "function" === 'function') {
	  scheduleFlush = attemptVertx();
	} else {
	  scheduleFlush = useSetTimeout();
	}

	function then(onFulfillment, onRejection) {
	  var _arguments = arguments;

	  var parent = this;

	  var child = new this.constructor(noop);

	  if (child[PROMISE_ID] === undefined) {
	    makePromise(child);
	  }

	  var _state = parent._state;

	  if (_state) {
	    (function () {
	      var callback = _arguments[_state - 1];
	      asap(function () {
	        return invokeCallback(_state, child, callback, parent._result);
	      });
	    })();
	  } else {
	    subscribe(parent, child, onFulfillment, onRejection);
	  }

	  return child;
	}

	/**
	  `Promise.resolve` returns a promise that will become resolved with the
	  passed `value`. It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    resolve(1);
	  });

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.resolve(1);

	  promise.then(function(value){
	    // value === 1
	  });
	  ```

	  @method resolve
	  @static
	  @param {Any} value value that the returned promise will be resolved with
	  Useful for tooling.
	  @return {Promise} a promise that will become fulfilled with the given
	  `value`
	*/
	function resolve(object) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (object && typeof object === 'object' && object.constructor === Constructor) {
	    return object;
	  }

	  var promise = new Constructor(noop);
	  _resolve(promise, object);
	  return promise;
	}

	var PROMISE_ID = Math.random().toString(36).substring(16);

	function noop() {}

	var PENDING = void 0;
	var FULFILLED = 1;
	var REJECTED = 2;

	var GET_THEN_ERROR = new ErrorObject();

	function selfFulfillment() {
	  return new TypeError("You cannot resolve a promise with itself");
	}

	function cannotReturnOwn() {
	  return new TypeError('A promises callback cannot return that same promise.');
	}

	function getThen(promise) {
	  try {
	    return promise.then;
	  } catch (error) {
	    GET_THEN_ERROR.error = error;
	    return GET_THEN_ERROR;
	  }
	}

	function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	  try {
	    then.call(value, fulfillmentHandler, rejectionHandler);
	  } catch (e) {
	    return e;
	  }
	}

	function handleForeignThenable(promise, thenable, then) {
	  asap(function (promise) {
	    var sealed = false;
	    var error = tryThen(then, thenable, function (value) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;
	      if (thenable !== value) {
	        _resolve(promise, value);
	      } else {
	        fulfill(promise, value);
	      }
	    }, function (reason) {
	      if (sealed) {
	        return;
	      }
	      sealed = true;

	      _reject(promise, reason);
	    }, 'Settle: ' + (promise._label || ' unknown promise'));

	    if (!sealed && error) {
	      sealed = true;
	      _reject(promise, error);
	    }
	  }, promise);
	}

	function handleOwnThenable(promise, thenable) {
	  if (thenable._state === FULFILLED) {
	    fulfill(promise, thenable._result);
	  } else if (thenable._state === REJECTED) {
	    _reject(promise, thenable._result);
	  } else {
	    subscribe(thenable, undefined, function (value) {
	      return _resolve(promise, value);
	    }, function (reason) {
	      return _reject(promise, reason);
	    });
	  }
	}

	function handleMaybeThenable(promise, maybeThenable, then$$) {
	  if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	    handleOwnThenable(promise, maybeThenable);
	  } else {
	    if (then$$ === GET_THEN_ERROR) {
	      _reject(promise, GET_THEN_ERROR.error);
	    } else if (then$$ === undefined) {
	      fulfill(promise, maybeThenable);
	    } else if (isFunction(then$$)) {
	      handleForeignThenable(promise, maybeThenable, then$$);
	    } else {
	      fulfill(promise, maybeThenable);
	    }
	  }
	}

	function _resolve(promise, value) {
	  if (promise === value) {
	    _reject(promise, selfFulfillment());
	  } else if (objectOrFunction(value)) {
	    handleMaybeThenable(promise, value, getThen(value));
	  } else {
	    fulfill(promise, value);
	  }
	}

	function publishRejection(promise) {
	  if (promise._onerror) {
	    promise._onerror(promise._result);
	  }

	  publish(promise);
	}

	function fulfill(promise, value) {
	  if (promise._state !== PENDING) {
	    return;
	  }

	  promise._result = value;
	  promise._state = FULFILLED;

	  if (promise._subscribers.length !== 0) {
	    asap(publish, promise);
	  }
	}

	function _reject(promise, reason) {
	  if (promise._state !== PENDING) {
	    return;
	  }
	  promise._state = REJECTED;
	  promise._result = reason;

	  asap(publishRejection, promise);
	}

	function subscribe(parent, child, onFulfillment, onRejection) {
	  var _subscribers = parent._subscribers;
	  var length = _subscribers.length;

	  parent._onerror = null;

	  _subscribers[length] = child;
	  _subscribers[length + FULFILLED] = onFulfillment;
	  _subscribers[length + REJECTED] = onRejection;

	  if (length === 0 && parent._state) {
	    asap(publish, parent);
	  }
	}

	function publish(promise) {
	  var subscribers = promise._subscribers;
	  var settled = promise._state;

	  if (subscribers.length === 0) {
	    return;
	  }

	  var child = undefined,
	      callback = undefined,
	      detail = promise._result;

	  for (var i = 0; i < subscribers.length; i += 3) {
	    child = subscribers[i];
	    callback = subscribers[i + settled];

	    if (child) {
	      invokeCallback(settled, child, callback, detail);
	    } else {
	      callback(detail);
	    }
	  }

	  promise._subscribers.length = 0;
	}

	function ErrorObject() {
	  this.error = null;
	}

	var TRY_CATCH_ERROR = new ErrorObject();

	function tryCatch(callback, detail) {
	  try {
	    return callback(detail);
	  } catch (e) {
	    TRY_CATCH_ERROR.error = e;
	    return TRY_CATCH_ERROR;
	  }
	}

	function invokeCallback(settled, promise, callback, detail) {
	  var hasCallback = isFunction(callback),
	      value = undefined,
	      error = undefined,
	      succeeded = undefined,
	      failed = undefined;

	  if (hasCallback) {
	    value = tryCatch(callback, detail);

	    if (value === TRY_CATCH_ERROR) {
	      failed = true;
	      error = value.error;
	      value = null;
	    } else {
	      succeeded = true;
	    }

	    if (promise === value) {
	      _reject(promise, cannotReturnOwn());
	      return;
	    }
	  } else {
	    value = detail;
	    succeeded = true;
	  }

	  if (promise._state !== PENDING) {
	    // noop
	  } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	}

	function initializePromise(promise, resolver) {
	  try {
	    resolver(function resolvePromise(value) {
	      _resolve(promise, value);
	    }, function rejectPromise(reason) {
	      _reject(promise, reason);
	    });
	  } catch (e) {
	    _reject(promise, e);
	  }
	}

	var id = 0;
	function nextId() {
	  return id++;
	}

	function makePromise(promise) {
	  promise[PROMISE_ID] = id++;
	  promise._state = undefined;
	  promise._result = undefined;
	  promise._subscribers = [];
	}

	function Enumerator(Constructor, input) {
	  this._instanceConstructor = Constructor;
	  this.promise = new Constructor(noop);

	  if (!this.promise[PROMISE_ID]) {
	    makePromise(this.promise);
	  }

	  if (isArray(input)) {
	    this._input = input;
	    this.length = input.length;
	    this._remaining = input.length;

	    this._result = new Array(this.length);

	    if (this.length === 0) {
	      fulfill(this.promise, this._result);
	    } else {
	      this.length = this.length || 0;
	      this._enumerate();
	      if (this._remaining === 0) {
	        fulfill(this.promise, this._result);
	      }
	    }
	  } else {
	    _reject(this.promise, validationError());
	  }
	}

	function validationError() {
	  return new Error('Array Methods must be provided an Array');
	};

	Enumerator.prototype._enumerate = function () {
	  var length = this.length;
	  var _input = this._input;

	  for (var i = 0; this._state === PENDING && i < length; i++) {
	    this._eachEntry(_input[i], i);
	  }
	};

	Enumerator.prototype._eachEntry = function (entry, i) {
	  var c = this._instanceConstructor;
	  var resolve$$ = c.resolve;

	  if (resolve$$ === resolve) {
	    var _then = getThen(entry);

	    if (_then === then && entry._state !== PENDING) {
	      this._settledAt(entry._state, i, entry._result);
	    } else if (typeof _then !== 'function') {
	      this._remaining--;
	      this._result[i] = entry;
	    } else if (c === Promise) {
	      var promise = new c(noop);
	      handleMaybeThenable(promise, entry, _then);
	      this._willSettleAt(promise, i);
	    } else {
	      this._willSettleAt(new c(function (resolve$$) {
	        return resolve$$(entry);
	      }), i);
	    }
	  } else {
	    this._willSettleAt(resolve$$(entry), i);
	  }
	};

	Enumerator.prototype._settledAt = function (state, i, value) {
	  var promise = this.promise;

	  if (promise._state === PENDING) {
	    this._remaining--;

	    if (state === REJECTED) {
	      _reject(promise, value);
	    } else {
	      this._result[i] = value;
	    }
	  }

	  if (this._remaining === 0) {
	    fulfill(promise, this._result);
	  }
	};

	Enumerator.prototype._willSettleAt = function (promise, i) {
	  var enumerator = this;

	  subscribe(promise, undefined, function (value) {
	    return enumerator._settledAt(FULFILLED, i, value);
	  }, function (reason) {
	    return enumerator._settledAt(REJECTED, i, reason);
	  });
	};

	/**
	  `Promise.all` accepts an array of promises, and returns a new promise which
	  is fulfilled with an array of fulfillment values for the passed promises, or
	  rejected with the reason of the first passed promise to be rejected. It casts all
	  elements of the passed iterable to promises as it runs this algorithm.

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = resolve(2);
	  let promise3 = resolve(3);
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // The array here would be [ 1, 2, 3 ];
	  });
	  ```

	  If any of the `promises` given to `all` are rejected, the first promise
	  that is rejected will be given as an argument to the returned promises's
	  rejection handler. For example:

	  Example:

	  ```javascript
	  let promise1 = resolve(1);
	  let promise2 = reject(new Error("2"));
	  let promise3 = reject(new Error("3"));
	  let promises = [ promise1, promise2, promise3 ];

	  Promise.all(promises).then(function(array){
	    // Code here never runs because there are rejected promises!
	  }, function(error) {
	    // error.message === "2"
	  });
	  ```

	  @method all
	  @static
	  @param {Array} entries array of promises
	  @param {String} label optional string for labeling the promise.
	  Useful for tooling.
	  @return {Promise} promise that is fulfilled when all `promises` have been
	  fulfilled, or rejected if any of them become rejected.
	  @static
	*/
	function all(entries) {
	  return new Enumerator(this, entries).promise;
	}

	/**
	  `Promise.race` returns a new promise which is settled in the same way as the
	  first passed promise to settle.

	  Example:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 2');
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // result === 'promise 2' because it was resolved before promise1
	    // was resolved.
	  });
	  ```

	  `Promise.race` is deterministic in that only the state of the first
	  settled promise matters. For example, even if other promises given to the
	  `promises` array argument are resolved, but the first settled promise has
	  become rejected before the other promises became fulfilled, the returned
	  promise will become rejected:

	  ```javascript
	  let promise1 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      resolve('promise 1');
	    }, 200);
	  });

	  let promise2 = new Promise(function(resolve, reject){
	    setTimeout(function(){
	      reject(new Error('promise 2'));
	    }, 100);
	  });

	  Promise.race([promise1, promise2]).then(function(result){
	    // Code here never runs
	  }, function(reason){
	    // reason.message === 'promise 2' because promise 2 became rejected before
	    // promise 1 became fulfilled
	  });
	  ```

	  An example real-world use case is implementing timeouts:

	  ```javascript
	  Promise.race([ajax('foo.json'), timeout(5000)])
	  ```

	  @method race
	  @static
	  @param {Array} promises array of promises to observe
	  Useful for tooling.
	  @return {Promise} a promise which settles in the same way as the first passed
	  promise to settle.
	*/
	function race(entries) {
	  /*jshint validthis:true */
	  var Constructor = this;

	  if (!isArray(entries)) {
	    return new Constructor(function (_, reject) {
	      return reject(new TypeError('You must pass an array to race.'));
	    });
	  } else {
	    return new Constructor(function (resolve, reject) {
	      var length = entries.length;
	      for (var i = 0; i < length; i++) {
	        Constructor.resolve(entries[i]).then(resolve, reject);
	      }
	    });
	  }
	}

	/**
	  `Promise.reject` returns a promise rejected with the passed `reason`.
	  It is shorthand for the following:

	  ```javascript
	  let promise = new Promise(function(resolve, reject){
	    reject(new Error('WHOOPS'));
	  });

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  Instead of writing the above, your code now simply becomes the following:

	  ```javascript
	  let promise = Promise.reject(new Error('WHOOPS'));

	  promise.then(function(value){
	    // Code here doesn't run because the promise is rejected!
	  }, function(reason){
	    // reason.message === 'WHOOPS'
	  });
	  ```

	  @method reject
	  @static
	  @param {Any} reason value that the returned promise will be rejected with.
	  Useful for tooling.
	  @return {Promise} a promise rejected with the given `reason`.
	*/
	function reject(reason) {
	  /*jshint validthis:true */
	  var Constructor = this;
	  var promise = new Constructor(noop);
	  _reject(promise, reason);
	  return promise;
	}

	function needsResolver() {
	  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	}

	function needsNew() {
	  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	}

	/**
	  Promise objects represent the eventual result of an asynchronous operation. The
	  primary way of interacting with a promise is through its `then` method, which
	  registers callbacks to receive either a promise's eventual value or the reason
	  why the promise cannot be fulfilled.

	  Terminology
	  -----------

	  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	  - `thenable` is an object or function that defines a `then` method.
	  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	  - `exception` is a value that is thrown using the throw statement.
	  - `reason` is a value that indicates why a promise was rejected.
	  - `settled` the final resting state of a promise, fulfilled or rejected.

	  A promise can be in one of three states: pending, fulfilled, or rejected.

	  Promises that are fulfilled have a fulfillment value and are in the fulfilled
	  state.  Promises that are rejected have a rejection reason and are in the
	  rejected state.  A fulfillment value is never a thenable.

	  Promises can also be said to *resolve* a value.  If this value is also a
	  promise, then the original promise's settled state will match the value's
	  settled state.  So a promise that *resolves* a promise that rejects will
	  itself reject, and a promise that *resolves* a promise that fulfills will
	  itself fulfill.


	  Basic Usage:
	  ------------

	  ```js
	  let promise = new Promise(function(resolve, reject) {
	    // on success
	    resolve(value);

	    // on failure
	    reject(reason);
	  });

	  promise.then(function(value) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Advanced Usage:
	  ---------------

	  Promises shine when abstracting away asynchronous interactions such as
	  `XMLHttpRequest`s.

	  ```js
	  function getJSON(url) {
	    return new Promise(function(resolve, reject){
	      let xhr = new XMLHttpRequest();

	      xhr.open('GET', url);
	      xhr.onreadystatechange = handler;
	      xhr.responseType = 'json';
	      xhr.setRequestHeader('Accept', 'application/json');
	      xhr.send();

	      function handler() {
	        if (this.readyState === this.DONE) {
	          if (this.status === 200) {
	            resolve(this.response);
	          } else {
	            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	          }
	        }
	      };
	    });
	  }

	  getJSON('/posts.json').then(function(json) {
	    // on fulfillment
	  }, function(reason) {
	    // on rejection
	  });
	  ```

	  Unlike callbacks, promises are great composable primitives.

	  ```js
	  Promise.all([
	    getJSON('/posts'),
	    getJSON('/comments')
	  ]).then(function(values){
	    values[0] // => postsJSON
	    values[1] // => commentsJSON

	    return values;
	  });
	  ```

	  @class Promise
	  @param {function} resolver
	  Useful for tooling.
	  @constructor
	*/
	function Promise(resolver) {
	  this[PROMISE_ID] = nextId();
	  this._result = this._state = undefined;
	  this._subscribers = [];

	  if (noop !== resolver) {
	    typeof resolver !== 'function' && needsResolver();
	    this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	  }
	}

	Promise.all = all;
	Promise.race = race;
	Promise.resolve = resolve;
	Promise.reject = reject;
	Promise._setScheduler = setScheduler;
	Promise._setAsap = setAsap;
	Promise._asap = asap;

	Promise.prototype = {
	  constructor: Promise,

	  /**
	    The primary way of interacting with a promise is through its `then` method,
	    which registers callbacks to receive either a promise's eventual value or the
	    reason why the promise cannot be fulfilled.
	  
	    ```js
	    findUser().then(function(user){
	      // user is available
	    }, function(reason){
	      // user is unavailable, and you are given the reason why
	    });
	    ```
	  
	    Chaining
	    --------
	  
	    The return value of `then` is itself a promise.  This second, 'downstream'
	    promise is resolved with the return value of the first promise's fulfillment
	    or rejection handler, or rejected if the handler throws an exception.
	  
	    ```js
	    findUser().then(function (user) {
	      return user.name;
	    }, function (reason) {
	      return 'default name';
	    }).then(function (userName) {
	      // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	      // will be `'default name'`
	    });
	  
	    findUser().then(function (user) {
	      throw new Error('Found user, but still unhappy');
	    }, function (reason) {
	      throw new Error('`findUser` rejected and we're unhappy');
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	      // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	    });
	    ```
	    If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	  
	    ```js
	    findUser().then(function (user) {
	      throw new PedagogicalException('Upstream error');
	    }).then(function (value) {
	      // never reached
	    }).then(function (value) {
	      // never reached
	    }, function (reason) {
	      // The `PedgagocialException` is propagated all the way down to here
	    });
	    ```
	  
	    Assimilation
	    ------------
	  
	    Sometimes the value you want to propagate to a downstream promise can only be
	    retrieved asynchronously. This can be achieved by returning a promise in the
	    fulfillment or rejection handler. The downstream promise will then be pending
	    until the returned promise is settled. This is called *assimilation*.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // The user's comments are now available
	    });
	    ```
	  
	    If the assimliated promise rejects, then the downstream promise will also reject.
	  
	    ```js
	    findUser().then(function (user) {
	      return findCommentsByAuthor(user);
	    }).then(function (comments) {
	      // If `findCommentsByAuthor` fulfills, we'll have the value here
	    }, function (reason) {
	      // If `findCommentsByAuthor` rejects, we'll have the reason here
	    });
	    ```
	  
	    Simple Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let result;
	  
	    try {
	      result = findResult();
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	    findResult(function(result, err){
	      if (err) {
	        // failure
	      } else {
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findResult().then(function(result){
	      // success
	    }, function(reason){
	      // failure
	    });
	    ```
	  
	    Advanced Example
	    --------------
	  
	    Synchronous Example
	  
	    ```javascript
	    let author, books;
	  
	    try {
	      author = findAuthor();
	      books  = findBooksByAuthor(author);
	      // success
	    } catch(reason) {
	      // failure
	    }
	    ```
	  
	    Errback Example
	  
	    ```js
	  
	    function foundBooks(books) {
	  
	    }
	  
	    function failure(reason) {
	  
	    }
	  
	    findAuthor(function(author, err){
	      if (err) {
	        failure(err);
	        // failure
	      } else {
	        try {
	          findBoooksByAuthor(author, function(books, err) {
	            if (err) {
	              failure(err);
	            } else {
	              try {
	                foundBooks(books);
	              } catch(reason) {
	                failure(reason);
	              }
	            }
	          });
	        } catch(error) {
	          failure(err);
	        }
	        // success
	      }
	    });
	    ```
	  
	    Promise Example;
	  
	    ```javascript
	    findAuthor().
	      then(findBooksByAuthor).
	      then(function(books){
	        // found books
	    }).catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method then
	    @param {Function} onFulfilled
	    @param {Function} onRejected
	    Useful for tooling.
	    @return {Promise}
	  */
	  then: then,

	  /**
	    `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	    as the catch block of a try/catch statement.
	  
	    ```js
	    function findAuthor(){
	      throw new Error('couldn't find that author');
	    }
	  
	    // synchronous
	    try {
	      findAuthor();
	    } catch(reason) {
	      // something went wrong
	    }
	  
	    // async with promises
	    findAuthor().catch(function(reason){
	      // something went wrong
	    });
	    ```
	  
	    @method catch
	    @param {Function} onRejection
	    Useful for tooling.
	    @return {Promise}
	  */
	  'catch': function _catch(onRejection) {
	    return this.then(null, onRejection);
	  }
	};

	function polyfill() {
	    var local = undefined;

	    if (typeof global !== 'undefined') {
	        local = global;
	    } else if (typeof self !== 'undefined') {
	        local = self;
	    } else {
	        try {
	            local = Function('return this')();
	        } catch (e) {
	            throw new Error('polyfill failed because global object is unavailable in this environment');
	        }
	    }

	    var P = local.Promise;

	    if (P) {
	        var promiseToString = null;
	        try {
	            promiseToString = Object.prototype.toString.call(P.resolve());
	        } catch (e) {
	            // silently ignored
	        }

	        if (promiseToString === '[object Promise]' && !P.cast) {
	            return;
	        }
	    }

	    local.Promise = Promise;
	}

	polyfill();
	// Strange compat..
	Promise.polyfill = polyfill;
	Promise.Promise = Promise;

	return Promise;

	})));
	//# sourceMappingURL=es6-promise.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14), (function() { return this; }())))

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	/* (ignored) */

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var types_1 = __webpack_require__(17);
	var ajax_1 = __webpack_require__(4);
	var es6_promise_1 = __webpack_require__(13);
	var error_1 = __webpack_require__(11);
	var Database = (function () {
	    function Database() {
	    }
	    Database.dropAndCreateDatabase = function (appPot, models) {
	        return Database._createAppData(appPot, models, true);
	    };
	    Database.createDatabase = function (appPot, models) {
	        return Database._createAppData(appPot, models, false);
	    };
	    Database.createLocalTable = function (appPot, model) {
	        var _a = Database.getTableDefinition(model), table = _a.table, errors = _a.errors;
	        if (errors.length != 0) {
	            return;
	        }
	    };
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
	    Database._makeDefaultTable = function (tableName) {
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
	                },
	            ]
	        };
	    };
	    Database.mapType2SqliteType = function (type) {
	        switch (type) {
	            case 'varchar':
	                return 'TEXT';
	            case 'integer':
	            case 'long':
	                return 'NUMERIC';
	        }
	    };
	    Database._buildColumnItem = function (name, col) {
	        var column = {
	            colName: name,
	            type: types_1.DataType[col.type].toLowerCase()
	        };
	        switch (column.type) {
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
	            case 'double':
	                column['type'] = 'varchar';
	                column['fieldLength'] = 255;
	                break;
	        }
	        return column;
	    };
	    Database.getSqliteTableDefinition = function (model) {
	        var _a = Database.getTableDefinition(model), table = _a.table, errors = _a.errors;
	        if (errors.length != 0) {
	            throw new error_1.Error(-1, errors.join('\n'));
	        }
	        var name = table.name;
	        var pk = table.primary_key;
	        var columns = table.columns.map(function (column) {
	            if (column.colName == pk) {
	                return "`" + column.colName + "` " + Database.mapType2SqliteType(column.type) + " PRIMARY KEY";
	            }
	            else {
	                return "`" + column.colName + "` " + Database.mapType2SqliteType(column.type);
	            }
	        });
	        columns.push('serverCreateTime TEXT');
	        columns.push('serverUpdateTime TEXT');
	        return [
	            ("CREATE TABLE IF NOT EXISTS " + name + " ( " + columns.join(',') + " );"),
	            ("CREATE TABLE IF NOT EXISTS apppot_" + name + "_queue ( `type` TEXT, `id` TEXT PRIMARY KEY, `serverUpdateTime` TEXT);")
	        ];
	    };
	    Database.getTableDefinition = function (model) {
	        var errors = [];
	        var cols = model.modelColumns;
	        var tableName = model.className;
	        if (!tableName) {
	            throw new error_1.Error(-1, 'table name is Required');
	        }
	        var table = Database._makeDefaultTable(tableName);
	        for (var name_1 in cols) {
	            if (name_1 == 'objectId') {
	                errors.push("invalid column name: " + tableName + "." + name_1);
	                continue;
	            }
	            if (typeof cols[name_1] == 'function') {
	                continue;
	            }
	            if (name_1 == 'scopeType') {
	                continue;
	            }
	            table.columns.push(Database._buildColumnItem(name_1, cols[name_1]));
	        }
	        return { table: table, errors: errors };
	    };
	    Database._createAppData = function (appPot, models, reset) {
	        var tables = [];
	        var errors = [];
	        for (var idx in models) {
	            try {
	                var _a = Database.getTableDefinition(models[idx]), table = _a.table, e = _a.errors;
	                errors = errors.concat(e);
	                tables.push(table);
	            }
	            catch (e) {
	                return es6_promise_1.Promise.reject(e);
	            }
	        }
	        if (errors.length != 0) {
	            return es6_promise_1.Promise.reject(new error_1.Error(-1, errors.join('\n')));
	        }
	        var request = {
	            appId: appPot.getConfig().appId,
	            appVersion: appPot.getConfig().appVersion,
	            isResetDatabase: reset,
	            companyId: appPot.getConfig().companyId,
	            tables: tables
	        };
	        return new es6_promise_1.Promise(function (resolve, reject) {
	            appPot.getAjax().post('schemas')
	                .send(request)
	                .end(ajax_1.Ajax.end(resolve, reject));
	        });
	    };
	    return Database;
	}());
	exports.Database = Database;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	"use strict";
	(function (DataType) {
	    DataType[DataType["Varchar"] = 0] = "Varchar";
	    DataType[DataType["Integer"] = 1] = "Integer";
	    DataType[DataType["Long"] = 2] = "Long";
	    DataType[DataType["Bool"] = 3] = "Bool";
	    DataType[DataType["DateTime"] = 4] = "DateTime";
	    DataType[DataType["Double"] = 5] = "Double";
	})(exports.DataType || (exports.DataType = {}));
	var DataType = exports.DataType;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var types_1 = __webpack_require__(17);
	var ajax_1 = __webpack_require__(4);
	var error_1 = __webpack_require__(11);
	var es6_promise_1 = __webpack_require__(13);
	var database_1 = __webpack_require__(16);
	var sqlite_clause_translator_ts_1 = __webpack_require__(19);
	var objectAssign = __webpack_require__(3);
	var Model;
	(function (Model) {
	    var Expression = (function () {
	        function Expression() {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            var params;
	            if (args[0] instanceof Array) {
	                // クエリ文字列とパラメータが配列で渡された時
	                this._query = args[0][0];
	                params = args[0].slice(1);
	            }
	            else if (typeof args[0].source == 'string') {
	                // queryオブジェクトの、where.expressionが渡された時
	                this._query = args[0].source;
	                params = args[0].params || [];
	            }
	            else {
	                // クエリ文字列とパラメータが別々の引数で渡された時
	                this._query = args[0];
	                params = args.slice(1);
	            }
	            if (params instanceof Array) {
	                this._params = params;
	            }
	            else {
	                this._params = [params];
	            }
	        }
	        Expression.prototype.getQuery = function () {
	            var qobj = {
	                'source': this._query
	            };
	            if (this._params) {
	                qobj['params'] = this._params;
	            }
	            return qobj;
	        };
	        Expression.prototype.concatBy = function (andor, exp) {
	            var query = exp.getQuery();
	            var qobj = {
	                'source': "( " + this._query + " ) " + andor + " ( " + query.source + " )"
	            };
	            var params = [].concat(this._params || [], query.params || []);
	            if (params.length > 0) {
	                qobj['params'] = params;
	            }
	            return qobj;
	        };
	        return Expression;
	    }());
	    Model.Expression = Expression;
	    (function (ScopeType) {
	        ScopeType[ScopeType["User"] = 1] = "User";
	        ScopeType[ScopeType["Group"] = 2] = "Group";
	        ScopeType[ScopeType["All"] = 3] = "All";
	    })(Model.ScopeType || (Model.ScopeType = {}));
	    var ScopeType = Model.ScopeType;
	    (function (JoinType) {
	        JoinType[JoinType["LeftInner"] = 1] = "LeftInner";
	        JoinType[JoinType["LeftOuter"] = 2] = "LeftOuter";
	        JoinType[JoinType["RightOuter"] = 3] = "RightOuter";
	        JoinType[JoinType["Inner"] = 4] = "Inner";
	    })(Model.JoinType || (Model.JoinType = {}));
	    var JoinType = Model.JoinType;
	    (function (Order) {
	        Order[Order["asc"] = 0] = "asc";
	        Order[Order["desc"] = 1] = "desc";
	    })(Model.Order || (Model.Order = {}));
	    var Order = Model.Order;
	    var classList = {};
	    function createModelInstance(className, columns, classObj) {
	        var _class = classObj ? classObj : classList[className];
	        if (columns) {
	            return new _class(columns);
	        }
	        else {
	            return new _class();
	        }
	    }
	    var modelMethods = [
	        "isNew",
	        "get",
	        "set",
	        "insert",
	        "update",
	        "save",
	        "remove"
	    ];
	    var defaultColumns = [
	        'objectId',
	        'scopeType',
	        'serverCreateTime',
	        'serverUpdateTime',
	        'createTime',
	        'updateTime'
	    ];
	    function define(appPot, _className, modelColumns) {
	        Object.keys(modelColumns).forEach(function (key) {
	            if (modelMethods.indexOf(key) != -1) {
	                throw new error_1.Error(-1, 'Invalid column name: ' + key);
	            }
	        });
	        var defaultScope = +ScopeType.Group;
	        classList[_className] = (function () {
	            function ModelClass(columns) {
	                var _this = this;
	                this._columns = {};
	                Object.keys(modelColumns).forEach(function (key) {
	                    if (typeof modelColumns[key] == 'function') {
	                        Object.defineProperty(_this, key, {
	                            enumerable: true,
	                            configurable: true,
	                            value: modelColumns[key].bind(_this)
	                        });
	                    }
	                    else if (key == 'scopeType') {
	                        defaultScope = +modelColumns[key].type;
	                    }
	                    else {
	                        Object.defineProperty(_this, key, {
	                            get: function () {
	                                return this.get(key);
	                            },
	                            set: function (value) {
	                                this.set(key, value);
	                            },
	                            enumerable: true,
	                            configurable: true
	                        });
	                    }
	                });
	                defaultColumns.forEach(function (key) {
	                    if (!_this.hasOwnProperty(key)) {
	                        switch (key) {
	                            case 'scopeType':
	                                Object.defineProperty(_this, key, {
	                                    get: function () {
	                                        return +this.get(key);
	                                    },
	                                    set: function (value) {
	                                        this.set(key, +value);
	                                    },
	                                    enumerable: true,
	                                    configurable: true
	                                });
	                                break;
	                            default:
	                                Object.defineProperty(_this, key, {
	                                    get: function () {
	                                        return this.get(key);
	                                    },
	                                    set: function (value) {
	                                        this.set(key, value);
	                                    },
	                                    enumerable: true,
	                                    configurable: true
	                                });
	                                break;
	                        }
	                    }
	                });
	                if (columns) {
	                    this.set(columns);
	                }
	            }
	            ModelClass._getColumnsPlaceholders = function (includeDates) {
	                var colNames = Object.keys(classList[_className].filterDefinedColumnOnly({})).map(function (colName) {
	                    return colName;
	                });
	                var placeholders = colNames.map(function (_) {
	                    return '?';
	                });
	                return {
	                    colNames: colNames,
	                    placeholders: placeholders
	                };
	            };
	            ModelClass._insertAllLocal = function (objects) {
	                var _a = classList[_className]._normalizeColumns(objects), columns = _a.columns, models = _a.models;
	                var _b = classList[_className]._getColumnsPlaceholders(), colNames = _b.colNames, placeholders = _b.placeholders;
	                var objectIds = [];
	                var records = columns.map(function (record, idx) {
	                    return colNames.map(function (key) {
	                        if (key == 'objectId' && (record[key] === null || record[key] === undefined)) {
	                            var id = _className + "_" + appPot.uuid();
	                            models[idx].set('objectId', id);
	                            objectIds[idx] = id;
	                            return id;
	                        }
	                        return record[key];
	                    });
	                });
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var db = appPot.getLocalDatabase();
	                    if (!db) {
	                        reject('Local Database is undefined');
	                    }
	                    var createTables = database_1.Database.getSqliteTableDefinition(classList[_className]);
	                    db.transaction(function (tx) {
	                        createTables.forEach(function (table) {
	                            tx.executeSql(table);
	                        });
	                        records.forEach(function (record, idx) {
	                            var escapedColNames = colNames.map(function (name) { return "`" + name + "`"; });
	                            var query = "INSERT INTO " + _className + " ( " + escapedColNames.join(',') + " ) VALUES ( " + placeholders.join(',') + " )";
	                            tx.executeSql(query, record, function () {
	                                var query = "INSERT INTO " + sqlite_clause_translator_ts_1.default.getQueueTableName(_className) + " ( `type`, `id`, `serverUpdateTime` ) VALUES ( ?, ?, ? )";
	                                var params = ['created', objectIds[idx], null];
	                                tx.executeSql(query, params);
	                            });
	                        });
	                    }, function (error) {
	                        reject(error);
	                    }, function () {
	                        resolve(models);
	                    });
	                });
	            };
	            ModelClass._insertAll = function (objects) {
	                var _a = classList[_className]._normalizeColumns(objects), columns = _a.columns, models = _a.models;
	                return classList[_className]._rawInsert(columns)
	                    .then(function (obj) {
	                    obj['results'].forEach(function (val, idx) {
	                        models[idx].set(val);
	                    });
	                    return models;
	                });
	            };
	            ModelClass.insertAll = function (objects) {
	                if (appPot.isOnline()) {
	                    return classList[_className]._insertAll(objects);
	                }
	                else {
	                    return classList[_className]._insertAllLocal(objects);
	                }
	            };
	            ModelClass._insertLocal = function (data) {
	                return classList[_className]._insertAllLocal([data])
	                    .then(function (models) { return models[0]; });
	            };
	            ModelClass._insert = function (data) {
	                var _this = this;
	                if (data instanceof Array) {
	                    throw 'invalid argument type: use insertAll';
	                }
	                var _formatedColumns = [classList[_className].formatColumns(data, true)];
	                return classList[_className]._rawInsert(_formatedColumns)
	                    .then(function (obj) {
	                    var ret = [];
	                    var createdColumns = objectAssign({}, _formatedColumns[0], obj['results'][0]);
	                    return new (_this || classList[_className])(createdColumns);
	                });
	            };
	            ModelClass.insert = function (data) {
	                if (appPot.isOnline()) {
	                    return classList[_className]._insert(data);
	                }
	                else {
	                    return classList[_className]._insertLocal(data);
	                }
	            };
	            ModelClass._findByIdLocal = function (id) {
	                return classList[_className]._selectLocal()
	                    .where('objectId = ?', id)
	                    .findOne()
	                    .then(function (obj) {
	                    if (!obj[_className]) {
	                        return es6_promise_1.Promise.reject('not found');
	                    }
	                    return obj[_className];
	                });
	            };
	            ModelClass._findById = function (id) {
	                var _this = this;
	                var func = function (resolve, reject) {
	                    appPot.getAjax().get("data/" + _className + "/" + id)
	                        .end(ajax_1.Ajax.end(function (obj) {
	                        var inst = new (_this || classList[_className])(obj[_className][0]);
	                        resolve(inst);
	                    }, reject));
	                };
	                return new es6_promise_1.Promise(func);
	            };
	            ModelClass.findById = function (id) {
	                if (appPot.isOnline()) {
	                    return classList[_className]._findById(id);
	                }
	                else {
	                    return classList[_className]._findByIdLocal(id);
	                }
	            };
	            ModelClass._findAllLocal = function () {
	                return classList[_className]._selectLocal().findList();
	            };
	            ModelClass._findAll = function () {
	                return classList[_className].select().findList();
	            };
	            ModelClass.findAll = function () {
	                if (appPot.isOnline()) {
	                    return classList[_className]._findAll();
	                }
	                else {
	                    return classList[_className]._findAllLocal();
	                }
	            };
	            ModelClass._selectLocal = function (alias) {
	                if (alias) {
	                    alias = alias.replace(/^#+/, '');
	                }
	                return new Query(appPot, this || classList[_className], alias, appPot.getLocalDatabase());
	            };
	            ModelClass._select = function (alias) {
	                if (alias) {
	                    alias = alias.replace(/^#+/, '');
	                }
	                return new Query(appPot, this || classList[_className], alias);
	            };
	            ModelClass.select = function (alias) {
	                if (appPot.isOnline()) {
	                    return classList[_className]._select(alias);
	                }
	                else {
	                    return classList[_className]._selectLocal(alias);
	                }
	            };
	            ModelClass.count = function (alias) {
	                return classList[_className].select().count(alias);
	            };
	            ModelClass.prototype._insertLocal = function () {
	                var _this = this;
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                this.set.apply(this, args);
	                if (!this.isNew()) {
	                    return es6_promise_1.Promise.reject(new error_1.Error(-1, 'object is created'));
	                }
	                return classList[_className]
	                    ._insertLocal(this.get())
	                    .then(function () {
	                    return _this;
	                });
	            };
	            ModelClass.prototype._insert = function () {
	                var _this = this;
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                this.set.apply(this, args);
	                if (!this.isNew()) {
	                    return es6_promise_1.Promise.reject(new error_1.Error(-1, 'object is created'));
	                }
	                var func = function (resolve, reject) {
	                    var columns = classList[_className].formatColumns(_this._columns, true);
	                    appPot.getAjax().post("data/batch/addData")
	                        .send({
	                        objectName: _className,
	                        data: [columns]
	                    })
	                        .end(ajax_1.Ajax.end(function (obj) {
	                        resolve(_this.set(obj['results'][0]));
	                    }, reject));
	                };
	                return new es6_promise_1.Promise(func);
	            };
	            ModelClass.prototype.insert = function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (appPot.isOnline()) {
	                    return this._insert.apply(this, args);
	                }
	                else {
	                    return this._insertLocal.apply(this, args);
	                }
	            };
	            ModelClass.prototype._updateLocal = function () {
	                var _this = this;
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (this.isNew()) {
	                    return es6_promise_1.Promise.reject(new error_1.Error(-1, 'object is not created'));
	                }
	                this.set.apply(this, args);
	                var columns = classList[_className].formatColumns(this._columns, false);
	                var queryObj = (new sqlite_clause_translator_ts_1.default()).translateUpdate(_className, columns['objectId'], columns);
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var db = appPot.getLocalDatabase();
	                    db.transaction(function (tx) {
	                        tx.executeSql(queryObj.query, queryObj.params, function () {
	                            var args = [];
	                            for (var _i = 0; _i < arguments.length; _i++) {
	                                args[_i - 0] = arguments[_i];
	                            }
	                            var query = "INSERT OR IGNORE INTO " + sqlite_clause_translator_ts_1.default.getQueueTableName(_className) + " ( `type`, `id`, `serverUpdateTime` ) VALUES ( ?, ?, ? )";
	                            var params = ['updated', columns['objectId'], null];
	                            tx.executeSql(query, params);
	                        });
	                    }, function (error) {
	                        reject(error);
	                    }, function () {
	                        resolve(_this);
	                    });
	                });
	            };
	            ModelClass.prototype._update = function () {
	                var _this = this;
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (this.isNew()) {
	                    return es6_promise_1.Promise.reject(new error_1.Error(-1, 'object is not created'));
	                }
	                this.set.apply(this, args);
	                var func = function (resolve, reject) {
	                    var columns = classList[_className].formatColumns(_this._columns, false);
	                    appPot.getAjax().post('data/batch/updateData')
	                        .send({
	                        objectName: _className,
	                        data: [columns]
	                    })
	                        .end(ajax_1.Ajax.end(function (obj) {
	                        _this.set(obj['results'][0]);
	                        resolve(_this);
	                    }, reject));
	                };
	                return new es6_promise_1.Promise(func);
	            };
	            ModelClass.prototype.update = function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (appPot.isOnline()) {
	                    return this._update.apply(this, args);
	                }
	                else {
	                    return this._updateLocal.apply(this, args);
	                }
	            };
	            ModelClass.prototype._saveLocal = function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (this.isNew()) {
	                    return this._insertLocal.apply(this, args);
	                }
	                else {
	                    return this._updateLocal.apply(this, args);
	                }
	            };
	            ModelClass.prototype._save = function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (this.isNew()) {
	                    return this._insert.apply(this, args);
	                }
	                else {
	                    return this._update.apply(this, args);
	                }
	            };
	            ModelClass.prototype.save = function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                if (appPot.isOnline()) {
	                    return this._save.apply(this, args);
	                }
	                else {
	                    return this._saveLocal.apply(this, args);
	                }
	            };
	            ModelClass.removeById = function (_id) {
	                return classList[_className].findById(_id).then(function (model) {
	                    return model.remove();
	                });
	            };
	            ModelClass.prototype._removeLocal = function () {
	                var _this = this;
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var db = appPot.getLocalDatabase();
	                    db.transaction(function (tx) {
	                        var queryObj = (new sqlite_clause_translator_ts_1.default()).translateDelete(_className, _this.get('objectId'));
	                        tx.executeSql(queryObj.query, queryObj.params);
	                        var query = "SELECT type FROM " + sqlite_clause_translator_ts_1.default.getQueueTableName(_className) + " WHERE id = ?";
	                        var params = [_this.get('objectId')];
	                        tx.executeSql(query, params, function () {
	                            var args = [];
	                            for (var _i = 0; _i < arguments.length; _i++) {
	                                args[_i - 0] = arguments[_i];
	                            }
	                            var query = "INSERT OR REPLACE INTO " + sqlite_clause_translator_ts_1.default.getQueueTableName(_className) + " ( `type`, `id`, `serverUpdateTime` ) VALUES ( ?, ?, ? )";
	                            var params = ['deleted', _this.get('objectId'), _this.get('serverUpdateTime')];
	                            if (args[1].rows.length > 0 && args[1].rows.item(0).type == 'created') {
	                                query = "DELETE FROM " + sqlite_clause_translator_ts_1.default.getQueueTableName(_className) + " WHERE id = ?";
	                                params = [_this.get('objectId')];
	                            }
	                            tx.executeSql(query, params);
	                        });
	                    }, function (error) {
	                        console.log('error');
	                        console.log(error);
	                        reject(error);
	                    }, function () {
	                        resolve(true);
	                    });
	                });
	            };
	            ModelClass.prototype._remove = function () {
	                var _this = this;
	                var func = function (resolve, reject) {
	                    appPot.getAjax().post('data/batch/deleteData')
	                        .send({
	                        objectName: _className,
	                        objectIds: [{
	                                objectId: _this.get('objectId'),
	                                serverUpdateTime: _this.get('serverUpdateTime')
	                            }]
	                    })
	                        .end(ajax_1.Ajax.end(resolve, reject));
	                };
	                return new es6_promise_1.Promise(func);
	            };
	            ModelClass.prototype.remove = function () {
	                if (appPot.isOnline()) {
	                    return this._remove.apply(this);
	                }
	                else {
	                    return this._removeLocal.apply(this);
	                }
	            };
	            ModelClass.prototype.isNew = function () {
	                return !this._columns['objectId'];
	            };
	            ModelClass.countUnsent = function () {
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var num = null;
	                    var db = appPot.getLocalDatabase();
	                    db.transaction(function (tx) {
	                        tx.executeSql('SELECT * FROM ' + sqlite_clause_translator_ts_1.default.getQueueTableName(_className), [], function () {
	                            var args = [];
	                            for (var _i = 0; _i < arguments.length; _i++) {
	                                args[_i - 0] = arguments[_i];
	                            }
	                            num = {
	                                created: 0,
	                                updated: 0,
	                                deleted: 0
	                            };
	                            for (var i = 0; i < args[1].rows.length; i++) {
	                                var record = args[1].rows.item(i);
	                                num[record.type]++;
	                            }
	                        });
	                    }, function (error) {
	                        reject(error);
	                    }, function () {
	                        resolve(num);
	                    });
	                });
	            };
	            ModelClass.getUnsents = function () {
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var returnObj = {
	                        created: [],
	                        updated: [],
	                        deleted: []
	                    };
	                    var db = appPot.getLocalDatabase();
	                    db.transaction(function (tx) {
	                        tx.executeSql('SELECT * FROM ' + sqlite_clause_translator_ts_1.default.getQueueTableName(_className), [], function () {
	                            var args = [];
	                            for (var _i = 0; _i < arguments.length; _i++) {
	                                args[_i - 0] = arguments[_i];
	                            }
	                            for (var i = 0; i < args[1].rows.length; i++) {
	                                var record = args[1].rows.item(i);
	                                returnObj[record.type].push({
	                                    objectId: record.id,
	                                    serverUpdateTime: record.serverUpdateTime
	                                });
	                            }
	                        });
	                    }, function (error) {
	                        reject();
	                    }, function () {
	                        resolve(returnObj);
	                    });
	                }).then(function (obj) {
	                    return es6_promise_1.Promise.all([
	                        classList[_className]._selectLocal()
	                            .valuesIn('objectId', obj['created'].map(function (o) { return o['objectId']; }))
	                            .findList(),
	                        classList[_className]._selectLocal()
	                            .valuesIn('objectId', obj['updated'].map(function (o) { return o['objectId']; }))
	                            .findList(),
	                        es6_promise_1.Promise.resolve(obj['deleted'])
	                    ]);
	                }).then(function (results) {
	                    return {
	                        created: results[0][_className],
	                        updated: results[1][_className],
	                        deleted: results[2]
	                    };
	                });
	            };
	            ModelClass.downlink = function (alias) {
	                if (!appPot.isOnline()) {
	                    throw "offline mode";
	                }
	                if (appPot.isLocked(_className)) {
	                    throw "now locking";
	                }
	                return new QueryLimited(appPot, this || classList[_className], alias)
	                    .setLocalDatabase(appPot.getLocalDatabase());
	            };
	            ModelClass.clearQueue = function (type) {
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var db = appPot.getLocalDatabase();
	                    db.transaction(function (tx) {
	                        var query = 'DELETE FROM ' + sqlite_clause_translator_ts_1.default.getQueueTableName(_className) + ' WHERE type = ?';
	                        tx.executeSql(query, [type]);
	                    }, function (error) {
	                        reject(error);
	                    }, function () {
	                        resolve();
	                    });
	                });
	            };
	            ModelClass.uplink = function (conflict) {
	                if (!appPot.isOnline()) {
	                    throw "offline mode";
	                }
	                if (appPot.isLocked(_className)) {
	                    throw "now locking";
	                }
	                if (!conflict) {
	                    conflict = function () { };
	                }
	                var queueList = null;
	                var conflicted = {
	                    update: [],
	                    delete: []
	                };
	                appPot.lock(_className);
	                return classList[_className].getUnsents().then(function (results) {
	                    queueList = results;
	                    return classList[_className]._insertAll(queueList['created']);
	                }).then(function () {
	                    return classList[_className].clearQueue('created');
	                }).then(function () {
	                    return es6_promise_1.Promise.all(queueList['updated'].map(function (model) {
	                        return model.update()
	                            .catch(function (err) {
	                            console.log(err);
	                            //if(err.code == 130){
	                            conflicted['update'].push(model);
	                            //}
	                            //return Promise.reject(err);
	                            return es6_promise_1.Promise.resolve();
	                        });
	                    }));
	                }).then(function () {
	                    return classList[_className].clearQueue('updated');
	                }).then(function () {
	                    return es6_promise_1.Promise.all(queueList['deleted'].map(function (obj) {
	                        return new es6_promise_1.Promise(function (resolve, reject) {
	                            appPot.getAjax().post('data/batch/deleteData')
	                                .send({
	                                objectName: _className,
	                                objectIds: [{
	                                        objectId: obj['objectId'],
	                                        serverUpdateTime: obj['serverUpdateTime']
	                                    }]
	                            }).end(ajax_1.Ajax.end(resolve, reject));
	                        }).catch(function (err) {
	                            console.log(err);
	                            //if(err.code == 130){
	                            conflicted['delete'].push(obj);
	                            //}
	                            //return Promise.reject(err);
	                            return es6_promise_1.Promise.resolve();
	                        });
	                    }));
	                }).then(function () {
	                    return classList[_className].clearQueue('deleted');
	                }).then(function () {
	                    appPot.unlock(_className);
	                    if (conflicted['update'] && conflicted['update'].length != 0 || conflicted['deleted'] && conflicted['deleted'].length != 0) {
	                        conflict(conflicted);
	                    }
	                }).catch(function (err) {
	                    appPot.unlock(_className);
	                    return es6_promise_1.Promise.reject(err);
	                });
	            };
	            ModelClass._debug = function () {
	                var returnArray = [];
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    var db = appPot.getLocalDatabase();
	                    db.transaction(function (tx) {
	                        tx.executeSql('SELECT * FROM ' + _className, [], function () {
	                            var args = [];
	                            for (var _i = 0; _i < arguments.length; _i++) {
	                                args[_i - 0] = arguments[_i];
	                            }
	                            for (var i = 0; i < args[1].rows.length; i++) {
	                                returnArray.push(args[1].rows.item(i));
	                            }
	                            tx.executeSql('SELECT * FROM ' + sqlite_clause_translator_ts_1.default.getQueueTableName(_className), [], function () {
	                                var args = [];
	                                for (var _i = 0; _i < arguments.length; _i++) {
	                                    args[_i - 0] = arguments[_i];
	                                }
	                                for (var i = 0; i < args[1].rows.length; i++) {
	                                    returnArray.push(args[1].rows.item(i));
	                                }
	                            });
	                        });
	                    }, function (error) {
	                        reject(error);
	                    }, function () {
	                        resolve(returnArray);
	                    });
	                });
	            };
	            ModelClass.prototype.get = function (colName) {
	                if (colName) {
	                    return this._columns[colName];
	                }
	                else {
	                    return this._columns;
	                }
	            };
	            ModelClass.prototype.set = function () {
	                var _this = this;
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i - 0] = arguments[_i];
	                }
	                var toBe = {};
	                if (args.length == 1 && typeof args[0] == 'object') {
	                    toBe = args[0];
	                }
	                else {
	                    toBe[args[0]] = args[1];
	                }
	                this._columns = objectAssign({}, this._columns, toBe);
	                this._columns = classList[_className].sliceColumns(this._columns);
	                this._columns = classList[_className].parseColumns(this._columns);
	                Object.keys(this._columns).forEach(function (key) {
	                    if (modelMethods.indexOf(key) != -1) {
	                        throw new error_1.Error(-1, 'Invalid column name: ' + key);
	                    }
	                });
	                Object.keys(this._columns).forEach(function (key) {
	                    if (!_this.hasOwnProperty(key)) {
	                        Object.defineProperty(_this, key, {
	                            get: function () {
	                                return this.get(key);
	                            },
	                            set: function (value) {
	                                this.set(key, value);
	                            },
	                            enumerable: true,
	                            configurable: true
	                        });
	                    }
	                });
	                return this;
	            };
	            ModelClass.sliceColumns = function (columns) {
	                classList[_className].noNeedColumns.forEach(function (val) {
	                    delete columns[val];
	                });
	                return columns;
	            };
	            ModelClass.parseColumns = function (columns) {
	                var _columns = {};
	                objectAssign(_columns, columns);
	                Object.keys(modelColumns).forEach(function (key) {
	                    if (key == 'scopeType') {
	                        return;
	                    }
	                    if (columns[key] === null || columns[key] === undefined) {
	                        return;
	                    }
	                    if (modelColumns[key]['type'] == types_1.DataType.Long ||
	                        modelColumns[key]['type'] == types_1.DataType.Integer) {
	                        if (columns[key] === "") {
	                            _columns[key] = null;
	                        }
	                        else {
	                            _columns[key] = parseInt(columns[key]);
	                        }
	                    }
	                    else if (modelColumns[key]['type'] == types_1.DataType.Bool &&
	                        typeof _columns[key] != 'boolean') {
	                        if (columns[key] === "") {
	                            _columns[key] = null;
	                        }
	                        else {
	                            _columns[key] = !!parseInt(columns[key]);
	                        }
	                    }
	                    else if (modelColumns[key]['type'] == types_1.DataType.DateTime &&
	                        !(_columns[key] instanceof Date)) {
	                        if (columns[key] === "") {
	                            _columns[key] = null;
	                        }
	                        else {
	                            _columns[key] = new Date(parseInt(columns[key]));
	                        }
	                    }
	                    else if (modelColumns[key]['type'] == types_1.DataType.Double) {
	                        if (columns[key] === "") {
	                            _columns[key] = null;
	                        }
	                        else {
	                            _columns[key] = parseFloat(columns[key]);
	                        }
	                    }
	                });
	                return _columns;
	            };
	            ModelClass.formatColumns = function (columns, isCreate) {
	                var _columns = {};
	                objectAssign(_columns, columns);
	                Object.keys(modelColumns).forEach(function (key) {
	                    if (key == 'scopeType') {
	                        return;
	                    }
	                    if (columns[key] === null || columns[key] === undefined) {
	                        return;
	                    }
	                    if (modelColumns[key]['type'] == types_1.DataType.Bool) {
	                        _columns[key] = columns[key] ? 1 : 0;
	                    }
	                    else if (modelColumns[key]['type'] == types_1.DataType.DateTime) {
	                        if (!(columns[key] instanceof Date)) {
	                            throw new error_1.Error(-1, 'invalid type: column ' + _className + '"."' + key + '"');
	                        }
	                        _columns[key] = columns[key].getTime();
	                    }
	                    else if (modelColumns[key]['type'] == types_1.DataType.Double) {
	                        if (typeof columns[key] == 'number') {
	                            _columns[key] = columns[key] + "";
	                        }
	                        else {
	                            _columns[key] = parseFloat(columns[key]) + "";
	                        }
	                    }
	                });
	                if (isCreate) {
	                    _columns['createTime'] = Date.now() / 1000;
	                }
	                _columns['updateTime'] = Date.now() / 1000;
	                return classList[_className].filterDefinedColumnOnly(_columns);
	            };
	            ModelClass.filterDefinedColumnOnly = function (columns) {
	                var filteredColumns = {};
	                Object.keys(modelColumns).forEach(function (col) {
	                    filteredColumns[col] = columns[col];
	                });
	                filteredColumns['objectId'] = columns['objectId'];
	                filteredColumns['scopeType'] = +(columns['scopeType'] || defaultScope);
	                filteredColumns['serverCreateTime'] = columns['serverCreateTime'];
	                filteredColumns['serverUpdateTime'] = columns['serverUpdateTime'];
	                filteredColumns['createTime'] = columns['createTime'];
	                filteredColumns['updateTime'] = columns['updateTime'];
	                return filteredColumns;
	            };
	            ModelClass._rawInsert = function (formatedColumns) {
	                return new es6_promise_1.Promise(function (resolve, reject) {
	                    appPot.getAjax().post("data/batch/addData") //${_className}`)
	                        .send({
	                        objectName: _className,
	                        data: formatedColumns
	                    })
	                        .end(ajax_1.Ajax.end(resolve, reject));
	                });
	            };
	            ModelClass._normalizeColumns = function (objects) {
	                var _this = this;
	                var _columns;
	                var _models;
	                if (objects[0] instanceof ModelClass) {
	                    _models = objects;
	                    _columns = _models.map(function (model) {
	                        return model.get();
	                    });
	                }
	                else {
	                    _columns = objects;
	                    _models = _columns.map(function (column) {
	                        var model = new (_this || classList[_className])(column);
	                        return model;
	                    });
	                }
	                return {
	                    columns: _models.map(function (_model) {
	                        return classList[_className].formatColumns(_model.get(), true);
	                    }),
	                    models: _models
	                };
	            };
	            ModelClass.className = _className;
	            ModelClass.modelColumns = modelColumns;
	            ModelClass.noNeedColumns = [
	                'groupIds',
	            ];
	            return ModelClass;
	        }());
	        return classList[_className];
	    }
	    Model.define = define;
	    var Query = (function () {
	        function Query(appPot, classObj, alias, localDB) {
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
	            if (alias) {
	                this._queryObj['from']['alias'] = alias;
	            }
	            else {
	                this._queryObj['from']['alias'] = this._class.className;
	            }
	            this._keyClassMap = {};
	            this._keyClassMap[this._queryObj['from']['alias']] = this._class.className;
	        }
	        Query.prototype.normalizeExpression = function (args) {
	            if (args.length >= 2) {
	                return new Expression(args);
	            }
	            else if (args[0] instanceof Expression) {
	                return args[0];
	            }
	            else if (typeof args[0] == 'string') {
	                return new Expression(args[0]);
	            }
	            else {
	                throw 'faild to normalize expression: ' + JSON.stringify(args);
	            }
	        };
	        Query.prototype.valuesIn = function (columnName, values) {
	            var alias = this._queryObj['from']['alias'];
	            var query = "#" + alias + "." + columnName + " = ?";
	            for (var i = 0; i < values.length - 1; i++) {
	                query += " or #" + alias + "." + columnName + " = ?";
	            }
	            var exp = this.normalizeExpression([
	                query
	            ].concat(values));
	            this.setWhereExpression(exp);
	            return this;
	        };
	        Query.prototype.where = function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            var exp = this.normalizeExpression(args);
	            this.setWhereExpression(exp);
	            return this;
	        };
	        Query.prototype.setWhereExpression = function (exp) {
	            if (!this._queryObj['where']) {
	                this._queryObj['where'] = {};
	                this._queryObj['where']['expression'] = exp.getQuery();
	            }
	            else if (this._concat) {
	                var nextExp = new Expression(this._queryObj['where']['expression']);
	                this._queryObj['where']['expression'] = nextExp.concatBy(this._concat, exp);
	                this._concat = null;
	            }
	            else {
	                throw 'Multiple WHERE condition in not set and/or';
	            }
	        };
	        Query.prototype.and = function () {
	            this._concat = 'AND';
	            return this;
	        };
	        Query.prototype.or = function () {
	            this._concat = 'OR';
	            return this;
	        };
	        Query.prototype.join = function (modelClass) {
	            var args = [];
	            for (var _i = 1; _i < arguments.length; _i++) {
	                args[_i - 1] = arguments[_i];
	            }
	            var joinType = JoinType.LeftInner;
	            var alias = modelClass.className;
	            if (typeof args[0] == 'number') {
	                joinType = args.shift();
	            }
	            if (typeof args[0] == 'object') {
	                var opts = args.shift();
	                alias = opts.alias ? opts.alias : alias;
	                joinType = opts.joinType ? opts.joinType : joinType;
	            }
	            var joinStr = 'LEFT JOIN';
	            switch (joinType) {
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
	            var exp = this.normalizeExpression(args);
	            if (!this._queryObj['join']) {
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
	        };
	        Query.prototype.orderBy = function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            if (!this._queryObj['orderBy']) {
	                this._queryObj['orderBy'] = [];
	            }
	            var order = {};
	            if (typeof args[0] == 'string') {
	                order['column'] = args[0];
	                if (args.length == 1) {
	                    order['type'] = 'asc';
	                }
	                else {
	                    if (typeof args[1] == 'string') {
	                        order['type'] = args[1];
	                    }
	                    else {
	                        order['type'] = Order[args[1]];
	                    }
	                }
	            }
	            this._queryObj['orderBy'].push(order);
	            return this;
	        };
	        Query.prototype.limit = function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            this._queryObj['range'] = {
	                limit: args[0] || 1000,
	                offset: 1
	            };
	            if (args.length == 2) {
	                this._queryObj['range']['offset'] = args[1] + 1;
	            }
	            return this;
	        };
	        Query.prototype.resetQuery = function () {
	            this._queryObj = {};
	            return this;
	        };
	        Query.prototype.findOne = function () {
	            var _this = this;
	            this._queryObj['range'] = this._queryObj['range'] || {
	                limit: 1,
	                offset: 1
	            };
	            if (this._useLocal) {
	                return this._queryToLocal()
	                    .then(function (result) {
	                    var returnResult = {};
	                    Object.keys(result).forEach(function (alias) {
	                        returnResult[alias] = result[alias][0];
	                    });
	                    return returnResult;
	                });
	            }
	            return this._post()
	                .then(function (obj) {
	                var ret = {};
	                Object.keys(_this._keyClassMap).forEach(function (key) {
	                    var className = _this._keyClassMap[key];
	                    var classObj = false;
	                    if (className == _this._class.className) {
	                        classObj = _this._class;
	                    }
	                    if (obj[key]) {
	                        ret[key] = createModelInstance(className, obj[key][0], classObj);
	                    }
	                    else {
	                        ret[key] = createModelInstance(className, obj[className][0], classObj);
	                    }
	                });
	                return ret;
	            });
	        };
	        Query.prototype.findList = function () {
	            var _this = this;
	            if (this._useLocal) {
	                return this._queryToLocal();
	            }
	            return this._post()
	                .then(function (obj) {
	                var ret = {};
	                Object.keys(_this._keyClassMap).forEach(function (key) {
	                    ret[key] = [];
	                    var className = _this._keyClassMap[key];
	                    var classObj = false;
	                    if (className == _this._class.className) {
	                        classObj = _this._class;
	                    }
	                    var models = obj[key] ? obj[key] : obj[className];
	                    models.forEach(function (valval, idx) {
	                        ret[key].push(createModelInstance(className, valval, classObj));
	                    });
	                });
	                return ret;
	            });
	        };
	        Query.prototype.count = function () {
	            return this._post(true)
	                .then(function (obj) {
	                return obj;
	            });
	        };
	        Query.prototype._queryToLocal = function () {
	            var _this = this;
	            return (new es6_promise_1.Promise(function (resolve, reject) {
	                var queryObj = (new sqlite_clause_translator_ts_1.default()).translateSelect(_this._queryObj, _this._keyClassMap, classList);
	                if (!_this._localDB) {
	                    reject('Local Database is undefined');
	                }
	                var returnArray = [];
	                _this._localDB.transaction(function (tx) {
	                    tx.executeSql(queryObj.query, queryObj.params, function () {
	                        var args = [];
	                        for (var _i = 0; _i < arguments.length; _i++) {
	                            args[_i - 0] = arguments[_i];
	                        }
	                        for (var i = 0; i < args[1].rows.length; i++) {
	                            returnArray.push(args[1].rows.item(i));
	                        }
	                    });
	                }, function (error) {
	                    reject(error);
	                }, function () {
	                    resolve(returnArray);
	                });
	            })).then(function (records) {
	                var preReturnObject = {};
	                Object.keys(_this._keyClassMap).forEach(function (alias) {
	                    preReturnObject[alias] = [];
	                });
	                records.forEach(function (record, idx) {
	                    Object.keys(record).forEach(function (colName) {
	                        var matches = colName.match(/(.*)____(.*)/);
	                        var alias = matches[1];
	                        var trueColName = matches[2];
	                        if (!preReturnObject[alias][idx]) {
	                            preReturnObject[alias][idx] = {};
	                        }
	                        ;
	                        preReturnObject[alias][idx][trueColName] = record[colName];
	                    });
	                });
	                var returnObject = {};
	                Object.keys(preReturnObject).forEach(function (alias) {
	                    returnObject[alias] = preReturnObject[alias].map(function (record) {
	                        return createModelInstance(_this._keyClassMap[alias], record);
	                    });
	                });
	                return returnObject;
	            });
	        };
	        Query.prototype._post = function (isCount) {
	            var _this = this;
	            if (isCount === void 0) { isCount = false; }
	            var count = "";
	            if (isCount) {
	                count = "/count";
	            }
	            var func = function (resolve, reject) {
	                _this._ajax.post("data/query/" + _this._class.className + count)
	                    .send(_this._queryObj)
	                    .end(ajax_1.Ajax.end(resolve, function (err) {
	                    if (err.response && err.response.statusCode == 404) {
	                        var models_1 = [_this._class.className];
	                        if (_this._queryObj.join instanceof Array) {
	                            _this._queryObj.join.forEach(function (joinObj) {
	                                models_1.push(joinObj.entity);
	                            });
	                        }
	                        var emptyArrays_1 = {};
	                        models_1.forEach(function (name) {
	                            emptyArrays_1[name] = [];
	                        });
	                        resolve(emptyArrays_1);
	                    }
	                    else {
	                        reject(err);
	                    }
	                }));
	            };
	            return new es6_promise_1.Promise(func);
	        };
	        return Query;
	    }());
	    var QueryLimited = (function (_super) {
	        __extends(QueryLimited, _super);
	        function QueryLimited() {
	            _super.apply(this, arguments);
	        }
	        QueryLimited.prototype.findOne = function () {
	            return es6_promise_1.Promise.reject("Cannot use \"findOne\" method to downlink. Please use \"execute\" method.");
	        };
	        QueryLimited.prototype.findList = function () {
	            return es6_promise_1.Promise.reject("Cannot use \"findList\" method to downlink. Please use \"execute\" method.");
	        };
	        QueryLimited.prototype.setLocalDatabase = function (db) {
	            this._localDB = db;
	            return this;
	        };
	        QueryLimited.prototype.execute = function () {
	            var _this = this;
	            var promiseFunc = function (results) { return function (resolve, reject) {
	                _this._localDB.transaction(function (tx) {
	                    var className = _this._class.className;
	                    var _a = classList[className]._getColumnsPlaceholders(), colNames = _a.colNames, placeholders = _a.placeholders;
	                    var escapedColNames = colNames.map(function (c) { return '`' + c + '`'; });
	                    var createTables = database_1.Database.getSqliteTableDefinition(_this._class);
	                    createTables.forEach(function (table) {
	                        tx.executeSql(table);
	                    });
	                    tx.executeSql("DELETE FROM " + className);
	                    tx.executeSql("DELETE FROM " + sqlite_clause_translator_ts_1.default.getQueueTableName(className));
	                    var query = "INSERT INTO " + className + " (" + escapedColNames.join(',') + ") VALUES (" + placeholders.join(',') + ");";
	                    results[className].forEach(function (model) {
	                        var params = colNames.map(function (key) {
	                            return model.get(key);
	                        });
	                        tx.executeSql(query, params);
	                    });
	                }, function (error) {
	                    _this._appPot.unlock(_this._class.className);
	                    reject(error);
	                }, function () {
	                    _this._appPot.unlock(_this._class.className);
	                    resolve();
	                });
	            }; };
	            this._appPot.lock(this._class.className);
	            return _super.prototype.findList.call(this)
	                .then(function (results) {
	                return new es6_promise_1.Promise(promiseFunc(results));
	            });
	        };
	        return QueryLimited;
	    }(Query));
	})(Model = exports.Model || (exports.Model = {}));


/***/ }),
/* 19 */
/***/ (function(module, exports) {

	"use strict";
	var SqliteClauseTranslator = (function () {
	    function SqliteClauseTranslator() {
	        this._params = [];
	    }
	    SqliteClauseTranslator.getQueueTableName = function (tableName) {
	        return "apppot_" + tableName + "_queue";
	    };
	    SqliteClauseTranslator.prototype.translateDelete = function (tableName, id) {
	        console.log('translateDelete');
	        return {
	            query: "DELETE FROM " + tableName + " WHERE objectId = ?",
	            params: [id]
	        };
	    };
	    SqliteClauseTranslator.prototype.translateUpdate = function (tableName, id, columns) {
	        var params = [];
	        var sets = Object.keys(columns).map(function (key) {
	            params.push(columns[key]);
	            return "`" + key + "` = ?";
	        });
	        params.push(id);
	        return {
	            query: "UPDATE " + tableName + " SET " + sets.join(',') + " WHERE objectId = ?",
	            params: params
	        };
	    };
	    SqliteClauseTranslator.prototype.translateSelect = function (queryObj, keyClassMap, classList) {
	        this._keyClassMap = keyClassMap;
	        this._classList = classList;
	        var sql = this.selectFromJoin(queryObj) + ' ' +
	            this.where(queryObj) + ' ' +
	            this.order(queryObj) + ' ' +
	            this.limit(queryObj);
	        return {
	            query: sql,
	            params: this._params
	        };
	    };
	    SqliteClauseTranslator.prototype.getClass = function (alias) {
	        return this._classList[this._keyClassMap[alias]];
	    };
	    SqliteClauseTranslator.prototype.expression = function (source, params) {
	        this._params = this._params.concat(params);
	        return source.replace(/#/g, '');
	    };
	    SqliteClauseTranslator.prototype.limit = function (queryObj) {
	        if (!queryObj.range) {
	            return '';
	        }
	        var limit = queryObj.range;
	        return "LIMIT " + limit.limit + " OFFSET " + (limit.offset - 1);
	    };
	    SqliteClauseTranslator.prototype.order = function (queryObj) {
	        if (!queryObj.orderBy || queryObj.orderBy.length == 0) {
	            return '';
	        }
	        var orderBys = queryObj['orderBy'];
	        return 'order by ' + orderBys.map(function (orderBy) {
	            return orderBy['column'] + " " + orderBy['type'];
	        }).join(',');
	    };
	    SqliteClauseTranslator.prototype.where = function (queryObj) {
	        if (queryObj.where && queryObj.where.expression) {
	            var exp = queryObj['where']['expression'];
	            return 'WHERE ' + this.expression(exp.source, exp.params);
	        }
	        return '';
	    };
	    SqliteClauseTranslator.prototype.selectFromJoin = function (queryObj) {
	        var _this = this;
	        var mainTableAlias = queryObj['from']['alias'];
	        var mainTableClass = this.getClass(mainTableAlias);
	        var select = Object.keys(mainTableClass.modelColumns).map(function (col) {
	            return "`" + mainTableAlias + "`.`" + col + "` AS " + mainTableAlias + "____" + col;
	        });
	        select.push("`" + mainTableAlias + "`.`objectId` AS " + mainTableAlias + "____objectId");
	        select.push("`" + mainTableAlias + "`.`serverCreateTime` AS " + mainTableAlias + "____serverCreateTime");
	        select.push("`" + mainTableAlias + "`.`serverUpdateTime` AS " + mainTableAlias + "____serverUpdateTime");
	        var from = "FROM " + queryObj['from']['phyName'];
	        if (queryObj['from']['phyName'] != queryObj['from']['alias']) {
	            from += " AS " + queryObj['from']['alias'];
	        }
	        if (queryObj.join && queryObj.join.length > 0) {
	            queryObj.join.forEach(function (joinObj) {
	                var alias = joinObj.entityAlias;
	                from += " " + joinObj.type + " " + joinObj.entity;
	                if (joinObj.entity != alias) {
	                    from += " AS " + alias;
	                }
	                var expression = _this.expression(joinObj.expression.source, joinObj.expression.params);
	                from += " ON " + expression + " ";
	                var joinColumns = Object.keys(_this.getClass(alias).modelColumns).map(function (col) {
	                    return "`" + alias + "`.`" + col + "` AS " + alias + "____" + col;
	                });
	                joinColumns.push("`" + alias + "`.`objectId` AS " + alias + "____objectId");
	                select = select.concat(joinColumns);
	            });
	        }
	        return "SELECT " + select.join(',') + " " + from;
	    };
	    return SqliteClauseTranslator;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SqliteClauseTranslator;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

	"use strict";
	var Device = (function () {
	    function Device(args) {
	        var _this = this;
	        this._columns = {
	            udid: "",
	            name: "",
	            osType: "",
	            token: ""
	        };
	        Object.keys(this._columns).forEach(function (key) {
	            if (args[key]) {
	                _this._columns[key] = args[key];
	            }
	        });
	    }
	    Object.defineProperty(Device.prototype, "udid", {
	        get: function () {
	            return this._columns['udid'];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Device.prototype, "token", {
	        get: function () {
	            return this._columns['token'];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Device.prototype, "name", {
	        get: function () {
	            return this._columns['name'];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Device.prototype, "osType", {
	        get: function () {
	            return this._columns['osType'];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return Device;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Device;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var ajax_1 = __webpack_require__(4);
	var es6_promise_1 = __webpack_require__(13);
	function getUserClass(appPot) {
	    return (function () {
	        function User(columns) {
	            this._columns = {
	                account: '',
	                firstName: '',
	                lastName: '',
	                password: '',
	                userId: null
	            };
	            this.set(columns);
	        }
	        User.prototype.set = function (columns) {
	            var _this = this;
	            Object.keys(this._columns).forEach(function (key) {
	                if (columns[key]) {
	                    _this._columns[key] = columns[key];
	                }
	            });
	            var grs = columns.groupsRoles ||
	                columns.groupsAndRoles ||
	                columns.groupRoleMap ||
	                this.groupsRoles;
	            if (grs instanceof GroupsRoles) {
	                grs = [grs];
	            }
	            else if (!(grs instanceof Array)) {
	                throw 'Invalid arguments groupsRoles';
	            }
	            this._columns.groupsRoles =
	                grs.map(function (val) {
	                    return new GroupsRoles(val);
	                });
	            return this;
	        };
	        Object.defineProperty(User.prototype, "account", {
	            get: function () {
	                return this._columns.account;
	            },
	            set: function (value) {
	                this._columns.account = value;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(User.prototype, "firstName", {
	            get: function () {
	                return this._columns.firstName;
	            },
	            set: function (value) {
	                this._columns.firstName = value;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(User.prototype, "lastName", {
	            get: function () {
	                return this._columns.lastName;
	            },
	            set: function (value) {
	                this._columns.lastName = value;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(User.prototype, "userId", {
	            get: function () {
	                return this._columns.userId;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(User.prototype, "password", {
	            get: function () {
	                return this._columns.password;
	            },
	            set: function (value) {
	                this._columns.password = value;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(User.prototype, "groupsRoles", {
	            get: function () {
	                return this._columns.groupsRoles;
	            },
	            set: function (value) {
	                if (!(value instanceof GroupsRoles)) {
	                    throw 'arguments is invalid type of class';
	                }
	                this._columns.groupsRoles = value;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        User._isNumber = function (x) {
	            if (typeof (x) != 'number' && typeof (x) != 'string') {
	                return false;
	            }
	            else {
	                return (x == parseFloat(x) && isFinite(x));
	            }
	        };
	        User.findById = function (userId, options) {
	            if (!this._isNumber(userId)) {
	                return es6_promise_1.Promise.reject('userId is not a number');
	            }
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().get("users/" + userId, options)
	                    .query({ token: appPot.getAuthInfo().getToken() })
	                    .end(ajax_1.Ajax.end(function (res) {
	                    resolve(new User(res['user']));
	                }, reject));
	            });
	        };
	        User.list = function (params, options) {
	            var _params = {};
	            if (this._isNumber(params)) {
	                _params['groupId'] = params;
	            }
	            else {
	                _params = params;
	            }
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().get('users', options)
	                    .query({ token: appPot.getAuthInfo().getToken() })
	                    .query(_params)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    var users = res['users'];
	                    var userInsts = users.map(function (user) {
	                        return new User(user);
	                    });
	                    resolve(userInsts);
	                }, reject));
	            });
	        };
	        User.prototype._getObjForUserAPI = function () {
	            return {
	                account: this.account,
	                firstName: this.firstName,
	                lastName: this.lastName,
	                password: this.password,
	                groupRoleMap: this.groupsRoles.map(function (gr) {
	                    return gr.getGroupsRolesForUserAPI();
	                })
	            };
	        };
	        User.prototype.create = function (options) {
	            var _this = this;
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                var obj = _this._getObjForUserAPI();
	                appPot.getAjax().post('users', options)
	                    .send(obj)
	                    .end(ajax_1.Ajax.end(function (obj) {
	                    resolve(_this.set(obj.user));
	                }, reject));
	            });
	        };
	        User.prototype.update = function (columns, options) {
	            var _this = this;
	            if (columns) {
	                this.set(columns);
	            }
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                var obj = _this._getObjForUserAPI();
	                appPot.getAjax().put("users/" + _this.userId, options)
	                    .send(obj)
	                    .end(ajax_1.Ajax.end(function (obj) {
	                    resolve(_this.set(obj.user));
	                }, reject));
	            });
	        };
	        User.prototype.remove = function (options) {
	            return User.remove(this.userId, options);
	        };
	        User.remove = function (userId, options) {
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().remove("users/" + userId, options)
	                    .query({ token: appPot.getAuthInfo().getToken() })
	                    .end(ajax_1.Ajax.end(resolve, reject));
	            });
	        };
	        return User;
	    }());
	}
	exports.getUserClass = getUserClass;
	(function (Role) {
	    Role[Role["SuperAdmin"] = 2] = "SuperAdmin";
	    Role[Role["Admin"] = 3] = "Admin";
	    Role[Role["Manager"] = 4] = "Manager";
	    Role[Role["User"] = 5] = "User";
	})(exports.Role || (exports.Role = {}));
	var Role = exports.Role;
	var GroupsRoles = (function () {
	    function GroupsRoles(args) {
	        if (args instanceof GroupsRoles) {
	            return args;
	        }
	        //restore
	        if (args._groupId && args._groupName && args._roleName) {
	            this._groupId = args._groupId;
	            this._groupName = args._groupName;
	            this._roleName = args._roleName;
	            return this;
	        }
	        if (args.group && args.role) {
	            this._groupId = args.group.groupId;
	            this._roleName = args.role.roleName;
	            this._groupName = args.group.groupName;
	        }
	        if (args.groupId) {
	            this._groupId = args.groupId;
	        }
	        if (args.roleName && !this._roleName) {
	            this._roleName = args.roleName;
	        }
	        if (args.role && !this._roleName) {
	            console.log('[WARN] roleId or Role enumerator will be can no longer be specify to create GroupsRoles Instance.');
	            this._roleName = Role[args.role];
	            if (this._roleName == 'SuperAdmin') {
	                this._roleName = 'Super Admin';
	            }
	        }
	        if (args.groupName) {
	            this._groupName = args.groupName;
	        }
	        if (args.description) {
	            this._description = args.description;
	        }
	    }
	    GroupsRoles.prototype.setGroupsRoles = function (obj) {
	        this._groupId = obj.group.groupId;
	        this._roleName = obj.role.roleName;
	        return this;
	    };
	    Object.defineProperty(GroupsRoles.prototype, "groupId", {
	        get: function () {
	            return this._groupId;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(GroupsRoles.prototype, "groupName", {
	        get: function () {
	            return this._groupName;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(GroupsRoles.prototype, "role", {
	        get: function () {
	            console.log('[WARN] roleId or Role enumerator will be can no longer be use.');
	            var roleName = this._roleName;
	            if (roleName == 'Super Admin') {
	                roleName = 'SuperAdmin';
	            }
	            return Role[roleName];
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(GroupsRoles.prototype, "description", {
	        get: function () {
	            return this._description;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(GroupsRoles.prototype, "roleName", {
	        get: function () {
	            return this._roleName;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    GroupsRoles.prototype.getGroupsRolesForUserAPI = function () {
	        return {
	            group: {
	                groupId: this.groupId
	            },
	            role: {
	                roleName: this.roleName
	            }
	        };
	    };
	    return GroupsRoles;
	}());
	exports.GroupsRoles = GroupsRoles;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var ajax_1 = __webpack_require__(4);
	var es6_promise_1 = __webpack_require__(13);
	function getGroupClass(appPot) {
	    return (function () {
	        function Group(columns) {
	            this._columns = {
	                groupId: null,
	                groupName: "",
	                isAddCurrentApp: false,
	                description: ""
	            };
	            this.set(columns);
	        }
	        Object.defineProperty(Group.prototype, "groupId", {
	            get: function () {
	                return this._columns.groupId;
	            },
	            set: function (val) {
	                this._columns.groupId = val;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(Group.prototype, "groupName", {
	            get: function () {
	                return this._columns.groupName;
	            },
	            set: function (val) {
	                this._columns.groupName = val;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(Group.prototype, "description", {
	            get: function () {
	                return this._columns.description;
	            },
	            set: function (val) {
	                this._columns.description = val;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Group.prototype.set = function (columns) {
	            var _this = this;
	            Object.keys(this._columns).forEach(function (key) {
	                if (columns[key]) {
	                    _this._columns[key] = columns[key];
	                }
	            });
	            return this;
	        };
	        Group.list = function (options) {
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().get('groups', options)
	                    .query({ token: appPot.getAuthInfo().getToken() })
	                    .end(ajax_1.Ajax.end(function (res) {
	                    var groups = res['groups'].map(function (group) {
	                        return new Group(group);
	                    });
	                    resolve(groups);
	                }, reject));
	            });
	        };
	        Group.prototype.create = function (columns, options) {
	            var _this = this;
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().post('groups', options)
	                    .send(_this._columns)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    resolve(_this.set(res.group));
	                }, reject));
	            });
	        };
	        Group.prototype.update = function (columns, options) {
	            var _this = this;
	            if (columns) {
	                this.set(columns);
	            }
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().update("groups/" + _this.groupId, options)
	                    .send(_this._columns)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    resolve(_this.set(res.group));
	                }, reject));
	            });
	        };
	        Group.prototype.remove = function (options) {
	            return Group.remove(this.groupId, options);
	        };
	        Group.remove = function (groupId, options) {
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().remove("groups/" + groupId, options)
	                    .query({ token: appPot.getAuthInfo().getToken() })
	                    .end(ajax_1.Ajax.end(resolve, reject));
	            });
	        };
	        return Group;
	    }());
	}
	exports.getGroupClass = getGroupClass;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var ajax_1 = __webpack_require__(4);
	var es6_promise_1 = __webpack_require__(13);
	function getFileClass(appPot) {
	    return (function () {
	        function File(name, url) {
	            this._name = name;
	            this._url = url;
	        }
	        File.getUrl = function (filename) {
	            return appPot.getConfig().entryPoint + "files/" + filename + "?userToken=" + appPot.getAuthInfo().getToken();
	        };
	        Object.defineProperty(File.prototype, "url", {
	            get: function () {
	                return appPot.getConfig().entryPoint + "files/" + this.name + "?userToken=" + appPot.getAuthInfo().getToken();
	            },
	            enumerable: true,
	            configurable: true
	        });
	        Object.defineProperty(File.prototype, "name", {
	            get: function () {
	                return this._name;
	            },
	            enumerable: true,
	            configurable: true
	        });
	        File.create = function (filename, content, progress) {
	            var prog = progress ? progress : function () { };
	            var entity = JSON.stringify({ name: filename });
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().post('files', {
	                    'contentType': 'no-set'
	                })
	                    .field('entity', entity)
	                    .attach('file', content)
	                    .on('progress', prog)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    var file = new File(res.results.name, res.results.url);
	                    resolve(file);
	                }, reject));
	            });
	        };
	        File.prototype.get = function (progress) {
	            return File.get(this.name, progress);
	        };
	        File.get = function (filename, progress) {
	            var prog = progress ? progress : function () { };
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().get("files/" + filename)
	                    .query("userToken=" + appPot.getAuthInfo().getToken())
	                    .on('progress', prog)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    resolve(res);
	                }, reject));
	            });
	        };
	        File.prototype.update = function (filename, content, progress) {
	            var _this = this;
	            var prog = progress ? progress : function () { };
	            var entity = JSON.stringify({ name: filename });
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().put("files/" + _this.name, {
	                    'contentType': 'no-set'
	                })
	                    .field('entity', entity)
	                    .attach('file', content)
	                    .on('progress', prog)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    var file = new File(res.results.name, res.results.url);
	                    resolve(file);
	                }, reject));
	            });
	        };
	        File.prototype.remove = function (filename) {
	            var _this = this;
	            return new es6_promise_1.Promise(function (resolve, reject) {
	                appPot.getAjax().remove("files/" + _this.name)
	                    .end(ajax_1.Ajax.end(function (res) {
	                    resolve(res);
	                }, reject));
	            });
	        };
	        return File;
	    }());
	}
	exports.getFileClass = getFileClass;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var es6_promise_1 = __webpack_require__(13);
	var objectAssign = __webpack_require__(3);
	function request(func, serviceName, url, params, body, options) {
	    var _response = 'json';
	    var _orig = false;
	    var _headers = {};
	    if (options) {
	        if (options.original) {
	            _response = 'original';
	            _orig = true;
	        }
	        if (options.headers) {
	            _headers = objectAssign(_headers, options.headers);
	        }
	    }
	    var _params = params ? params : {};
	    var _body = body ? body : undefined;
	    if (!(_body instanceof Array) &&
	        _body !== undefined) {
	        _body = [_body];
	    }
	    var _url = url.replace(/^\//, '').replace(/\/$/, '');
	    return new es6_promise_1.Promise(function (resolve, reject) {
	        func("gateway/" + serviceName + "/" + _response + "/" + _url).set(_headers).query(_params).send(_body).end(function (err, res) {
	            if (_orig) {
	                return resolve({ error: err, response: res });
	            }
	            if (err) {
	                return reject({ "status": "error", "results": err, "response": res });
	            }
	            var obj = JSON.parse(res.text);
	            if (obj.status == 'OK') {
	                resolve(obj.results);
	            }
	            else {
	                return reject({ "status": "error", "results": err, "response": res });
	            }
	        });
	    });
	}
	var Gateway = (function () {
	    function Gateway(appPot) {
	        this._ajax = appPot.getAjax();
	        ;
	    }
	    Gateway.prototype.get = function (serviceName, url, params, body, options) {
	        return request(this._ajax.get.bind(this._ajax), serviceName, url, params, undefined, options);
	    };
	    Gateway.prototype.post = function (serviceName, url, params, body, options) {
	        return request(this._ajax.post.bind(this._ajax), serviceName, url, params, body, options);
	    };
	    Gateway.prototype.put = function (serviceName, url, params, body, options) {
	        return request(this._ajax.put.bind(this._ajax), serviceName, url, params, body, options);
	    };
	    Gateway.prototype.remove = function (serviceName, url, params, body, options) {
	        return request(this._ajax.remove.bind(this._ajax), serviceName, url, params, undefined, options);
	    };
	    return Gateway;
	}());
	function getGateway(appPot) {
	    return new Gateway(appPot);
	}
	exports.getGateway = getGateway;


/***/ })
/******/ ])
});
;