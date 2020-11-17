(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AppPotSDK"] = factory();
	else
		root["AppPotSDK"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 767:
/***/ ((module) => {


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

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
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

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

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

/***/ 445:
/***/ ((module) => {

module.exports = stringify
stringify.default = stringify
stringify.stable = deterministicStringify
stringify.stableStringify = deterministicStringify

var arr = []
var replacerStack = []

// Regular stringify
function stringify (obj, replacer, spacer) {
  decirc(obj, '', [], undefined)
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(obj, replacer, spacer)
  } else {
    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}
function decirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, stack, val)
      }
    } else {
      var keys = Object.keys(val)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        decirc(val[key], key, stack, val)
      }
    }
    stack.pop()
  }
}

// Stable-stringify
function compareFunction (a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function deterministicStringify (obj, replacer, spacer) {
  var tmp = deterministicDecirc(obj, '', [], undefined) || obj
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(tmp, replacer, spacer)
  } else {
    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}

function deterministicDecirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    if (typeof val.toJSON === 'function') {
      return
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, stack, val)
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {}
      var keys = Object.keys(val).sort(compareFunction)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        deterministicDecirc(val[key], key, stack, val)
        tmp[key] = val[key]
      }
      if (parent !== undefined) {
        arr.push([parent, k, val])
        parent[k] = tmp
      } else {
        return tmp
      }
    }
    stack.pop()
  }
}

// wraps replacer function to handle values we couldn't replace
// and mark them as [Circular]
function replaceGetterValues (replacer) {
  replacer = replacer !== undefined ? replacer : function (k, v) { return v }
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i]
        if (part[1] === key && part[0] === val) {
          val = '[Circular]'
          replacerStack.splice(i, 1)
          break
        }
      }
    }
    return replacer.call(this, key, val)
  }
}


/***/ }),

/***/ 418:
/***/ ((module) => {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


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

/***/ 798:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var util = __webpack_require__(769);

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = util.assign(
    {
        'default': Format.RFC3986,
        formatters: {
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return String(value);
            }
        }
    },
    Format
);


/***/ }),

/***/ 129:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var stringify = __webpack_require__(261);
var parse = __webpack_require__(235);
var formats = __webpack_require__(798);

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};


/***/ }),

/***/ 235:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(769);

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(
                parseArrayValue(part.slice(pos + 1), options),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj; // eslint-disable-line no-param-reassign
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};


/***/ }),

/***/ 261:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(769);
var formats = __webpack_require__(798);
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    formatter,
    encodeValuesOnly,
    charset
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        }).join(',');
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key') : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key');
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value'))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        var value = obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix
            : prefix + (allowDots ? '.' + key : '[' + key + ']');

        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly,
            charset
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.formatter,
            options.encodeValuesOnly,
            options.charset
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};


/***/ }),

/***/ 769:
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};


/***/ }),

/***/ 903:
/***/ ((module) => {

"use strict";


function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function Agent() {
  this._defaults = [];
}

['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts'].forEach(function (fn) {
  // Default setting for all requests from this agent
  Agent.prototype[fn] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this._defaults.push({
      fn: fn,
      args: args
    });

    return this;
  };
});

Agent.prototype._setDefaults = function (req) {
  this._defaults.forEach(function (def) {
    req[def.fn].apply(req, _toConsumableArray(def.args));
  });
};

module.exports = Agent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hZ2VudC1iYXNlLmpzIl0sIm5hbWVzIjpbIkFnZW50IiwiX2RlZmF1bHRzIiwiZm9yRWFjaCIsImZuIiwicHJvdG90eXBlIiwiYXJncyIsInB1c2giLCJfc2V0RGVmYXVsdHMiLCJyZXEiLCJkZWYiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLFNBQVNBLEtBQVQsR0FBaUI7QUFDZixPQUFLQyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0Q7O0FBRUQsQ0FDRSxLQURGLEVBRUUsSUFGRixFQUdFLE1BSEYsRUFJRSxLQUpGLEVBS0UsT0FMRixFQU1FLE1BTkYsRUFPRSxRQVBGLEVBUUUsTUFSRixFQVNFLGlCQVRGLEVBVUUsV0FWRixFQVdFLE9BWEYsRUFZRSxJQVpGLEVBYUUsV0FiRixFQWNFLFNBZEYsRUFlRSxRQWZGLEVBZ0JFLFdBaEJGLEVBaUJFLE9BakJGLEVBa0JFLElBbEJGLEVBbUJFLEtBbkJGLEVBb0JFLEtBcEJGLEVBcUJFLE1BckJGLEVBc0JFLGlCQXRCRixFQXVCRUMsT0F2QkYsQ0F1QlUsVUFBQ0MsRUFBRCxFQUFRO0FBQ2hCO0FBQ0FILEVBQUFBLEtBQUssQ0FBQ0ksU0FBTixDQUFnQkQsRUFBaEIsSUFBc0IsWUFBbUI7QUFBQSxzQ0FBTkUsSUFBTTtBQUFOQSxNQUFBQSxJQUFNO0FBQUE7O0FBQ3ZDLFNBQUtKLFNBQUwsQ0FBZUssSUFBZixDQUFvQjtBQUFFSCxNQUFBQSxFQUFFLEVBQUZBLEVBQUY7QUFBTUUsTUFBQUEsSUFBSSxFQUFKQTtBQUFOLEtBQXBCOztBQUNBLFdBQU8sSUFBUDtBQUNELEdBSEQ7QUFJRCxDQTdCRDs7QUErQkFMLEtBQUssQ0FBQ0ksU0FBTixDQUFnQkcsWUFBaEIsR0FBK0IsVUFBVUMsR0FBVixFQUFlO0FBQzVDLE9BQUtQLFNBQUwsQ0FBZUMsT0FBZixDQUF1QixVQUFDTyxHQUFELEVBQVM7QUFDOUJELElBQUFBLEdBQUcsQ0FBQ0MsR0FBRyxDQUFDTixFQUFMLENBQUgsT0FBQUssR0FBRyxxQkFBWUMsR0FBRyxDQUFDSixJQUFoQixFQUFIO0FBQ0QsR0FGRDtBQUdELENBSkQ7O0FBTUFLLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQlgsS0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBBZ2VudCgpIHtcbiAgdGhpcy5fZGVmYXVsdHMgPSBbXTtcbn1cblxuW1xuICAndXNlJyxcbiAgJ29uJyxcbiAgJ29uY2UnLFxuICAnc2V0JyxcbiAgJ3F1ZXJ5JyxcbiAgJ3R5cGUnLFxuICAnYWNjZXB0JyxcbiAgJ2F1dGgnLFxuICAnd2l0aENyZWRlbnRpYWxzJyxcbiAgJ3NvcnRRdWVyeScsXG4gICdyZXRyeScsXG4gICdvaycsXG4gICdyZWRpcmVjdHMnLFxuICAndGltZW91dCcsXG4gICdidWZmZXInLFxuICAnc2VyaWFsaXplJyxcbiAgJ3BhcnNlJyxcbiAgJ2NhJyxcbiAgJ2tleScsXG4gICdwZngnLFxuICAnY2VydCcsXG4gICdkaXNhYmxlVExTQ2VydHMnXG5dLmZvckVhY2goKGZuKSA9PiB7XG4gIC8vIERlZmF1bHQgc2V0dGluZyBmb3IgYWxsIHJlcXVlc3RzIGZyb20gdGhpcyBhZ2VudFxuICBBZ2VudC5wcm90b3R5cGVbZm5dID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9kZWZhdWx0cy5wdXNoKHsgZm4sIGFyZ3MgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59KTtcblxuQWdlbnQucHJvdG90eXBlLl9zZXREZWZhdWx0cyA9IGZ1bmN0aW9uIChyZXEpIHtcbiAgdGhpcy5fZGVmYXVsdHMuZm9yRWFjaCgoZGVmKSA9PiB7XG4gICAgcmVxW2RlZi5mbl0oLi4uZGVmLmFyZ3MpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQWdlbnQ7XG4iXX0=

/***/ }),

/***/ 569:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Root reference for iframes.
 */
var root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

var Emitter = __webpack_require__(767);

var safeStringify = __webpack_require__(445);

var qs = __webpack_require__(129);

var RequestBase = __webpack_require__(899);

var isObject = __webpack_require__(960);

var ResponseBase = __webpack_require__(97);

var Agent = __webpack_require__(903);
/**
 * Noop.
 */


function noop() {}
/**
 * Expose `request`.
 */


module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
var request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:' || !root.ActiveXObject)) {
    return new XMLHttpRequest();
  }

  try {
    return new ActiveXObject('Microsoft.XMLHTTP');
  } catch (_unused) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.6.0');
  } catch (_unused2) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.3.0');
  } catch (_unused3) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP');
  } catch (_unused4) {}

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */


var trim = ''.trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, '');
};
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
    if (Object.prototype.hasOwnProperty.call(obj, key)) pushEncodedKeyValuePair(pairs, key, obj[key]);
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
  if (val === undefined) return;

  if (val === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(val)) {
    val.forEach(function (v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  } else if (isObject(val)) {
    for (var subkey in val) {
      if (Object.prototype.hasOwnProperty.call(val, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), val[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(val));
  }
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
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
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
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
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
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': safeStringify
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

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

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
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/i.test(mime);
}
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


function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
} // eslint-disable-next-line new-cap


ResponseBase(Response.prototype);
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

Response.prototype._parseBody = function (str) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, str);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && str && (str.length > 0 || str instanceof Object) ? parse(str) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;
  var msg = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
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

  this.on('end', function () {
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (err_) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = err_; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);
    var new_err;

    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err_) {
      new_err = err_; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_err) {
      new_err.original = err;
      new_err.response = res;
      new_err.status = res.status;
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype); // eslint-disable-next-line new-cap

RequestBase(Request.prototype);
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

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
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


Request.prototype.accept = function (type) {
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (_typeof(pass) === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  var encoder = function encoder(string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };

  return this._auth(user, pass, options, encoder);
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


Request.prototype.query = function (val) {
  if (typeof val !== 'string') val = serialize(val);
  if (val) this._query.push(val);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */


Request.prototype.callback = function (err, res) {
  if (this._shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;
  err.status = this.status;
  err.method = this.method;
  err.url = this.url;
  this.callback(err);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = function () {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && _typeof(obj) === 'object' && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  var self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(function () {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var self = this;
  this.xhr = request.getXHR();
  var xhr = this.xhr;
  var data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.onreadystatechange = function () {
    var readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    var status;

    try {
      status = xhr.status;
    } catch (_unused5) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }; // progress


  var handleProgress = function handleProgress(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (_unused6) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];

    var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!_serialize && isJSON(contentType)) {
      _serialize = request.serialize['application/json'];
    }

    if (_serialize) data = _serialize(data);
  } // set header fields


  for (var field in this.header) {
    if (this.header[field] === null) continue;
    if (Object.prototype.hasOwnProperty.call(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = function () {
  return new Agent();
};

['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'].forEach(function (method) {
  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var req = new request.Request(method, url);

    this._setDefaults(req);

    if (fn) {
      req.end(fn);
    }

    return req;
  };
});
Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var req = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.head = function (url, data, fn) {
  var req = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.options = function (url, data, fn) {
  var req = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


function del(url, data, fn) {
  var req = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var req = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.post = function (url, data, fn) {
  var req = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.put = function (url, data, fn) {
  var req = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsicm9vdCIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwid2FybiIsIkVtaXR0ZXIiLCJyZXF1aXJlIiwic2FmZVN0cmluZ2lmeSIsInFzIiwiUmVxdWVzdEJhc2UiLCJpc09iamVjdCIsIlJlc3BvbnNlQmFzZSIsIkFnZW50Iiwibm9vcCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRob2QiLCJ1cmwiLCJSZXF1ZXN0IiwiZW5kIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicmVxdWVzdCIsImdldFhIUiIsIlhNTEh0dHBSZXF1ZXN0IiwibG9jYXRpb24iLCJwcm90b2NvbCIsIkFjdGl2ZVhPYmplY3QiLCJFcnJvciIsInRyaW0iLCJzIiwicmVwbGFjZSIsInNlcmlhbGl6ZSIsIm9iaiIsInBhaXJzIiwia2V5IiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwicHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIiLCJqb2luIiwidmFsIiwidW5kZWZpbmVkIiwicHVzaCIsImVuY29kZVVSSSIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJ2Iiwic3Via2V5IiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2VyaWFsaXplT2JqZWN0IiwicGFyc2VTdHJpbmciLCJzdHIiLCJzcGxpdCIsInBhaXIiLCJwb3MiLCJpIiwibGVuIiwiaW5kZXhPZiIsImRlY29kZVVSSUNvbXBvbmVudCIsInNsaWNlIiwidHlwZXMiLCJodG1sIiwianNvbiIsInhtbCIsInVybGVuY29kZWQiLCJmb3JtIiwic3RyaW5naWZ5IiwicGFyc2UiLCJKU09OIiwicGFyc2VIZWFkZXIiLCJsaW5lcyIsImZpZWxkcyIsImluZGV4IiwibGluZSIsImZpZWxkIiwidG9Mb3dlckNhc2UiLCJpc0pTT04iLCJtaW1lIiwidGVzdCIsIlJlc3BvbnNlIiwicmVxIiwieGhyIiwidGV4dCIsInJlc3BvbnNlVHlwZSIsInJlc3BvbnNlVGV4dCIsInN0YXR1c1RleHQiLCJzdGF0dXMiLCJfc2V0U3RhdHVzUHJvcGVydGllcyIsImhlYWRlcnMiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJoZWFkZXIiLCJnZXRSZXNwb25zZUhlYWRlciIsIl9zZXRIZWFkZXJQcm9wZXJ0aWVzIiwiX3Jlc3BvbnNlVHlwZSIsImJvZHkiLCJyZXNwb25zZSIsIl9wYXJzZUJvZHkiLCJ0eXBlIiwiX3BhcnNlciIsInRvRXJyb3IiLCJtc2ciLCJlcnIiLCJfcXVlcnkiLCJfaGVhZGVyIiwib24iLCJyZXMiLCJlcnJfIiwib3JpZ2luYWwiLCJyYXdSZXNwb25zZSIsInN0YXR1c0NvZGUiLCJjYWxsYmFjayIsImVtaXQiLCJuZXdfZXJyIiwiX2lzUmVzcG9uc2VPSyIsInNldCIsImFjY2VwdCIsImF1dGgiLCJ1c2VyIiwicGFzcyIsIm9wdGlvbnMiLCJidG9hIiwiZW5jb2RlciIsInN0cmluZyIsIl9hdXRoIiwicXVlcnkiLCJhdHRhY2giLCJmaWxlIiwiX2RhdGEiLCJfZ2V0Rm9ybURhdGEiLCJhcHBlbmQiLCJuYW1lIiwiX2Zvcm1EYXRhIiwiRm9ybURhdGEiLCJfc2hvdWxkUmV0cnkiLCJfcmV0cnkiLCJmbiIsIl9jYWxsYmFjayIsImNsZWFyVGltZW91dCIsIl9tYXhSZXRyaWVzIiwicmV0cmllcyIsIl9yZXRyaWVzIiwiY3Jvc3NEb21haW5FcnJvciIsImNyb3NzRG9tYWluIiwiYWdlbnQiLCJjYSIsImJ1ZmZlciIsIndyaXRlIiwicGlwZSIsIl9pc0hvc3QiLCJ0b1N0cmluZyIsIl9lbmRDYWxsZWQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsIl9lbmQiLCJfc2V0VXBsb2FkVGltZW91dCIsIl91cGxvYWRUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXRUaW1lciIsInNldFRpbWVvdXQiLCJfdGltZW91dEVycm9yIiwiX2Fib3J0ZWQiLCJkYXRhIiwiX3NldFRpbWVvdXRzIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsIl9yZXNwb25zZVRpbWVvdXRUaW1lciIsInRpbWVkb3V0IiwiaGFuZGxlUHJvZ3Jlc3MiLCJkaXJlY3Rpb24iLCJlIiwidG90YWwiLCJwZXJjZW50IiwibG9hZGVkIiwiaGFzTGlzdGVuZXJzIiwiYWRkRXZlbnRMaXN0ZW5lciIsImJpbmQiLCJ1cGxvYWQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwib3BlbiIsIl93aXRoQ3JlZGVudGlhbHMiLCJ3aXRoQ3JlZGVudGlhbHMiLCJjb250ZW50VHlwZSIsIl9zZXJpYWxpemVyIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJfc2V0RGVmYXVsdHMiLCJkZWwiLCJkZWxldGUiLCJnZXQiLCJoZWFkIiwicGF0Y2giLCJwb3N0IiwicHV0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7OztBQUlBLElBQUlBLElBQUo7O0FBQ0EsSUFBSSxPQUFPQyxNQUFQLEtBQWtCLFdBQXRCLEVBQW1DO0FBQ2pDO0FBQ0FELEVBQUFBLElBQUksR0FBR0MsTUFBUDtBQUNELENBSEQsTUFHTyxJQUFJLE9BQU9DLElBQVAsS0FBZ0IsV0FBcEIsRUFBaUM7QUFDdEM7QUFDQUMsRUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQ0UscUVBREY7QUFHQUosRUFBQUEsSUFBSSxTQUFKO0FBQ0QsQ0FOTSxNQU1BO0FBQ0w7QUFDQUEsRUFBQUEsSUFBSSxHQUFHRSxJQUFQO0FBQ0Q7O0FBRUQsSUFBTUcsT0FBTyxHQUFHQyxPQUFPLENBQUMsbUJBQUQsQ0FBdkI7O0FBQ0EsSUFBTUMsYUFBYSxHQUFHRCxPQUFPLENBQUMscUJBQUQsQ0FBN0I7O0FBQ0EsSUFBTUUsRUFBRSxHQUFHRixPQUFPLENBQUMsSUFBRCxDQUFsQjs7QUFDQSxJQUFNRyxXQUFXLEdBQUdILE9BQU8sQ0FBQyxnQkFBRCxDQUEzQjs7QUFDQSxJQUFNSSxRQUFRLEdBQUdKLE9BQU8sQ0FBQyxhQUFELENBQXhCOztBQUNBLElBQU1LLFlBQVksR0FBR0wsT0FBTyxDQUFDLGlCQUFELENBQTVCOztBQUNBLElBQU1NLEtBQUssR0FBR04sT0FBTyxDQUFD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aEUsR0FBSixDQUFRdUgsRUFBUjtBQUNSLFNBQU92RCxHQUFQO0FBQ0QsQ0FWRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxubGV0IHJvb3Q7XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gQnJvd3NlciB3aW5kb3dcbiAgcm9vdCA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIE90aGVyIGVudmlyb25tZW50c1xuICBjb25zb2xlLndhcm4oXG4gICAgJ1VzaW5nIGJyb3dzZXItb25seSB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQnXG4gICk7XG4gIHJvb3QgPSB0aGlzO1xufSBlbHNlIHtcbiAgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn1cblxuY29uc3QgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG5jb25zdCBzYWZlU3RyaW5naWZ5ID0gcmVxdWlyZSgnZmFzdC1zYWZlLXN0cmluZ2lmeScpO1xuY29uc3QgcXMgPSByZXF1aXJlKCdxcycpO1xuY29uc3QgUmVxdWVzdEJhc2UgPSByZXF1aXJlKCcuL3JlcXVlc3QtYmFzZScpO1xuY29uc3QgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzLW9iamVjdCcpO1xuY29uc3QgUmVzcG9uc2VCYXNlID0gcmVxdWlyZSgnLi9yZXNwb25zZS1iYXNlJyk7XG5jb25zdCBBZ2VudCA9IHJlcXVpcmUoJy4vYWdlbnQtYmFzZScpO1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAodHlwZW9mIHVybCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdChtZXRob2QsIHVybCk7XG59O1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG5cbmNvbnN0IHJlcXVlc3QgPSBleHBvcnRzO1xuXG5leHBvcnRzLlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSAoKSA9PiB7XG4gIGlmIChcbiAgICByb290LlhNTEh0dHBSZXF1ZXN0ICYmXG4gICAgKCFyb290LmxvY2F0aW9uIHx8XG4gICAgICByb290LmxvY2F0aW9uLnByb3RvY29sICE9PSAnZmlsZTonIHx8XG4gICAgICAhcm9vdC5BY3RpdmVYT2JqZWN0KVxuICApIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTtcbiAgfSBjYXRjaCB7fVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTtcbiAgfSBjYXRjaCB7fVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTtcbiAgfSBjYXRjaCB7fVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpO1xuICB9IGNhdGNoIHt9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdCcm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGNvdWxkIG5vdCBmaW5kIFhIUicpO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmNvbnN0IHRyaW0gPSAnJy50cmltID8gKHMpID0+IHMudHJpbSgpIDogKHMpID0+IHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgY29uc3QgcGFpcnMgPSBbXTtcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpXG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCBvYmpba2V5XSk7XG4gIH1cblxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEhlbHBzICdzZXJpYWxpemUnIHdpdGggc2VyaWFsaXppbmcgYXJyYXlzLlxuICogTXV0YXRlcyB0aGUgcGFpcnMgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGFpcnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICovXG5cbmZ1bmN0aW9uIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIHZhbCkge1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJKGtleSkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICB2YWwuZm9yRWFjaCgodikgPT4ge1xuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgdik7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QodmFsKSkge1xuICAgIGZvciAoY29uc3Qgc3Via2V5IGluIHZhbCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWwsIHN1YmtleSkpXG4gICAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBgJHtrZXl9WyR7c3Via2V5fV1gLCB2YWxbc3Via2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJKGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxucmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgY29uc3Qgb2JqID0ge307XG4gIGNvbnN0IHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIGxldCBwYWlyO1xuICBsZXQgcG9zO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwb3MgPSBwYWlyLmluZGV4T2YoJz0nKTtcbiAgICBpZiAocG9zID09PSAtMSkge1xuICAgICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYWlyKV0gPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYWlyLnNsaWNlKDAsIHBvcykpXSA9IGRlY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgcGFpci5zbGljZShwb3MgKyAxKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAndGV4dC94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgZm9ybTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbnJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcXMuc3RyaW5naWZ5LFxuICAnYXBwbGljYXRpb24vanNvbic6IHNhZmVTdHJpbmdpZnlcbn07XG5cbi8qKlxuICogRGVmYXVsdCBwYXJzZXJzLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gKiAgICAgfTtcbiAqXG4gKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgY29uc3QgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgZmllbGRzID0ge307XG4gIGxldCBpbmRleDtcbiAgbGV0IGxpbmU7XG4gIGxldCBmaWVsZDtcbiAgbGV0IHZhbDtcblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAvLyBjb3VsZCBiZSBlbXB0eSBsaW5lLCBqdXN0IHNraXAgaXRcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG1pbWVgIGlzIGpzb24gb3IgaGFzICtqc29uIHN0cnVjdHVyZWQgc3ludGF4IHN1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWltZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSlNPTihtaW1lKSB7XG4gIC8vIHNob3VsZCBtYXRjaCAvanNvbiBvciAranNvblxuICAvLyBidXQgbm90IC9qc29uLXNlcVxuICByZXR1cm4gL1svK11qc29uKCR8W14tXFx3XSkvaS50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEpIHtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9XG4gICAgKHRoaXMucmVxLm1ldGhvZCAhPT0gJ0hFQUQnICYmXG4gICAgICAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8XG4gICAgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICBsZXQgeyBzdGF0dXMgfSA9IHRoaXMueGhyO1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHN0YXR1cyk7XG4gIHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnM7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLl9zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcblxuICBpZiAodGhpcy50ZXh0ID09PSBudWxsICYmIHJlcS5fcmVzcG9uc2VUeXBlKSB7XG4gICAgdGhpcy5ib2R5ID0gdGhpcy54aHIucmVzcG9uc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5ib2R5ID1cbiAgICAgIHRoaXMucmVxLm1ldGhvZCA9PT0gJ0hFQUQnXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IHRoaXMuX3BhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSk7XG4gIH1cbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5ldy1jYXBcblJlc3BvbnNlQmFzZShSZXNwb25zZS5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLl9wYXJzZUJvZHkgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIGxldCBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgaWYgKHRoaXMucmVxLl9wYXJzZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZXEuX3BhcnNlcih0aGlzLCBzdHIpO1xuICB9XG5cbiAgaWYgKCFwYXJzZSAmJiBpc0pTT04odGhpcy50eXBlKSkge1xuICAgIHBhcnNlID0gcmVxdWVzdC5wYXJzZVsnYXBwbGljYXRpb24vanNvbiddO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiAoc3RyLmxlbmd0aCA+IDAgfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHsgcmVxIH0gPSB0aGlzO1xuICBjb25zdCB7IG1ldGhvZCB9ID0gcmVxO1xuICBjb25zdCB7IHVybCB9ID0gcmVxO1xuXG4gIGNvbnN0IG1zZyA9IGBjYW5ub3QgJHttZXRob2R9ICR7dXJsfSAoJHt0aGlzLnN0YXR1c30pYDtcbiAgY29uc3QgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9OyAvLyBwcmVzZXJ2ZXMgaGVhZGVyIG5hbWUgY2FzZVxuICB0aGlzLl9oZWFkZXIgPSB7fTsgLy8gY29lcmNlcyBoZWFkZXIgbmFtZXMgdG8gbG93ZXJjYXNlXG4gIHRoaXMub24oJ2VuZCcsICgpID0+IHtcbiAgICBsZXQgZXJyID0gbnVsbDtcbiAgICBsZXQgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaCAoZXJyXykge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGVycl87XG4gICAgICAvLyBpc3N1ZSAjNjc1OiByZXR1cm4gdGhlIHJhdyByZXNwb25zZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgaWYgKHNlbGYueGhyKSB7XG4gICAgICAgIC8vIGllOSBkb2Vzbid0IGhhdmUgJ3Jlc3BvbnNlJyBwcm9wZXJ0eVxuICAgICAgICBlcnIucmF3UmVzcG9uc2UgPVxuICAgICAgICAgIHR5cGVvZiBzZWxmLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICA/IHNlbGYueGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICAgICAgOiBzZWxmLnhoci5yZXNwb25zZTtcbiAgICAgICAgLy8gaXNzdWUgIzg3NjogcmV0dXJuIHRoZSBodHRwIHN0YXR1cyBjb2RlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICAgIGVyci5zdGF0dXMgPSBzZWxmLnhoci5zdGF0dXMgPyBzZWxmLnhoci5zdGF0dXMgOiBudWxsO1xuICAgICAgICBlcnIuc3RhdHVzQ29kZSA9IGVyci5zdGF0dXM7IC8vIGJhY2t3YXJkcy1jb21wYXQgb25seVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXJyLnJhd1Jlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgZXJyLnN0YXR1cyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuXG4gICAgc2VsZi5lbWl0KCdyZXNwb25zZScsIHJlcyk7XG5cbiAgICBsZXQgbmV3X2VycjtcbiAgICB0cnkge1xuICAgICAgaWYgKCFzZWxmLl9pc1Jlc3BvbnNlT0socmVzKSkge1xuICAgICAgICBuZXdfZXJyID0gbmV3IEVycm9yKFxuICAgICAgICAgIHJlcy5zdGF0dXNUZXh0IHx8IHJlcy50ZXh0IHx8ICdVbnN1Y2Nlc3NmdWwgSFRUUCByZXNwb25zZSdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJfKSB7XG4gICAgICBuZXdfZXJyID0gZXJyXzsgLy8gb2soKSBjYWxsYmFjayBjYW4gdGhyb3dcbiAgICB9XG5cbiAgICAvLyAjMTAwMCBkb24ndCBjYXRjaCBlcnJvcnMgZnJvbSB0aGUgY2FsbGJhY2sgdG8gYXZvaWQgZG91YmxlIGNhbGxpbmcgaXRcbiAgICBpZiAobmV3X2Vycikge1xuICAgICAgbmV3X2Vyci5vcmlnaW5hbCA9IGVycjtcbiAgICAgIG5ld19lcnIucmVzcG9uc2UgPSByZXM7XG4gICAgICBuZXdfZXJyLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG4gICAgICBzZWxmLmNhbGxiYWNrKG5ld19lcnIsIHJlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYCBhbmQgYFJlcXVlc3RCYXNlYC5cbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuUmVxdWVzdEJhc2UoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gW3Bhc3NdIG9wdGlvbmFsIGluIGNhc2Ugb2YgdXNpbmcgJ2JlYXJlcicgYXMgdHlwZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nLCAnYmFzaWMnIG9yICdiZWFyZXInIChkZWZhdWx0ICdiYXNpYycpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSBwYXNzID0gJyc7XG4gIGlmICh0eXBlb2YgcGFzcyA9PT0gJ29iamVjdCcgJiYgcGFzcyAhPT0gbnVsbCkge1xuICAgIC8vIHBhc3MgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZSByZXBsYWNlZCB3aXRoIG9wdGlvbnNcbiAgICBvcHRpb25zID0gcGFzcztcbiAgICBwYXNzID0gJyc7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgdHlwZTogdHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicgPyAnYmFzaWMnIDogJ2F1dG8nXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGVuY29kZXIgPSAoc3RyaW5nKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYnRvYShzdHJpbmcpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVzZSBiYXNpYyBhdXRoLCBidG9hIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiAqICAgICAucXVlcnkoJ3NpemU9MTAnKVxuICogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24gKHZhbCkge1xuICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgb3B0aW9uc2AgKG9yIGZpbGVuYW1lKS5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2goJ2NvbnRlbnQnLCBuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbiAoZmllbGQsIGZpbGUsIG9wdGlvbnMpIHtcbiAgaWYgKGZpbGUpIHtcbiAgICBpZiAodGhpcy5fZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3VwZXJhZ2VudCBjYW4ndCBtaXggLnNlbmQoKSBhbmQgLmF0dGFjaCgpXCIpO1xuICAgIH1cblxuICAgIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGZpZWxkLCBmaWxlLCBvcHRpb25zIHx8IGZpbGUubmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mb3JtRGF0YTtcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgaWYgKHRoaXMuX3Nob3VsZFJldHJ5KGVyciwgcmVzKSkge1xuICAgIHJldHVybiB0aGlzLl9yZXRyeSgpO1xuICB9XG5cbiAgY29uc3QgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcblxuICBpZiAoZXJyKSB7XG4gICAgaWYgKHRoaXMuX21heFJldHJpZXMpIGVyci5yZXRyaWVzID0gdGhpcy5fcmV0cmllcyAtIDE7XG4gICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIH1cblxuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGVyciA9IG5ldyBFcnJvcihcbiAgICAnUmVxdWVzdCBoYXMgYmVlbiB0ZXJtaW5hdGVkXFxuUG9zc2libGUgY2F1c2VzOiB0aGUgbmV0d29yayBpcyBvZmZsaW5lLCBPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luLCB0aGUgcGFnZSBpcyBiZWluZyB1bmxvYWRlZCwgZXRjLidcbiAgKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcblxuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgZXJyLnVybCA9IHRoaXMudXJsO1xuXG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8vIFRoaXMgb25seSB3YXJucywgYmVjYXVzZSB0aGUgcmVxdWVzdCBpcyBzdGlsbCBsaWtlbHkgdG8gd29ya1xuUmVxdWVzdC5wcm90b3R5cGUuYWdlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUud2FybignVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBSZXF1ZXN0LnByb3RvdHlwZS5hZ2VudDtcblJlcXVlc3QucHJvdG90eXBlLmJ1ZmZlciA9IFJlcXVlc3QucHJvdG90eXBlLmNhO1xuXG4vLyBUaGlzIHRocm93cywgYmVjYXVzZSBpdCBjYW4ndCBzZW5kL3JlY2VpdmUgZGF0YSBhcyBleHBlY3RlZFxuUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnU3RyZWFtaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gYnJvd3NlciB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQnXG4gICk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5waXBlID0gUmVxdWVzdC5wcm90b3R5cGUud3JpdGU7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbiAob2JqKSB7XG4gIC8vIE5hdGl2ZSBvYmplY3RzIHN0cmluZ2lmeSB0byBbb2JqZWN0IEZpbGVdLCBbb2JqZWN0IEJsb2JdLCBbb2JqZWN0IEZvcm1EYXRhXSwgZXRjLlxuICByZXR1cm4gKFxuICAgIG9iaiAmJlxuICAgIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmXG4gICAgIUFycmF5LmlzQXJyYXkob2JqKSAmJlxuICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJ1xuICApO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKGZuKSB7XG4gIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnV2FybmluZzogLmVuZCgpIHdhcyBjYWxsZWQgdHdpY2UuIFRoaXMgaXMgbm90IHN1cHBvcnRlZCBpbiBzdXBlcmFnZW50J1xuICAgICk7XG4gIH1cblxuICB0aGlzLl9lbmRDYWxsZWQgPSB0cnVlO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBxdWVyeXN0cmluZ1xuICB0aGlzLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nKCk7XG5cbiAgdGhpcy5fZW5kKCk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fc2V0VXBsb2FkVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gdXBsb2FkIHRpbWVvdXQgaXQncyB3b2tycyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gIGlmICh0aGlzLl91cGxvYWRUaW1lb3V0ICYmICF0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1VwbG9hZCB0aW1lb3V0IG9mICcsXG4gICAgICAgIHNlbGYuX3VwbG9hZFRpbWVvdXQsXG4gICAgICAgICdFVElNRURPVVQnXG4gICAgICApO1xuICAgIH0sIHRoaXMuX3VwbG9hZFRpbWVvdXQpO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdC5wcm90b3R5cGUuX2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soXG4gICAgICBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgZXZlbiBiZWZvcmUgLmVuZCgpIHdhcyBjYWxsZWQnKVxuICAgICk7XG5cbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gIHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgY29uc3QgeyB4aHIgfSA9IHRoaXM7XG4gIGxldCBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICB0aGlzLl9zZXRUaW1lb3V0cygpO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgcmVhZHlTdGF0ZSB9ID0geGhyO1xuICAgIGlmIChyZWFkeVN0YXRlID49IDIgJiYgc2VsZi5fcmVzcG9uc2VUaW1lb3V0VGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dChzZWxmLl9yZXNwb25zZVRpbWVvdXRUaW1lcik7XG4gICAgfVxuXG4gICAgaWYgKHJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbiBJRTksIHJlYWRzIHRvIGFueSBwcm9wZXJ0eSAoZS5nLiBzdGF0dXMpIG9mZiBvZiBhbiBhYm9ydGVkIFhIUiB3aWxsXG4gICAgLy8gcmVzdWx0IGluIHRoZSBlcnJvciBcIkNvdWxkIG5vdCBjb21wbGV0ZSB0aGUgb3BlcmF0aW9uIGR1ZSB0byBlcnJvciBjMDBjMDIzZlwiXG4gICAgbGV0IHN0YXR1cztcbiAgICB0cnkge1xuICAgICAgc3RhdHVzID0geGhyLnN0YXR1cztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHN0YXR1cyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLnRpbWVkb3V0IHx8IHNlbGYuX2Fib3J0ZWQpIHJldHVybjtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIGNvbnN0IGhhbmRsZVByb2dyZXNzID0gKGRpcmVjdGlvbiwgZSkgPT4ge1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG5cbiAgICAgIGlmIChlLnBlcmNlbnQgPT09IDEwMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fdXBsb2FkVGltZW91dFRpbWVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gIH07XG5cbiAgaWYgKHRoaXMuaGFzTGlzdGVuZXJzKCdwcm9ncmVzcycpKSB7XG4gICAgdHJ5IHtcbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGhhbmRsZVByb2dyZXNzLmJpbmQobnVsbCwgJ2Rvd25sb2FkJykpO1xuICAgICAgaWYgKHhoci51cGxvYWQpIHtcbiAgICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICdwcm9ncmVzcycsXG4gICAgICAgICAgaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAndXBsb2FkJylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIEFjY2Vzc2luZyB4aHIudXBsb2FkIGZhaWxzIGluIElFIGZyb20gYSB3ZWIgd29ya2VyLCBzbyBqdXN0IHByZXRlbmQgaXQgZG9lc24ndCBleGlzdC5cbiAgICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgICAvLyBodHRwczovL2Nvbm5lY3QubWljcm9zb2Z0LmNvbS9JRS9mZWVkYmFjay9kZXRhaWxzLzgzNzI0NS94bWxodHRwcmVxdWVzdC11cGxvYWQtdGhyb3dzLWludmFsaWQtYXJndW1lbnQtd2hlbi11c2VkLWZyb20td2ViLXdvcmtlci1jb250ZXh0XG4gICAgfVxuICB9XG5cbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB0aGlzLl9zZXRVcGxvYWRUaW1lb3V0KCk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHRyeSB7XG4gICAgaWYgKHRoaXMudXNlcm5hbWUgJiYgdGhpcy5wYXNzd29yZCkge1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlLCB0aGlzLnVzZXJuYW1lLCB0aGlzLnBhc3N3b3JkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIHNlZSAjMTE0OVxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrKGVycik7XG4gIH1cblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKFxuICAgICF0aGlzLl9mb3JtRGF0YSAmJlxuICAgIHRoaXMubWV0aG9kICE9PSAnR0VUJyAmJlxuICAgIHRoaXMubWV0aG9kICE9PSAnSEVBRCcgJiZcbiAgICB0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycgJiZcbiAgICAhdGhpcy5faXNIb3N0KGRhdGEpXG4gICkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgICBsZXQgc2VyaWFsaXplID1cbiAgICAgIHRoaXMuX3NlcmlhbGl6ZXIgfHxcbiAgICAgIHJlcXVlc3Quc2VyaWFsaXplW2NvbnRlbnRUeXBlID8gY29udGVudFR5cGUuc3BsaXQoJzsnKVswXSA6ICcnXTtcbiAgICBpZiAoIXNlcmlhbGl6ZSAmJiBpc0pTT04oY29udGVudFR5cGUpKSB7XG4gICAgICBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24vanNvbiddO1xuICAgIH1cblxuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKGNvbnN0IGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKHRoaXMuaGVhZGVyW2ZpZWxkXSA9PT0gbnVsbCkgY29udGludWU7XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuaGVhZGVyLCBmaWVsZCkpXG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIGlmICh0aGlzLl9yZXNwb25zZVR5cGUpIHtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gdGhpcy5fcmVzcG9uc2VUeXBlO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcblxuICAvLyBJRTExIHhoci5zZW5kKHVuZGVmaW5lZCkgc2VuZHMgJ3VuZGVmaW5lZCcgc3RyaW5nIGFzIFBPU1QgcGF5bG9hZCAoaW5zdGVhZCBvZiBub3RoaW5nKVxuICAvLyBXZSBuZWVkIG51bGwgaGVyZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICB4aHIuc2VuZCh0eXBlb2YgZGF0YSA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogZGF0YSk7XG59O1xuXG5yZXF1ZXN0LmFnZW50ID0gKCkgPT4gbmV3IEFnZW50KCk7XG5cblsnR0VUJywgJ1BPU1QnLCAnT1BUSU9OUycsICdQQVRDSCcsICdQVVQnLCAnREVMRVRFJ10uZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gIEFnZW50LnByb3RvdHlwZVttZXRob2QudG9Mb3dlckNhc2UoKV0gPSBmdW5jdGlvbiAodXJsLCBmbikge1xuICAgIGNvbnN0IHJlcSA9IG5ldyByZXF1ZXN0LlJlcXVlc3QobWV0aG9kLCB1cmwpO1xuICAgIHRoaXMuX3NldERlZmF1bHRzKHJlcSk7XG4gICAgaWYgKGZuKSB7XG4gICAgICByZXEuZW5kKGZuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxO1xuICB9O1xufSk7XG5cbkFnZW50LnByb3RvdHlwZS5kZWwgPSBBZ2VudC5wcm90b3R5cGUuZGVsZXRlO1xuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBPUFRJT05TIHF1ZXJ5IHRvIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5vcHRpb25zID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxID0gcmVxdWVzdCgnT1BUSU9OUycsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBkYXRhLCBmbikge1xuICBjb25zdCByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59XG5cbnJlcXVlc3QuZGVsID0gZGVsO1xucmVxdWVzdC5kZWxldGUgPSBkZWw7XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG4iXX0=

/***/ }),

/***/ 960:
/***/ ((module) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
function isObject(obj) {
  return obj !== null && _typeof(obj) === 'object';
}

module.exports = isObject;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pcy1vYmplY3QuanMiXSwibmFtZXMiOlsiaXNPYmplY3QiLCJvYmoiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7QUFRQSxTQUFTQSxRQUFULENBQWtCQyxHQUFsQixFQUF1QjtBQUNyQixTQUFPQSxHQUFHLEtBQUssSUFBUixJQUFnQixRQUFPQSxHQUFQLE1BQWUsUUFBdEM7QUFDRDs7QUFFREMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCSCxRQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiJdfQ==

/***/ }),

/***/ 899:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = __webpack_require__(960);
/**
 * Expose `RequestBase`.
 */


module.exports = RequestBase;
/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(object) {
  if (object) return mixin(object);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(object) {
  for (var key in RequestBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(RequestBase.prototype, key)) object[key] = RequestBase.prototype[key];
  }

  return object;
}
/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.clearTimeout = function () {
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  clearTimeout(this._uploadTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  delete this._uploadTimeoutTimer;
  return this;
};
/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.parse = function (fn) {
  this._parser = fn;
  return this;
};
/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
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


RequestBase.prototype.responseType = function (value) {
  this._responseType = value;
  return this;
};
/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.serialize = function (fn) {
  this._serializer = fn;
  return this;
};
/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, deadline}
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.timeout = function (options) {
  if (!options || _typeof(options) !== 'object') {
    this._timeout = options;
    this._responseTimeout = 0;
    this._uploadTimeout = 0;
    return this;
  }

  for (var option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      switch (option) {
        case 'deadline':
          this._timeout = options.deadline;
          break;

        case 'response':
          this._responseTimeout = options.response;
          break;

        case 'upload':
          this._uploadTimeout = options.upload;
          break;

        default:
          console.warn('Unknown timeout option', option);
      }
    }
  }

  return this;
};
/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @param {Function} [fn]
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.retry = function (count, fn) {
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  this._retryCallback = fn;
  return this;
}; //
// NOTE: we do not include ESOCKETTIMEDOUT because that is from `request` package
//       <https://github.com/sindresorhus/got/pull/537>
//
// NOTE: we do not include EADDRINFO because it was removed from libuv in 2014
//       <https://github.com/libuv/libuv/commit/02e1ebd40b807be5af46343ea873331b2ee4e9c1>
//       <https://github.com/request/request/search?q=ESOCKETTIMEDOUT&unscoped_q=ESOCKETTIMEDOUT>
//
//
// TODO: expose these as configurable defaults
//


var ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN']);
var STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]); // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)
// const METHODS = new Set(['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE']);

/**
 * Determine if a request should be retried.
 * (Inspired by https://github.com/sindresorhus/got#retry)
 *
 * @param {Error} err an error
 * @param {Response} [res] response
 * @returns {Boolean} if segment should be retried
 */

RequestBase.prototype._shouldRetry = function (err, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }

  if (this._retryCallback) {
    try {
      var override = this._retryCallback(err, res);

      if (override === true) return true;
      if (override === false) return false; // undefined falls back to defaults
    } catch (err_) {
      console.error(err_);
    }
  } // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)

  /*
  if (
    this.req &&
    this.req.method &&
    !METHODS.has(this.req.method.toUpperCase())
  )
    return false;
  */


  if (res && res.status && STATUS_CODES.has(res.status)) return true;

  if (err) {
    if (err.code && ERROR_CODES.has(err.code)) return true; // Superagent timeout

    if (err.timeout && err.code === 'ECONNABORTED') return true;
    if (err.crossDomain) return true;
  }

  return false;
};
/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */


RequestBase.prototype._retry = function () {
  this.clearTimeout(); // node

  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;
  this.timedoutError = null;
  return this._end();
};
/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */


RequestBase.prototype.then = function (resolve, reject) {
  var _this = this;

  if (!this._fullfilledPromise) {
    var self = this;

    if (this._endCalled) {
      console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
    }

    this._fullfilledPromise = new Promise(function (resolve, reject) {
      self.on('abort', function () {
        if (_this._maxRetries && _this._maxRetries > _this._retries) {
          return;
        }

        if (_this.timedout && _this.timedoutError) {
          reject(_this.timedoutError);
          return;
        }

        var err = new Error('Aborted');
        err.code = 'ABORTED';
        err.status = _this.status;
        err.method = _this.method;
        err.url = _this.url;
        reject(err);
      });
      self.end(function (err, res) {
        if (err) reject(err);else resolve(res);
      });
    });
  }

  return this._fullfilledPromise.then(resolve, reject);
};

RequestBase.prototype.catch = function (cb) {
  return this.then(undefined, cb);
};
/**
 * Allow for extension
 */


RequestBase.prototype.use = function (fn) {
  fn(this);
  return this;
};

RequestBase.prototype.ok = function (cb) {
  if (typeof cb !== 'function') throw new Error('Callback required');
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function (res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};
/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


RequestBase.prototype.get = function (field) {
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


RequestBase.prototype.getHeader = RequestBase.prototype.get;
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

RequestBase.prototype.set = function (field, value) {
  if (isObject(field)) {
    for (var key in field) {
      if (Object.prototype.hasOwnProperty.call(field, key)) this.set(key, field[key]);
    }

    return this;
  }

  this._header[field.toLowerCase()] = value;
  this.header[field] = value;
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
 * @param {String} field field name
 */


RequestBase.prototype.unset = function (field) {
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};
/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name name of field
 * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.field = function (name, value) {
  // name should be either a string or an object.
  if (name === null || undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      if (Object.prototype.hasOwnProperty.call(name, key)) this.field(key, name[key]);
    }

    return this;
  }

  if (Array.isArray(value)) {
    for (var i in value) {
      if (Object.prototype.hasOwnProperty.call(value, i)) this.field(name, value[i]);
    }

    return this;
  } // val should be defined now


  if (value === null || undefined === value) {
    throw new Error('.field(name, val) val can not be empty');
  }

  if (typeof value === 'boolean') {
    value = String(value);
  }

  this._getFormData().append(name, value);

  return this;
};
/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request} request
 * @api public
 */


RequestBase.prototype.abort = function () {
  if (this._aborted) {
    return this;
  }

  this._aborted = true;
  if (this.xhr) this.xhr.abort(); // browser

  if (this.req) this.req.abort(); // node

  this.clearTimeout();
  this.emit('abort');
  return this;
};

RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
  switch (options.type) {
    case 'basic':
      this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
      break;

    case 'auto':
      this.username = user;
      this.password = pass;
      break;

    case 'bearer':
      // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', "Bearer ".concat(user));
      break;

    default:
      break;
  }

  return this;
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


RequestBase.prototype.withCredentials = function (on) {
  // This is browser-only functionality. Node side is no-op.
  if (on === undefined) on = true;
  this._withCredentials = on;
  return this;
};
/**
 * Set the max redirects to `n`. Does nothing in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.redirects = function (n) {
  this._maxRedirects = n;
  return this;
};
/**
 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
 * Default 200MB.
 *
 * @param {Number} n number of bytes
 * @return {Request} for chaining
 */


RequestBase.prototype.maxResponseSize = function (n) {
  if (typeof n !== 'number') {
    throw new TypeError('Invalid argument');
  }

  this._maxResponseSize = n;
  return this;
};
/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */


RequestBase.prototype.toJSON = function () {
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
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
// eslint-disable-next-line complexity


RequestBase.prototype.send = function (data) {
  var isObject_ = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject_ && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw new Error("Can't merge these send calls");
  } // merge


  if (isObject_ && isObject(this._data)) {
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) this._data[key] = data[key];
    }
  } else if (typeof data === 'string') {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if (type) type = type.toLowerCase().trim();

    if (type === 'application/x-www-form-urlencoded') {
      this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObject_ || this._isHost(data)) {
    return this;
  } // default to json


  if (!type) this.type('json');
  return this;
};
/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.sortQuery = function (sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};
/**
 * Compose querystring to append to req.url
 *
 * @api private
 */


RequestBase.prototype._finalizeQueryString = function () {
  var query = this._query.join('&');

  if (query) {
    this.url += (this.url.includes('?') ? '&' : '?') + query;
  }

  this._query.length = 0; // Makes the call idempotent

  if (this._sort) {
    var index = this.url.indexOf('?');

    if (index >= 0) {
      var queryArray = this.url.slice(index + 1).split('&');

      if (typeof this._sort === 'function') {
        queryArray.sort(this._sort);
      } else {
        queryArray.sort();
      }

      this.url = this.url.slice(0, index) + '?' + queryArray.join('&');
    }
  }
}; // For backwards compat only


RequestBase.prototype._appendQueryString = function () {
  console.warn('Unsupported');
};
/**
 * Invoke callback with timeout error.
 *
 * @api private
 */


RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
  if (this._aborted) {
    return;
  }

  var err = new Error("".concat(reason + timeout, "ms exceeded"));
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.timedoutError = err;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function () {
  var self = this; // deadline

  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function () {
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  } // response timeout


  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function () {
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0LWJhc2UuanMiXSwibmFtZXMiOlsiaXNPYmplY3QiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIlJlcXVlc3RCYXNlIiwib2JqZWN0IiwibWl4aW4iLCJrZXkiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJjbGVhclRpbWVvdXQiLCJfdGltZXIiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJfdXBsb2FkVGltZW91dFRpbWVyIiwicGFyc2UiLCJmbiIsIl9wYXJzZXIiLCJyZXNwb25zZVR5cGUiLCJ2YWx1ZSIsIl9yZXNwb25zZVR5cGUiLCJzZXJpYWxpemUiLCJfc2VyaWFsaXplciIsInRpbWVvdXQiLCJvcHRpb25zIiwiX3RpbWVvdXQiLCJfcmVzcG9uc2VUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXQiLCJvcHRpb24iLCJkZWFkbGluZSIsInJlc3BvbnNlIiwidXBsb2FkIiwiY29uc29sZSIsIndhcm4iLCJyZXRyeSIsImNvdW50IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiX21heFJldHJpZXMiLCJfcmV0cmllcyIsIl9yZXRyeUNhbGxiYWNrIiwiRVJST1JfQ09ERVMiLCJTZXQiLCJTVEFUVVNfQ09ERVMiLCJfc2hvdWxkUmV0cnkiLCJlcnIiLCJyZXMiLCJvdmVycmlkZSIsImVycl8iLCJlcnJvciIsInN0YXR1cyIsImhhcyIsImNvZGUiLCJjcm9zc0RvbWFpbiIsIl9yZXRyeSIsInJlcSIsInJlcXVlc3QiLCJfYWJvcnRlZCIsInRpbWVkb3V0IiwidGltZWRvdXRFcnJvciIsIl9lbmQiLCJ0aGVuIiwicmVzb2x2ZSIsInJlamVjdCIsIl9mdWxsZmlsbGVkUHJvbWlzZSIsInNlbGYiLCJfZW5kQ2FsbGVkIiwiUHJvbWlzZSIsIm9uIiwiRXJyb3IiLCJtZXRob2QiLCJ1cmwiLCJlbmQiLCJjYXRjaCIsImNiIiwidW5kZWZpbmVkIiwidXNlIiwib2siLCJfb2tDYWxsYmFjayIsIl9pc1Jlc3BvbnNlT0siLCJnZXQiLCJmaWVsZCIsIl9oZWFkZXIiLCJ0b0xvd2VyQ2FzZSIsImdldEhlYWRlciIsInNldCIsImhlYWRlciIsInVuc2V0IiwibmFtZSIsIl9kYXRhIiwiQXJyYXkiLCJpc0FycmF5IiwiaSIsIlN0cmluZyIsIl9nZXRGb3JtRGF0YSIsImFwcGVuZCIsImFib3J0IiwieGhyIiwiZW1pdCIsIl9hdXRoIiwidXNlciIsInBhc3MiLCJiYXNlNjRFbmNvZGVyIiwidHlwZSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfd2l0aENyZWRlbnRpYWxzIiwicmVkaXJlY3RzIiwibiIsIl9tYXhSZWRpcmVjdHMiLCJtYXhSZXNwb25zZVNpemUiLCJUeXBlRXJyb3IiLCJfbWF4UmVzcG9uc2VTaXplIiwidG9KU09OIiwiZGF0YSIsImhlYWRlcnMiLCJzZW5kIiwiaXNPYmplY3RfIiwiX2Zvcm1EYXRhIiwiX2lzSG9zdCIsInRyaW0iLCJzb3J0UXVlcnkiLCJzb3J0IiwiX3NvcnQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsInF1ZXJ5IiwiX3F1ZXJ5Iiwiam9pbiIsImluY2x1ZGVzIiwiaW5kZXgiLCJpbmRleE9mIiwicXVlcnlBcnJheSIsInNsaWNlIiwic3BsaXQiLCJfYXBwZW5kUXVlcnlTdHJpbmciLCJfdGltZW91dEVycm9yIiwicmVhc29uIiwiZXJybm8iLCJjYWxsYmFjayIsIl9zZXRUaW1lb3V0cyIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7O0FBR0EsSUFBTUEsUUFBUSxHQUFHQyxPQUFPLENBQUMsYUFBRCxDQUF4QjtBQUVBOzs7OztBQUlBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJDLFdBQWpCO0FBRUE7Ozs7OztBQU1BLFNBQVNBLFdBQVQsQ0FBcUJDLE1BQXJCLEVBQTZCO0FBQzNCLE1BQUlBLE1BQUosRUFBWSxPQUFPQyxLQUFLLENBQUNELE1BQUQsQ0FBWjtBQUNiO0FBRUQ7Ozs7Ozs7OztBQVFBLFNBQVNDLEtBQVQs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R0FBRyxDQUFDTyxJQUFKLEdBQVcsY0FBWDtBQUNBUCxFQUFBQSxHQUFHLENBQUM2RixLQUFKLEdBQVlBLEtBQVo7QUFDQSxPQUFLaEYsUUFBTCxHQUFnQixJQUFoQjtBQUNBLE9BQUtDLGFBQUwsR0FBcUJkLEdBQXJCO0FBQ0EsT0FBS21ELEtBQUw7QUFDQSxPQUFLMkMsUUFBTCxDQUFjOUYsR0FBZDtBQUNELENBYkQ7O0FBZUExQyxXQUFXLENBQUNJLFNBQVosQ0FBc0JxSSxZQUF0QixHQUFxQyxZQUFZO0FBQy9DLE1BQU0zRSxJQUFJLEdBQUcsSUFBYixDQUQrQyxDQUcvQzs7QUFDQSxNQUFJLEtBQUt4QyxRQUFMLElBQWlCLENBQUMsS0FBS2IsTUFBM0IsRUFBbUM7QUFDakMsU0FBS0EsTUFBTCxHQUFjaUksVUFBVSxDQUFDLFlBQU07QUFDN0I1RSxNQUFBQSxJQUFJLENBQUN1RSxhQUFMLENBQW1CLGFBQW5CLEVBQWtDdkUsSUFBSSxDQUFDeEMsUUFBdkMsRUFBaUQsT0FBakQ7QUFDRCxLQUZ1QixFQUVyQixLQUFLQSxRQUZnQixDQUF4QjtBQUdELEdBUjhDLENBVS9DOzs7QUFDQSxNQUFJLEtBQUtDLGdCQUFMLElBQXlCLENBQUMsS0FBS2IscUJBQW5DLEVBQTBEO0FBQ3hELFNBQUtBLHFCQUFMLEdBQTZCZ0ksVUFBVSxDQUFDLFlBQU07QUFDNUM1RSxNQUFBQSxJQUFJLENBQUN1RSxhQUFMLENBQ0Usc0JBREYsRUFFRXZFLElBQUksQ0FBQ3ZDLGdCQUZQLEVBR0UsV0FIRjtBQUtELEtBTnNDLEVBTXBDLEtBQUtBLGdCQU4rQixDQUF2QztBQU9EO0FBQ0YsQ0FwQkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBvZiBtaXhlZC1pbiBmdW5jdGlvbnMgc2hhcmVkIGJldHdlZW4gbm9kZSBhbmQgY2xpZW50IGNvZGVcbiAqL1xuY29uc3QgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzLW9iamVjdCcpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdEJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdEJhc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdEJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdEJhc2Uob2JqZWN0KSB7XG4gIGlmIChvYmplY3QpIHJldHVybiBtaXhpbihvYmplY3QpO1xufVxuXG4vKipcbiAqIE1peGluIHRoZSBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmplY3QpIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gUmVxdWVzdEJhc2UucHJvdG90eXBlKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChSZXF1ZXN0QmFzZS5wcm90b3R5cGUsIGtleSkpXG4gICAgICBvYmplY3Rba2V5XSA9IFJlcXVlc3RCYXNlLnByb3RvdHlwZVtrZXldO1xuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICBjbGVhclRpbWVvdXQodGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdXBsb2FkVGltZW91dFRpbWVyKTtcbiAgZGVsZXRlIHRoaXMuX3RpbWVyO1xuICBkZWxldGUgdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXI7XG4gIGRlbGV0ZSB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXI7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBkZWZhdWx0IHJlc3BvbnNlIGJvZHkgcGFyc2VyXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB0byBjb252ZXJ0IGluY29taW5nIGRhdGEgaW50byByZXF1ZXN0LmJvZHlcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgdGhpcy5fcGFyc2VyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgZm9ybWF0IG9mIGJpbmFyeSByZXNwb25zZSBib2R5LlxuICogSW4gYnJvd3NlciB2YWxpZCBmb3JtYXRzIGFyZSAnYmxvYicgYW5kICdhcnJheWJ1ZmZlcicsXG4gKiB3aGljaCByZXR1cm4gQmxvYiBhbmQgQXJyYXlCdWZmZXIsIHJlc3BlY3RpdmVseS5cbiAqXG4gKiBJbiBOb2RlIGFsbCB2YWx1ZXMgcmVzdWx0IGluIEJ1ZmZlci5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5yZXNwb25zZVR5cGUoJ2Jsb2InKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucmVzcG9uc2VUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHRoaXMuX3Jlc3BvbnNlVHlwZSA9IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgZGVmYXVsdCByZXF1ZXN0IGJvZHkgc2VyaWFsaXplclxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdG8gY29udmVydCBkYXRhIHNldCB2aWEgLnNlbmQgb3IgLmF0dGFjaCBpbnRvIHBheWxvYWQgdG8gc2VuZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZXJpYWxpemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgdGhpcy5fc2VyaWFsaXplciA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRpbWVvdXRzLlxuICpcbiAqIC0gcmVzcG9uc2UgdGltZW91dCBpcyB0aW1lIGJldHdlZW4gc2VuZGluZyByZXF1ZXN0IGFuZCByZWNlaXZpbmcgdGhlIGZpcnN0IGJ5dGUgb2YgdGhlIHJlc3BvbnNlLiBJbmNsdWRlcyBETlMgYW5kIGNvbm5lY3Rpb24gdGltZS5cbiAqIC0gZGVhZGxpbmUgaXMgdGhlIHRpbWUgZnJvbSBzdGFydCBvZiB0aGUgcmVxdWVzdCB0byByZWNlaXZpbmcgcmVzcG9uc2UgYm9keSBpbiBmdWxsLiBJZiB0aGUgZGVhZGxpbmUgaXMgdG9vIHNob3J0IGxhcmdlIGZpbGVzIG1heSBub3QgbG9hZCBhdCBhbGwgb24gc2xvdyBjb25uZWN0aW9ucy5cbiAqIC0gdXBsb2FkIGlzIHRoZSB0aW1lICBzaW5jZSBsYXN0IGJpdCBvZiBkYXRhIHdhcyBzZW50IG9yIHJlY2VpdmVkLiBUaGlzIHRpbWVvdXQgd29ya3Mgb25seSBpZiBkZWFkbGluZSB0aW1lb3V0IGlzIG9mZlxuICpcbiAqIFZhbHVlIG9mIDAgb3IgZmFsc2UgbWVhbnMgbm8gdGltZW91dC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IG1zIG9yIHtyZXNwb25zZSwgZGVhZGxpbmV9XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhpcy5fdGltZW91dCA9IG9wdGlvbnM7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gMDtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0ID0gMDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZvciAoY29uc3Qgb3B0aW9uIGluIG9wdGlvbnMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsIG9wdGlvbikpIHtcbiAgICAgIHN3aXRjaCAob3B0aW9uKSB7XG4gICAgICAgIGNhc2UgJ2RlYWRsaW5lJzpcbiAgICAgICAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucy5kZWFkbGluZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVzcG9uc2UnOlxuICAgICAgICAgIHRoaXMuX3Jlc3BvbnNlVGltZW91dCA9IG9wdGlvbnMucmVzcG9uc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwbG9hZCc6XG4gICAgICAgICAgdGhpcy5fdXBsb2FkVGltZW91dCA9IG9wdGlvbnMudXBsb2FkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biB0aW1lb3V0IG9wdGlvbicsIG9wdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBudW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgb24gZXJyb3IuXG4gKlxuICogRmFpbGVkIHJlcXVlc3RzIHdpbGwgYmUgcmV0cmllZCAnY291bnQnIHRpbWVzIGlmIHRpbWVvdXQgb3IgZXJyLmNvZGUgPj0gNTAwLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZXRyeSA9IGZ1bmN0aW9uIChjb3VudCwgZm4pIHtcbiAgLy8gRGVmYXVsdCB0byAxIGlmIG5vIGNvdW50IHBhc3NlZCBvciB0cnVlXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwIHx8IGNvdW50ID09PSB0cnVlKSBjb3VudCA9IDE7XG4gIGlmIChjb3VudCA8PSAwKSBjb3VudCA9IDA7XG4gIHRoaXMuX21heFJldHJpZXMgPSBjb3VudDtcbiAgdGhpcy5fcmV0cmllcyA9IDA7XG4gIHRoaXMuX3JldHJ5Q2FsbGJhY2sgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gTk9URTogd2UgZG8gbm90IGluY2x1ZGUgRVNPQ0tFVFRJTUVET1VUIGJlY2F1c2UgdGhhdCBpcyBmcm9tIGByZXF1ZXN0YCBwYWNrYWdlXG4vLyAgICAgICA8aHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9nb3QvcHVsbC81Mzc+XG4vL1xuLy8gTk9URTogd2UgZG8gbm90IGluY2x1ZGUgRUFERFJJTkZPIGJlY2F1c2UgaXQgd2FzIHJlbW92ZWQgZnJvbSBsaWJ1diBpbiAyMDE0XG4vLyAgICAgICA8aHR0cHM6Ly9naXRodWIuY29tL2xpYnV2L2xpYnV2L2NvbW1pdC8wMmUxZWJkNDBiODA3YmU1YWY0NjM0M2VhODczMzMxYjJlZTRlOWMxPlxuLy8gICAgICAgPGh0dHBzOi8vZ2l0aHViLmNvbS9yZXF1ZXN0L3JlcXVlc3Qvc2VhcmNoP3E9RVNPQ0tFVFRJTUVET1VUJnVuc2NvcGVkX3E9RVNPQ0tFVFRJTUVET1VUPlxuLy9cbi8vXG4vLyBUT0RPOiBleHBvc2UgdGhlc2UgYXMgY29uZmlndXJhYmxlIGRlZmF1bHRzXG4vL1xuY29uc3QgRVJST1JfQ09ERVMgPSBuZXcgU2V0KFtcbiAgJ0VUSU1FRE9VVCcsXG4gICdFQ09OTlJFU0VUJyxcbiAgJ0VBRERSSU5VU0UnLFxuICAnRUNPTk5SRUZVU0VEJyxcbiAgJ0VQSVBFJyxcbiAgJ0VOT1RGT1VORCcsXG4gICdFTkVUVU5SRUFDSCcsXG4gICdFQUlfQUdBSU4nXG5dKTtcblxuY29uc3QgU1RBVFVTX0NPREVTID0gbmV3IFNldChbXG4gIDQwOCxcbiAgNDEzLFxuICA0MjksXG4gIDUwMCxcbiAgNTAyLFxuICA1MDMsXG4gIDUwNCxcbiAgNTIxLFxuICA1MjIsXG4gIDUyNFxuXSk7XG5cbi8vIFRPRE86IHdlIHdvdWxkIG5lZWQgdG8gbWFrZSB0aGlzIGVhc2lseSBjb25maWd1cmFibGUgYmVmb3JlIGFkZGluZyBpdCBpbiAoZS5nLiBzb21lIG1pZ2h0IHdhbnQgdG8gYWRkIFBPU1QpXG4vLyBjb25zdCBNRVRIT0RTID0gbmV3IFNldChbJ0dFVCcsICdQVVQnLCAnSEVBRCcsICdERUxFVEUnLCAnT1BUSU9OUycsICdUUkFDRSddKTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSByZXF1ZXN0IHNob3VsZCBiZSByZXRyaWVkLlxuICogKEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvZ290I3JldHJ5KVxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciBhbiBlcnJvclxuICogQHBhcmFtIHtSZXNwb25zZX0gW3Jlc10gcmVzcG9uc2VcbiAqIEByZXR1cm5zIHtCb29sZWFufSBpZiBzZWdtZW50IHNob3VsZCBiZSByZXRyaWVkXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2hvdWxkUmV0cnkgPSBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgaWYgKCF0aGlzLl9tYXhSZXRyaWVzIHx8IHRoaXMuX3JldHJpZXMrKyA+PSB0aGlzLl9tYXhSZXRyaWVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuX3JldHJ5Q2FsbGJhY2spIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgb3ZlcnJpZGUgPSB0aGlzLl9yZXRyeUNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICAgIGlmIChvdmVycmlkZSA9PT0gdHJ1ZSkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAob3ZlcnJpZGUgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyB1bmRlZmluZWQgZmFsbHMgYmFjayB0byBkZWZhdWx0c1xuICAgIH0gY2F0Y2ggKGVycl8pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyXyk7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETzogd2Ugd291bGQgbmVlZCB0byBtYWtlIHRoaXMgZWFzaWx5IGNvbmZpZ3VyYWJsZSBiZWZvcmUgYWRkaW5nIGl0IGluIChlLmcuIHNvbWUgbWlnaHQgd2FudCB0byBhZGQgUE9TVClcbiAgLypcbiAgaWYgKFxuICAgIHRoaXMucmVxICYmXG4gICAgdGhpcy5yZXEubWV0aG9kICYmXG4gICAgIU1FVEhPRFMuaGFzKHRoaXMucmVxLm1ldGhvZC50b1VwcGVyQ2FzZSgpKVxuICApXG4gICAgcmV0dXJuIGZhbHNlO1xuICAqL1xuICBpZiAocmVzICYmIHJlcy5zdGF0dXMgJiYgU1RBVFVTX0NPREVTLmhhcyhyZXMuc3RhdHVzKSkgcmV0dXJuIHRydWU7XG4gIGlmIChlcnIpIHtcbiAgICBpZiAoZXJyLmNvZGUgJiYgRVJST1JfQ09ERVMuaGFzKGVyci5jb2RlKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU3VwZXJhZ2VudCB0aW1lb3V0XG4gICAgaWYgKGVyci50aW1lb3V0ICYmIGVyci5jb2RlID09PSAnRUNPTk5BQk9SVEVEJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKGVyci5jcm9zc0RvbWFpbikgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFJldHJ5IHJlcXVlc3RcbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fcmV0cnkgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cbiAgLy8gbm9kZVxuICBpZiAodGhpcy5yZXEpIHtcbiAgICB0aGlzLnJlcSA9IG51bGw7XG4gICAgdGhpcy5yZXEgPSB0aGlzLnJlcXVlc3QoKTtcbiAgfVxuXG4gIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTtcbiAgdGhpcy50aW1lZG91dCA9IGZhbHNlO1xuICB0aGlzLnRpbWVkb3V0RXJyb3IgPSBudWxsO1xuXG4gIHJldHVybiB0aGlzLl9lbmQoKTtcbn07XG5cbi8qKlxuICogUHJvbWlzZSBzdXBwb3J0XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3JlamVjdF1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gIGlmICghdGhpcy5fZnVsbGZpbGxlZFByb21pc2UpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAodGhpcy5fZW5kQ2FsbGVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdXYXJuaW5nOiBzdXBlcmFnZW50IHJlcXVlc3Qgd2FzIHNlbnQgdHdpY2UsIGJlY2F1c2UgYm90aCAuZW5kKCkgYW5kIC50aGVuKCkgd2VyZSBjYWxsZWQuIE5ldmVyIGNhbGwgLmVuZCgpIGlmIHlvdSB1c2UgcHJvbWlzZXMnXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5vbignYWJvcnQnLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9tYXhSZXRyaWVzICYmIHRoaXMuX21heFJldHJpZXMgPiB0aGlzLl9yZXRyaWVzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudGltZWRvdXQgJiYgdGhpcy50aW1lZG91dEVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KHRoaXMudGltZWRvdXRFcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdBYm9ydGVkJyk7XG4gICAgICAgIGVyci5jb2RlID0gJ0FCT1JURUQnO1xuICAgICAgICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gICAgICAgIGVyci5tZXRob2QgPSB0aGlzLm1ldGhvZDtcbiAgICAgICAgZXJyLnVybCA9IHRoaXMudXJsO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgICAgc2VsZi5lbmQoKGVyciwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJlamVjdChlcnIpO1xuICAgICAgICBlbHNlIHJlc29sdmUocmVzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5jYXRjaCA9IGZ1bmN0aW9uIChjYikge1xuICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgY2IpO1xufTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIChmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUub2sgPSBmdW5jdGlvbiAoY2IpIHtcbiAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayByZXF1aXJlZCcpO1xuICB0aGlzLl9va0NhbGxiYWNrID0gY2I7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9pc1Jlc3BvbnNlT0sgPSBmdW5jdGlvbiAocmVzKSB7XG4gIGlmICghcmVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHRoaXMuX29rQ2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5fb2tDYWxsYmFjayhyZXMpO1xuICB9XG5cbiAgcmV0dXJuIHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCAzMDA7XG59O1xuXG4vKipcbiAqIEdldCByZXF1ZXN0IGhlYWRlciBgZmllbGRgLlxuICogQ2FzZS1pbnNlbnNpdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqIFRoaXMgaXMgYSBkZXByZWNhdGVkIGludGVybmFsIEFQSS4gVXNlIGAuZ2V0KGZpZWxkKWAgaW5zdGVhZC5cbiAqXG4gKiAoZ2V0SGVhZGVyIGlzIG5vIGxvbmdlciB1c2VkIGludGVybmFsbHkgYnkgdGhlIHN1cGVyYWdlbnQgY29kZSBiYXNlKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKiBAZGVwcmVjYXRlZFxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXRIZWFkZXIgPSBSZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZmllbGQsIGtleSkpXG4gICAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWx1ZTtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZCBmaWVsZCBuYW1lXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3RcbiAqIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCh7IGZvbzogJ2JhcicsIGJhejogJ3F1eCcgfSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG5hbWUgbmFtZSBvZiBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfEJ1ZmZlcnxmcy5SZWFkU3RyZWFtfSB2YWwgdmFsdWUgb2YgZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gIC8vIG5hbWUgc2hvdWxkIGJlIGVpdGhlciBhIHN0cmluZyBvciBhbiBvYmplY3QuXG4gIGlmIChuYW1lID09PSBudWxsIHx8IHVuZGVmaW5lZCA9PT0gbmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignLmZpZWxkKG5hbWUsIHZhbCkgbmFtZSBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gIH1cblxuICBpZiAodGhpcy5fZGF0YSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiLmZpZWxkKCkgY2FuJ3QgYmUgdXNlZCBpZiAuc2VuZCgpIGlzIHVzZWQuIFBsZWFzZSB1c2Ugb25seSAuc2VuZCgpIG9yIG9ubHkgLmZpZWxkKCkgJiAuYXR0YWNoKClcIlxuICAgICk7XG4gIH1cblxuICBpZiAoaXNPYmplY3QobmFtZSkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBuYW1lKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5hbWUsIGtleSkpXG4gICAgICAgIHRoaXMuZmllbGQoa2V5LCBuYW1lW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgZm9yIChjb25zdCBpIGluIHZhbHVlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBpKSlcbiAgICAgICAgdGhpcy5maWVsZChuYW1lLCB2YWx1ZVtpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyB2YWwgc2hvdWxkIGJlIGRlZmluZWQgbm93XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB1bmRlZmluZWQgPT09IHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCcuZmllbGQobmFtZSwgdmFsKSB2YWwgY2FuIG5vdCBiZSBlbXB0eScpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICB9XG5cbiAgdGhpcy5fZ2V0Rm9ybURhdGEoKS5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSByZXF1ZXN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9hYm9ydGVkKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLl9hYm9ydGVkID0gdHJ1ZTtcbiAgaWYgKHRoaXMueGhyKSB0aGlzLnhoci5hYm9ydCgpOyAvLyBicm93c2VyXG4gIGlmICh0aGlzLnJlcSkgdGhpcy5yZXEuYWJvcnQoKTsgLy8gbm9kZVxuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9hdXRoID0gZnVuY3Rpb24gKHVzZXIsIHBhc3MsIG9wdGlvbnMsIGJhc2U2NEVuY29kZXIpIHtcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCYXNpYyAke2Jhc2U2NEVuY29kZXIoYCR7dXNlcn06JHtwYXNzfWApfWApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhdXRvJzpcbiAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VyO1xuICAgICAgdGhpcy5wYXNzd29yZCA9IHBhc3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JlYXJlcic6IC8vIHVzYWdlIHdvdWxkIGJlIC5hdXRoKGFjY2Vzc1Rva2VuLCB7IHR5cGU6ICdiZWFyZXInIH0pXG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyfWApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbiAob24pIHtcbiAgLy8gVGhpcyBpcyBicm93c2VyLW9ubHkgZnVuY3Rpb25hbGl0eS4gTm9kZSBzaWRlIGlzIG5vLW9wLlxuICBpZiAob24gPT09IHVuZGVmaW5lZCkgb24gPSB0cnVlO1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSBvbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgbWF4IHJlZGlyZWN0cyB0byBgbmAuIERvZXMgbm90aGluZyBpbiBicm93c2VyIFhIUiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZWRpcmVjdHMgPSBmdW5jdGlvbiAobikge1xuICB0aGlzLl9tYXhSZWRpcmVjdHMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWF4aW11bSBzaXplIG9mIGJ1ZmZlcmVkIHJlc3BvbnNlIGJvZHksIGluIGJ5dGVzLiBDb3VudHMgdW5jb21wcmVzc2VkIHNpemUuXG4gKiBEZWZhdWx0IDIwME1CLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuIG51bWJlciBvZiBieXRlc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5tYXhSZXNwb25zZVNpemUgPSBmdW5jdGlvbiAobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhcmd1bWVudCcpO1xuICB9XG5cbiAgdGhpcy5fbWF4UmVzcG9uc2VTaXplID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgdG8gYSBwbGFpbiBqYXZhc2NyaXB0IG9iamVjdCAobm90IEpTT04gc3RyaW5nKSBvZiBzY2FsYXIgcHJvcGVydGllcy5cbiAqIE5vdGUgYXMgdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gcmV0dXJuIGEgdXNlZnVsIG5vbi10aGlzIHZhbHVlLFxuICogaXQgY2Fubm90IGJlIGNoYWluZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBkZXNjcmliaW5nIG1ldGhvZCwgdXJsLCBhbmQgZGF0YSBvZiB0aGlzIHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBtZXRob2Q6IHRoaXMubWV0aG9kLFxuICAgIHVybDogdGhpcy51cmwsXG4gICAgZGF0YTogdGhpcy5fZGF0YSxcbiAgICBoZWFkZXJzOiB0aGlzLl9oZWFkZXJcbiAgfTtcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAgYXMgdGhlIHJlcXVlc3QgYm9keSwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9JylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc3QgaXNPYmplY3RfID0gaXNPYmplY3QoZGF0YSk7XG4gIGxldCB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcblxuICBpZiAodGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIi5zZW5kKCkgY2FuJ3QgYmUgdXNlZCBpZiAuYXR0YWNoKCkgb3IgLmZpZWxkKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdF8gJiYgIXRoaXMuX2RhdGEpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChkYXRhICYmIHRoaXMuX2RhdGEgJiYgdGhpcy5faXNIb3N0KHRoaXMuX2RhdGEpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgbWVyZ2UgdGhlc2Ugc2VuZCBjYWxsc1wiKTtcbiAgfVxuXG4gIC8vIG1lcmdlXG4gIGlmIChpc09iamVjdF8gJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkpXG4gICAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gZGVmYXVsdCB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGlmICh0eXBlKSB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICBpZiAodHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhID8gYCR7dGhpcy5fZGF0YX0mJHtkYXRhfWAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIWlzT2JqZWN0XyB8fCB0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGRlZmF1bHQgdG8ganNvblxuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU29ydCBgcXVlcnlzdHJpbmdgIGJ5IHRoZSBzb3J0IGZ1bmN0aW9uXG4gKlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIGRlZmF1bHQgb3JkZXJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvdXNlcicpXG4gKiAgICAgICAgIC5xdWVyeSgnbmFtZT1OaWNrJylcbiAqICAgICAgICAgLnF1ZXJ5KCdzZWFyY2g9TWFubnknKVxuICogICAgICAgICAuc29ydFF1ZXJ5KClcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBjdXN0b21pemVkIHNvcnQgZnVuY3Rpb25cbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvdXNlcicpXG4gKiAgICAgICAgIC5xdWVyeSgnbmFtZT1OaWNrJylcbiAqICAgICAgICAgLnF1ZXJ5KCdzZWFyY2g9TWFubnknKVxuICogICAgICAgICAuc29ydFF1ZXJ5KGZ1bmN0aW9uKGEsIGIpe1xuICogICAgICAgICAgIHJldHVybiBhLmxlbmd0aCAtIGIubGVuZ3RoO1xuICogICAgICAgICB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzb3J0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNvcnRRdWVyeSA9IGZ1bmN0aW9uIChzb3J0KSB7XG4gIC8vIF9zb3J0IGRlZmF1bHQgdG8gdHJ1ZSBidXQgb3RoZXJ3aXNlIGNhbiBiZSBhIGZ1bmN0aW9uIG9yIGJvb2xlYW5cbiAgdGhpcy5fc29ydCA9IHR5cGVvZiBzb3J0ID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBzb3J0O1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29tcG9zZSBxdWVyeXN0cmluZyB0byBhcHBlbmQgdG8gcmVxLnVybFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX2ZpbmFsaXplUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICBpZiAocXVlcnkpIHtcbiAgICB0aGlzLnVybCArPSAodGhpcy51cmwuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JykgKyBxdWVyeTtcbiAgfVxuXG4gIHRoaXMuX3F1ZXJ5Lmxlbmd0aCA9IDA7IC8vIE1ha2VzIHRoZSBjYWxsIGlkZW1wb3RlbnRcblxuICBpZiAodGhpcy5fc29ydCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy51cmwuaW5kZXhPZignPycpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBxdWVyeUFycmF5ID0gdGhpcy51cmwuc2xpY2UoaW5kZXggKyAxKS5zcGxpdCgnJicpO1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9zb3J0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHF1ZXJ5QXJyYXkuc29ydCh0aGlzLl9zb3J0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXJ5QXJyYXkuc29ydCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVybCA9IHRoaXMudXJsLnNsaWNlKDAsIGluZGV4KSArICc/JyArIHF1ZXJ5QXJyYXkuam9pbignJicpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRm9yIGJhY2t3YXJkcyBjb21wYXQgb25seVxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9hcHBlbmRRdWVyeVN0cmluZyA9ICgpID0+IHtcbiAgY29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCcpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fdGltZW91dEVycm9yID0gZnVuY3Rpb24gKHJlYXNvbiwgdGltZW91dCwgZXJybm8pIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoYCR7cmVhc29uICsgdGltZW91dH1tcyBleGNlZWRlZGApO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIGVyci5jb2RlID0gJ0VDT05OQUJPUlRFRCc7XG4gIGVyci5lcnJubyA9IGVycm5vO1xuICB0aGlzLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgdGhpcy50aW1lZG91dEVycm9yID0gZXJyO1xuICB0aGlzLmFib3J0KCk7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2V0VGltZW91dHMgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gIC8vIGRlYWRsaW5lXG4gIGlmICh0aGlzLl90aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZWxmLl90aW1lb3V0RXJyb3IoJ1RpbWVvdXQgb2YgJywgc2VsZi5fdGltZW91dCwgJ0VUSU1FJyk7XG4gICAgfSwgdGhpcy5fdGltZW91dCk7XG4gIH1cblxuICAvLyByZXNwb25zZSB0aW1lb3V0XG4gIGlmICh0aGlzLl9yZXNwb25zZVRpbWVvdXQgJiYgIXRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKSB7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1Jlc3BvbnNlIHRpbWVvdXQgb2YgJyxcbiAgICAgICAgc2VsZi5fcmVzcG9uc2VUaW1lb3V0LFxuICAgICAgICAnRVRJTUVET1VUJ1xuICAgICAgKTtcbiAgICB9LCB0aGlzLl9yZXNwb25zZVRpbWVvdXQpO1xuICB9XG59O1xuIl19

/***/ }),

/***/ 97:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/**
 * Module dependencies.
 */
var utils = __webpack_require__(506);
/**
 * Expose `ResponseBase`.
 */


module.exports = ResponseBase;
/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(ResponseBase.prototype, key)) obj[key] = ResponseBase.prototype[key];
  }

  return obj;
}
/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


ResponseBase.prototype.get = function (field) {
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


ResponseBase.prototype._setHeaderProperties = function (header) {
  // TODO: moar!
  // TODO: make this a util
  // content-type
  var ct = header['content-type'] || '';
  this.type = utils.type(ct); // params

  var params = utils.params(ct);

  for (var key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) this[key] = params[key];
  }

  this.links = {}; // links

  try {
    if (header.link) {
      this.links = utils.parseLinks(header.link);
    }
  } catch (_unused) {// ignore
  }
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


ResponseBase.prototype._setStatusProperties = function (status) {
  var type = status / 100 | 0; // status / class

  this.statusCode = status;
  this.status = this.statusCode;
  this.statusType = type; // basics

  this.info = type === 1;
  this.ok = type === 2;
  this.redirect = type === 3;
  this.clientError = type === 4;
  this.serverError = type === 5;
  this.error = type === 4 || type === 5 ? this.toError() : false; // sugar

  this.created = status === 201;
  this.accepted = status === 202;
  this.noContent = status === 204;
  this.badRequest = status === 400;
  this.unauthorized = status === 401;
  this.notAcceptable = status === 406;
  this.forbidden = status === 403;
  this.notFound = status === 404;
  this.unprocessableEntity = status === 422;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNwb25zZS1iYXNlLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJSZXNwb25zZUJhc2UiLCJvYmoiLCJtaXhpbiIsImtleSIsInByb3RvdHlwZSIsIk9iamVjdCIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImdldCIsImZpZWxkIiwiaGVhZGVyIiwidG9Mb3dlckNhc2UiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsImN0IiwidHlwZSIsInBhcmFtcyIsImxpbmtzIiwibGluayIsInBhcnNlTGlua3MiLCJfc2V0U3RhdHVzUHJvcGVydGllcyIsInN0YXR1cyIsInN0YXR1c0NvZGUiLCJzdGF0dXNUeXBlIiwiaW5mbyIsIm9rIiwicmVkaXJlY3QiLCJjbGllbnRFcnJvciIsInNlcnZlckVycm9yIiwiZXJyb3IiLCJ0b0Vycm9yIiwiY3JlYXRlZCIsImFjY2VwdGVkIiwibm9Db250ZW50IiwiYmFkUmVxdWVzdCIsInVuYXV0aG9yaXplZCIsIm5vdEFjY2VwdGFibGUiLCJmb3JiaWRkZW4iLCJub3RGb3VuZCIsInVucHJvY2Vzc2FibGVFbnRpdHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7OztBQUlBLElBQU1BLEtBQUssR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBckI7QUFFQTs7Ozs7QUFJQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCQyxZQUFqQjtBQUVBOzs7Ozs7QUFNQSxTQUFTQSxZQUFULENBQXNCQyxHQUF0QixFQUEyQjtBQUN6QixNQUFJQSxHQUFKLEVBQVMsT0FBT0MsS0FBSyxDQUFDRCxHQUFELENBQVo7QUFDVjtBQUVEOzs7Ozs7Ozs7QUFRQSxTQUFTQyxLQUFULENBQWVELEdBQWYsRUFBb0I7QUFDbEIsT0FBSyxJQUFNRSxHQUFYLElBQWtCSCxZQUFZLENBQUNJLFNBQS9CLEVBQTBDO0FBQ3hDLFFBQUlDLE1BQU0sQ0FBQ0QsU0FBUCxDQUFpQkUsY0FBakIsQ0FBZ0NDLElBQWhDLENBQXFDUCxZQUFZLENBQUNJLFNBQWxELEVBQTZERCxHQUE3RCxDQUFKLEVBQ0VGLEdBQUcsQ0FBQ0UsR0FBRCxDQUFILEdBQVdILFlBQVksQ0FBQ0ksU0FBYixDQUF1QkQsR0FBdkIsQ0FBWDtBQUNIOztBQUVELFNBQU9GLEdBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7QUFRQUQsWUFBWSxDQUFDSSxTQUFiLENBQXVCSSxHQUF2QixHQUE2QixVQUFVQyxLQUFWLEVBQWlCO0FBQzVDLFNBQU8sS0FBS0MsTUFBTCxDQUFZRCxLQUFLLENBQUNFLFdBQU4sRUFBWixDQUFQO0FBQ0QsQ0FGRDtBQUlBOzs7Ozs7Ozs7Ozs7O0FBWUFYLFlBQVksQ0FBQ0ksU0FBYixDQUF1QlEsb0JBQXZCLEdBQThDLFVBQVVGLE1BQVYsRUFBa0I7QUFDOUQ7QUFDQTtBQUVBO0FBQ0EsTUFBTUcsRUFBRSxHQUFHSCxNQUFNLENBQUMsY0FBRCxDQUFOLElBQTBCLEVBQXJDO0FBQ0EsT0FBS0ksSUFBTCxHQUFZbEIsS0FBSyxDQUFDa0IsSUFBTixDQUFXRCxFQUFYLENBQVosQ0FOOEQsQ0FROUQ7O0FBQ0EsTUFBTUUsTUFBTSxHQUFHbkIsS0FBSyxDQUFDbUIsTUFBTixDQUFhRixFQUFiLENBQWY7O0FBQ0EsT0FBSyxJQUFNVixHQUFYLElBQWtCWSxNQUFsQixFQUEwQjtBQUN4QixRQUFJVixNQUFNLENBQUNELFNBQVAsQ0FBaUJFLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQ1EsTUFBckMsRUFBNkNaLEdBQTdDLENBQUosRUFDRSxLQUFLQSxHQUFMLElBQVlZLE1BQU0sQ0FBQ1osR0FBRCxDQUFsQjtBQUNIOztBQUVELE9BQUthLEtBQUwsR0FBYSxFQUFiLENBZjhELENBaUI5RDs7QUFDQSxNQUFJO0FBQ0YsUUFBSU4sTUFBTSxDQUFDTyxJQUFYLEVBQWlCO0FBQ2YsV0FBS0QsS0FBTCxHQUFhcEIsS0FBSyxDQUFDc0IsVUFBTixDQUFpQlIsTUFBTSxDQUFDTyxJQUF4QixDQUFiO0FBQ0Q7QUFDRixHQUpELENBSUUsZ0JBQU0sQ0FDTjtBQUNEO0FBQ0YsQ0F6QkQ7QUEyQkE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQkFqQixZQUFZLENBQUNJLFNBQWIsQ0FBdUJlLG9CQUF2QixHQUE4QyxVQUFVQyxNQUFWLEVBQWtCO0FBQzlELE1BQU1OLElBQUksR0FBSU0sTUFBTSxHQUFHLEdBQVYsR0FBaUIsQ0FBOUIsQ0FEOEQsQ0FHOUQ7O0FBQ0EsT0FBS0MsVUFBTCxHQUFrQkQsTUFBbEI7QUFDQSxPQUFLQSxNQUFMLEdBQWMsS0FBS0MsVUFBbkI7QUFDQSxPQUFLQyxVQUFMLEdBQWtCUixJQUFsQixDQU44RCxDQVE5RDs7QUFDQSxPQUFLUyxJQUFMLEdBQVlULElBQUksS0FBSyxDQUFyQjtBQUNBLE9BQUtVLEVBQUwsR0FBVVYsSUFBSSxLQUFLLENBQW5CO0FBQ0EsT0FBS1csUUFBTCxHQUFnQlgsSUFBSSxLQUFLLENBQXpCO0FBQ0EsT0FBS1ksV0FBTCxHQUFtQlosSUFBSSxLQUFLLENBQTVCO0FBQ0EsT0FBS2EsV0FBTCxHQUFtQmIsSUFBSSxLQUFLLENBQTVCO0FBQ0EsT0FBS2MsS0FBTCxHQUFhZCxJQUFJLEtBQUssQ0FBVCxJQUFjQSxJQUFJLEtBQUssQ0FBdkIsR0FBMkIsS0FBS2UsT0FBTCxFQUEzQixHQUE0QyxLQUF6RCxDQWQ4RCxDQWdCOUQ7O0FBQ0EsT0FBS0MsT0FBTCxHQUFlVixNQUFNLEtBQUssR0FBMUI7QUFDQSxPQUFLVyxRQUFMLEdBQWdCWCxNQUFNLEtBQUssR0FBM0I7QUFDQSxPQUFLWSxTQUFMLEdBQWlCWixNQUFNLEtBQUssR0FBNUI7QUFDQSxPQUFLYSxVQUFMLEdBQWtCYixNQUFNLEtBQUssR0FBN0I7QUFDQSxPQUFLYyxZQUFMLEdBQW9CZCxNQUFNLEtBQUssR0FBL0I7QUFDQSxPQUFLZSxhQUFMLEdBQXFCZixNQUFNLEtBQUssR0FBaEM7QUFDQSxPQUFLZ0IsU0FBTCxHQUFpQmhCLE1BQU0sS0FBSyxHQUE1QjtBQUNBLE9BQUtpQixRQUFMLEdBQWdCakIsTUFBTSxLQUFLLEdBQTNCO0FBQ0EsT0FBS2tCLG1CQUFMLEdBQTJCbEIsTUFBTSxLQUFLLEdBQXRDO0FBQ0QsQ0ExQkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZUJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzcG9uc2VCYXNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlQmFzZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZUJhc2Uob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufVxuXG4vKipcbiAqIE1peGluIHRoZSBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gUmVzcG9uc2VCYXNlLnByb3RvdHlwZSkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoUmVzcG9uc2VCYXNlLnByb3RvdHlwZSwga2V5KSlcbiAgICAgIG9ialtrZXldID0gUmVzcG9uc2VCYXNlLnByb3RvdHlwZVtrZXldO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2VCYXNlLnByb3RvdHlwZS5fc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uIChoZWFkZXIpIHtcbiAgLy8gVE9ETzogbW9hciFcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGEgdXRpbFxuXG4gIC8vIGNvbnRlbnQtdHlwZVxuICBjb25zdCBjdCA9IGhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHV0aWxzLnR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICBjb25zdCBwYXJhbXMgPSB1dGlscy5wYXJhbXMoY3QpO1xuICBmb3IgKGNvbnN0IGtleSBpbiBwYXJhbXMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmFtcywga2V5KSlcbiAgICAgIHRoaXNba2V5XSA9IHBhcmFtc1trZXldO1xuICB9XG5cbiAgdGhpcy5saW5rcyA9IHt9O1xuXG4gIC8vIGxpbmtzXG4gIHRyeSB7XG4gICAgaWYgKGhlYWRlci5saW5rKSB7XG4gICAgICB0aGlzLmxpbmtzID0gdXRpbHMucGFyc2VMaW5rcyhoZWFkZXIubGluayk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBpZ25vcmVcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLl9zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKHN0YXR1cykge1xuICBjb25zdCB0eXBlID0gKHN0YXR1cyAvIDEwMCkgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzQ29kZSA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLnN0YXR1c0NvZGU7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IHR5cGUgPT09IDE7XG4gIHRoaXMub2sgPSB0eXBlID09PSAyO1xuICB0aGlzLnJlZGlyZWN0ID0gdHlwZSA9PT0gMztcbiAgdGhpcy5jbGllbnRFcnJvciA9IHR5cGUgPT09IDQ7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSB0eXBlID09PSA1O1xuICB0aGlzLmVycm9yID0gdHlwZSA9PT0gNCB8fCB0eXBlID09PSA1ID8gdGhpcy50b0Vycm9yKCkgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmNyZWF0ZWQgPSBzdGF0dXMgPT09IDIwMTtcbiAgdGhpcy5hY2NlcHRlZCA9IHN0YXR1cyA9PT0gMjAyO1xuICB0aGlzLm5vQ29udGVudCA9IHN0YXR1cyA9PT0gMjA0O1xuICB0aGlzLmJhZFJlcXVlc3QgPSBzdGF0dXMgPT09IDQwMDtcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSBzdGF0dXMgPT09IDQwMTtcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gc3RhdHVzID09PSA0MDY7XG4gIHRoaXMuZm9yYmlkZGVuID0gc3RhdHVzID09PSA0MDM7XG4gIHRoaXMubm90Rm91bmQgPSBzdGF0dXMgPT09IDQwNDtcbiAgdGhpcy51bnByb2Nlc3NhYmxlRW50aXR5ID0gc3RhdHVzID09PSA0MjI7XG59O1xuIl19

/***/ }),

/***/ 506:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = function (str) {
  return str.split(/ *; */).shift();
};
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.params = function (val) {
  var obj = {};

  var _iterator = _createForOfIteratorHelper(val.split(/ *; */)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var str = _step.value;
      var parts = str.split(/ *= */);
      var key = parts.shift();

      var _val = parts.shift();

      if (key && _val) obj[key] = _val;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return obj;
};
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.parseLinks = function (val) {
  var obj = {};

  var _iterator2 = _createForOfIteratorHelper(val.split(/ *, */)),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var str = _step2.value;
      var parts = str.split(/ *; */);
      var url = parts[0].slice(1, -1);
      var rel = parts[1].split(/ *= */)[1].slice(1, -1);
      obj[rel] = url;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return obj;
};
/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */


exports.cleanHeader = function (header, changesOrigin) {
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header.host; // secuirty

  if (changesOrigin) {
    delete header.authorization;
    delete header.cookie;
  }

  return header;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJleHBvcnRzIiwidHlwZSIsInN0ciIsInNwbGl0Iiwic2hpZnQiLCJwYXJhbXMiLCJ2YWwiLCJvYmoiLCJwYXJ0cyIsImtleSIsInBhcnNlTGlua3MiLCJ1cmwiLCJzbGljZSIsInJlbCIsImNsZWFuSGVhZGVyIiwiaGVhZGVyIiwiY2hhbmdlc09yaWdpbiIsImhvc3QiLCJhdXRob3JpemF0aW9uIiwiY29va2llIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7O0FBUUFBLE9BQU8sQ0FBQ0MsSUFBUixHQUFlLFVBQUNDLEdBQUQ7QUFBQSxTQUFTQSxHQUFHLENBQUNDLEtBQUosQ0FBVSxPQUFWLEVBQW1CQyxLQUFuQixFQUFUO0FBQUEsQ0FBZjtBQUVBOzs7Ozs7Ozs7QUFRQUosT0FBTyxDQUFDSyxNQUFSLEdBQWlCLFVBQUNDLEdBQUQsRUFBUztBQUN4QixNQUFNQyxHQUFHLEdBQUcsRUFBWjs7QUFEd0IsNkNBRU5ELEdBQUcsQ0FBQ0gsS0FBSixDQUFVLE9BQVYsQ0FGTTtBQUFBOztBQUFBO0FBRXhCLHdEQUFzQztBQUFBLFVBQTNCRCxHQUEyQjtBQUNwQyxVQUFNTSxLQUFLLEdBQUdOLEdBQUcsQ0FBQ0MsS0FBSixDQUFVLE9BQVYsQ0FBZDtBQUNBLFVBQU1NLEdBQUcsR0FBR0QsS0FBSyxDQUFDSixLQUFOLEVBQVo7O0FBQ0EsVUFBTUUsSUFBRyxHQUFHRSxLQUFLLENBQUNKLEtBQU4sRUFBWjs7QUFFQSxVQUFJSyxHQUFHLElBQUlILElBQVgsRUFBZ0JDLEdBQUcsQ0FBQ0UsR0FBRCxDQUFILEdBQVdILElBQVg7QUFDakI7QUFSdUI7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFVeEIsU0FBT0MsR0FBUDtBQUNELENBWEQ7QUFhQTs7Ozs7Ozs7O0FBUUFQLE9BQU8sQ0FBQ1UsVUFBUixHQUFxQixVQUFDSixHQUFELEVBQVM7QUFDNUIsTUFBTUMsR0FBRyxHQUFHLEVBQVo7O0FBRDRCLDhDQUVWRCxHQUFHLENBQUNILEtBQUosQ0FBVSxPQUFWLENBRlU7QUFBQTs7QUFBQTtBQUU1QiwyREFBc0M7QUFBQSxVQUEzQkQsR0FBMkI7QUFDcEMsVUFBTU0sS0FBSyxHQUFHTixHQUFHLENBQUNDLEtBQUosQ0FBVSxPQUFWLENBQWQ7QUFDQSxVQUFNUSxHQUFHLEdBQUdILEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBU0ksS0FBVCxDQUFlLENBQWYsRUFBa0IsQ0FBQyxDQUFuQixDQUFaO0FBQ0EsVUFBTUMsR0FBRyxHQUFHTCxLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNMLEtBQVQsQ0FBZSxPQUFmLEVBQXdCLENBQXhCLEVBQTJCUyxLQUEzQixDQUFpQyxDQUFqQyxFQUFvQyxDQUFDLENBQXJDLENBQVo7QUFDQUwsTUFBQUEsR0FBRyxDQUFDTSxHQUFELENBQUgsR0FBV0YsR0FBWDtBQUNEO0FBUDJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBUzVCLFNBQU9KLEdBQVA7QUFDRCxDQVZEO0FBWUE7Ozs7Ozs7OztBQVFBUCxPQUFPLENBQUNjLFdBQVIsR0FBc0IsVUFBQ0MsTUFBRCxFQUFTQyxhQUFULEVBQTJCO0FBQy9DLFNBQU9ELE1BQU0sQ0FBQyxjQUFELENBQWI7QUFDQSxTQUFPQSxNQUFNLENBQUMsZ0JBQUQsQ0FBYjtBQUNBLFNBQU9BLE1BQU0sQ0FBQyxtQkFBRCxDQUFiO0FBQ0EsU0FBT0EsTUFBTSxDQUFDRSxJQUFkLENBSitDLENBSy9DOztBQUNBLE1BQUlELGFBQUosRUFBbUI7QUFDakIsV0FBT0QsTUFBTSxDQUFDRyxhQUFkO0FBQ0EsV0FBT0gsTUFBTSxDQUFDSSxNQUFkO0FBQ0Q7O0FBRUQsU0FBT0osTUFBUDtBQUNELENBWkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy50eXBlID0gKHN0cikgPT4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucGFyYW1zID0gKHZhbCkgPT4ge1xuICBjb25zdCBvYmogPSB7fTtcbiAgZm9yIChjb25zdCBzdHIgb2YgdmFsLnNwbGl0KC8gKjsgKi8pKSB7XG4gICAgY29uc3QgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLyk7XG4gICAgY29uc3Qga2V5ID0gcGFydHMuc2hpZnQoKTtcbiAgICBjb25zdCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogUGFyc2UgTGluayBoZWFkZXIgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucGFyc2VMaW5rcyA9ICh2YWwpID0+IHtcbiAgY29uc3Qgb2JqID0ge307XG4gIGZvciAoY29uc3Qgc3RyIG9mIHZhbC5zcGxpdCgvICosICovKSkge1xuICAgIGNvbnN0IHBhcnRzID0gc3RyLnNwbGl0KC8gKjsgKi8pO1xuICAgIGNvbnN0IHVybCA9IHBhcnRzWzBdLnNsaWNlKDEsIC0xKTtcbiAgICBjb25zdCByZWwgPSBwYXJ0c1sxXS5zcGxpdCgvICo9ICovKVsxXS5zbGljZSgxLCAtMSk7XG4gICAgb2JqW3JlbF0gPSB1cmw7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiBTdHJpcCBjb250ZW50IHJlbGF0ZWQgZmllbGRzIGZyb20gYGhlYWRlcmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQHJldHVybiB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuY2xlYW5IZWFkZXIgPSAoaGVhZGVyLCBjaGFuZ2VzT3JpZ2luKSA9PiB7XG4gIGRlbGV0ZSBoZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICBkZWxldGUgaGVhZGVyWydjb250ZW50LWxlbmd0aCddO1xuICBkZWxldGUgaGVhZGVyWyd0cmFuc2Zlci1lbmNvZGluZyddO1xuICBkZWxldGUgaGVhZGVyLmhvc3Q7XG4gIC8vIHNlY3VpcnR5XG4gIGlmIChjaGFuZ2VzT3JpZ2luKSB7XG4gICAgZGVsZXRlIGhlYWRlci5hdXRob3JpemF0aW9uO1xuICAgIGRlbGV0ZSBoZWFkZXIuY29va2llO1xuICB9XG5cbiAgcmV0dXJuIGhlYWRlcjtcbn07XG4iXX0=

/***/ }),

/***/ 358:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Ajax = void 0;
var superagent = __webpack_require__(569);
var error_1 = __webpack_require__(719);
var objectAssign = __webpack_require__(418);
var Ajax = /** @class */ (function () {
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

/***/ 728:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getService = exports.AppPot = void 0;
var config_1 = __webpack_require__(705);
var auth_info_1 = __webpack_require__(279);
var ajax_1 = __webpack_require__(358);
var local_authenticator_1 = __webpack_require__(603);
var database_1 = __webpack_require__(693);
var model_1 = __webpack_require__(901);
var device_1 = __webpack_require__(103);
var user_1 = __webpack_require__(458);
var group_1 = __webpack_require__(116);
var file_1 = __webpack_require__(85);
var gateway_1 = __webpack_require__(328);
var types_1 = __webpack_require__(607);
var error_1 = __webpack_require__(719);
var AppPot = /** @class */ (function () {
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
        return 1605593169 || 0;
    };
    AppPot.prototype.getVersion = function () {
        return ["2","3","33"].join('.') || "unknown";
    };
    AppPot.prototype.log = function (str, level) {
        var _this = this;
        if (level === void 0) { level = 'MONITOR'; }
        if (!this._authInfo.hasToken()) {
            return Promise.reject('not logined');
        }
        return new Promise(function (resolve, reject) {
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
            return Promise.reject('not logined');
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
        return new Promise(function (resolve, reject) {
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
            return Promise.reject('not logined');
        }
        if (!(mailTo instanceof Array) ||
            !(mailCc instanceof Array) ||
            !(mailBcc instanceof Array)) {
            return Promise.reject('mailTo, mailCc, mailBcc must be array');
        }
        if (mailTo.length == 0 && mailCc.length == 0 && mailBcc.length == 0) {
            return Promise.reject('destination address is not specified');
        }
        return new Promise(function (resolve, reject) {
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

/***/ 279:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthInfo = void 0;
var objectAssign = __webpack_require__(418);
var AuthInfo = /** @class */ (function () {
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

/***/ 705:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
var Config = /** @class */ (function () {
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "timeout", {
        get: function () {
            return this.props.timeout || 10000;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "url", {
        get: function () {
            return this.props.url;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "appId", {
        get: function () {
            return this.props.appId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "appKey", {
        get: function () {
            return this.props.appKey;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "appVersion", {
        get: function () {
            return this.props.appVersion;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "deviceUDID", {
        get: function () {
            return this.props.deviceUDID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "companyId", {
        get: function () {
            return this.props.companyId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "groupId", {
        get: function () {
            return this.props.groupId;
        },
        enumerable: false,
        configurable: true
    });
    return Config;
}());
exports.Config = Config;


/***/ }),

/***/ 693:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Database = void 0;
var types_1 = __webpack_require__(607);
var ajax_1 = __webpack_require__(358);
var error_1 = __webpack_require__(719);
var Database = /** @class */ (function () {
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
            "CREATE TABLE IF NOT EXISTS " + name + " ( " + columns.join(',') + " );",
            "CREATE TABLE IF NOT EXISTS apppot_" + name + "_queue ( `type` TEXT, `id` TEXT PRIMARY KEY, `serverUpdateTime` TEXT);"
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
                return Promise.reject(e);
            }
        }
        if (errors.length != 0) {
            return Promise.reject(new error_1.Error(-1, errors.join('\n')));
        }
        var request = {
            appId: appPot.getConfig().appId,
            appVersion: appPot.getConfig().appVersion,
            isResetDatabase: reset,
            companyId: appPot.getConfig().companyId,
            tables: tables
        };
        return new Promise(function (resolve, reject) {
            appPot.getAjax().post('schemas')
                .send(request)
                .end(ajax_1.Ajax.end(resolve, reject));
        });
    };
    return Database;
}());
exports.Database = Database;


/***/ }),

/***/ 103:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Device = /** @class */ (function () {
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Device.prototype, "token", {
        get: function () {
            return this._columns['token'];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Device.prototype, "name", {
        get: function () {
            return this._columns['name'];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Device.prototype, "osType", {
        get: function () {
            return this._columns['osType'];
        },
        enumerable: false,
        configurable: true
    });
    return Device;
}());
exports.default = Device;


/***/ }),

/***/ 719:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Error = void 0;
var Error = /** @class */ (function () {
    function Error(code, description) {
        this._code = code;
        this._description = description;
    }
    Object.defineProperty(Error.prototype, "code", {
        get: function () {
            return this._code;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Error.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: false,
        configurable: true
    });
    return Error;
}());
exports.Error = Error;


/***/ }),

/***/ 85:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFileClass = void 0;
var ajax_1 = __webpack_require__(358);
function getFileClass(appPot) {
    return /** @class */ (function () {
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(File.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        File.create = function (filename, content, progress) {
            var prog = progress ? progress : function () { };
            var entity = JSON.stringify({ name: filename });
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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

/***/ 328:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getGateway = void 0;
var objectAssign = __webpack_require__(418);
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
    return new Promise(function (resolve, reject) {
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
var Gateway = /** @class */ (function () {
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


/***/ }),

/***/ 116:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getGroupClass = void 0;
var ajax_1 = __webpack_require__(358);
function getGroupClass(appPot) {
    return /** @class */ (function () {
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "groupName", {
            get: function () {
                return this._columns.groupName;
            },
            set: function (val) {
                this._columns.groupName = val;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Group.prototype, "description", {
            get: function () {
                return this._columns.description;
            },
            set: function (val) {
                this._columns.description = val;
            },
            enumerable: false,
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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

/***/ 603:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalAuthenticator = void 0;
var ajax_1 = __webpack_require__(358);
var objectAssign = __webpack_require__(418);
var LocalAuthenticator = /** @class */ (function () {
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
            return new Promise(function (resolve, reject) {
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
        return new Promise(function (resolve, reject) {
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
        return new Promise(function (resolve, reject) {
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
        return new Promise(function (resolve, reject) {
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

/***/ 901:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Model = void 0;
var types_1 = __webpack_require__(607);
var ajax_1 = __webpack_require__(358);
var error_1 = __webpack_require__(719);
var database_1 = __webpack_require__(693);
var sqlite_clause_translator_1 = __webpack_require__(620);
var objectAssign = __webpack_require__(418);
var Model;
(function (Model) {
    var Expression = /** @class */ (function () {
        function Expression() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
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
    var ScopeType;
    (function (ScopeType) {
        ScopeType[ScopeType["User"] = 1] = "User";
        ScopeType[ScopeType["Group"] = 2] = "Group";
        ScopeType[ScopeType["All"] = 3] = "All";
    })(ScopeType = Model.ScopeType || (Model.ScopeType = {}));
    var JoinType;
    (function (JoinType) {
        JoinType[JoinType["LeftInner"] = 1] = "LeftInner";
        JoinType[JoinType["LeftOuter"] = 2] = "LeftOuter";
        JoinType[JoinType["RightOuter"] = 3] = "RightOuter";
        JoinType[JoinType["Inner"] = 4] = "Inner";
    })(JoinType = Model.JoinType || (Model.JoinType = {}));
    var Order;
    (function (Order) {
        Order[Order["asc"] = 0] = "asc";
        Order[Order["desc"] = 1] = "desc";
    })(Order = Model.Order || (Model.Order = {}));
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
        var _a;
        Object.keys(modelColumns).forEach(function (key) {
            if (modelMethods.indexOf(key) != -1) {
                throw new error_1.Error(-1, 'Invalid column name: ' + key);
            }
        });
        var defaultScope = +ScopeType.Group;
        classList[_className] = (_a = /** @class */ (function () {
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
                    return new Promise(function (resolve, reject) {
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
                                    var query = "INSERT INTO " + sqlite_clause_translator_1.default.getQueueTableName(_className) + " ( `type`, `id`, `serverUpdateTime` ) VALUES ( ?, ?, ? )";
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
                            return Promise.reject('not found');
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
                    return new Promise(func);
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
                        args[_i] = arguments[_i];
                    }
                    this.set.apply(this, args);
                    if (!this.isNew()) {
                        return Promise.reject(new error_1.Error(-1, 'object is created'));
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
                        args[_i] = arguments[_i];
                    }
                    this.set.apply(this, args);
                    if (!this.isNew()) {
                        return Promise.reject(new error_1.Error(-1, 'object is created'));
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
                    return new Promise(func);
                };
                ModelClass.prototype.insert = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
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
                        args[_i] = arguments[_i];
                    }
                    if (this.isNew()) {
                        return Promise.reject(new error_1.Error(-1, 'object is not created'));
                    }
                    this.set.apply(this, args);
                    var columns = classList[_className].formatColumns(this._columns, false);
                    var queryObj = (new sqlite_clause_translator_1.default()).translateUpdate(_className, columns['objectId'], columns);
                    return new Promise(function (resolve, reject) {
                        var db = appPot.getLocalDatabase();
                        db.transaction(function (tx) {
                            tx.executeSql(queryObj.query, queryObj.params, function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var query = "INSERT OR IGNORE INTO " + sqlite_clause_translator_1.default.getQueueTableName(_className) + " ( `type`, `id`, `serverUpdateTime` ) VALUES ( ?, ?, ? )";
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
                        args[_i] = arguments[_i];
                    }
                    if (this.isNew()) {
                        return Promise.reject(new error_1.Error(-1, 'object is not created'));
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
                    return new Promise(func);
                };
                ModelClass.prototype.update = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
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
                        args[_i] = arguments[_i];
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
                        args[_i] = arguments[_i];
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
                        args[_i] = arguments[_i];
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
                    return new Promise(function (resolve, reject) {
                        var db = appPot.getLocalDatabase();
                        db.transaction(function (tx) {
                            var queryObj = (new sqlite_clause_translator_1.default()).translateDelete(_className, _this.get('objectId'));
                            tx.executeSql(queryObj.query, queryObj.params);
                            var query = "SELECT type FROM " + sqlite_clause_translator_1.default.getQueueTableName(_className) + " WHERE id = ?";
                            var params = [_this.get('objectId')];
                            tx.executeSql(query, params, function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                var query = "INSERT OR REPLACE INTO " + sqlite_clause_translator_1.default.getQueueTableName(_className) + " ( `type`, `id`, `serverUpdateTime` ) VALUES ( ?, ?, ? )";
                                var params = ['deleted', _this.get('objectId'), _this.get('serverUpdateTime')];
                                if (args[1].rows.length > 0 && args[1].rows.item(0).type == 'created') {
                                    query = "DELETE FROM " + sqlite_clause_translator_1.default.getQueueTableName(_className) + " WHERE id = ?";
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
                    return new Promise(func);
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
                    return new Promise(function (resolve, reject) {
                        var num = null;
                        var db = appPot.getLocalDatabase();
                        db.transaction(function (tx) {
                            tx.executeSql('SELECT * FROM ' + sqlite_clause_translator_1.default.getQueueTableName(_className), [], function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
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
                    return new Promise(function (resolve, reject) {
                        var returnObj = {
                            created: [],
                            updated: [],
                            deleted: []
                        };
                        var db = appPot.getLocalDatabase();
                        db.transaction(function (tx) {
                            tx.executeSql('SELECT * FROM ' + sqlite_clause_translator_1.default.getQueueTableName(_className), [], function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
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
                        return Promise.all([
                            classList[_className]._selectLocal()
                                .valuesIn('objectId', obj['created'].map(function (o) { return o['objectId']; }))
                                .findList(),
                            classList[_className]._selectLocal()
                                .valuesIn('objectId', obj['updated'].map(function (o) { return o['objectId']; }))
                                .findList(),
                            Promise.resolve(obj['deleted'])
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
                    return new Promise(function (resolve, reject) {
                        var db = appPot.getLocalDatabase();
                        db.transaction(function (tx) {
                            var query = 'DELETE FROM ' + sqlite_clause_translator_1.default.getQueueTableName(_className) + ' WHERE type = ?';
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
                        return Promise.all(queueList['updated'].map(function (model) {
                            return model.update()
                                .catch(function (err) {
                                console.log(err);
                                //if(err.code == 130){
                                conflicted['update'].push(model);
                                //}
                                //return Promise.reject(err);
                                return Promise.resolve();
                            });
                        }));
                    }).then(function () {
                        return classList[_className].clearQueue('updated');
                    }).then(function () {
                        return Promise.all(queueList['deleted'].map(function (obj) {
                            return new Promise(function (resolve, reject) {
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
                                return Promise.resolve();
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
                        return Promise.reject(err);
                    });
                };
                ModelClass._debug = function () {
                    var returnArray = [];
                    return new Promise(function (resolve, reject) {
                        var db = appPot.getLocalDatabase();
                        db.transaction(function (tx) {
                            tx.executeSql('SELECT * FROM ' + _className, [], function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                for (var i = 0; i < args[1].rows.length; i++) {
                                    returnArray.push(args[1].rows.item(i));
                                }
                                tx.executeSql('SELECT * FROM ' + sqlite_clause_translator_1.default.getQueueTableName(_className), [], function () {
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
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
                        args[_i] = arguments[_i];
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
                    return new Promise(function (resolve, reject) {
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
                return ModelClass;
            }()),
            _a.className = _className,
            _a.modelColumns = modelColumns,
            _a.noNeedColumns = [
                'groupIds',
            ],
            _a);
        return classList[_className];
    }
    Model.define = define;
    var Query = /** @class */ (function () {
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
            var exp = this.normalizeExpression(__spreadArrays([
                query
            ], values));
            this.setWhereExpression(exp);
            return this;
        };
        Query.prototype.where = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
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
                args[_i] = arguments[_i];
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
                args[_i] = arguments[_i];
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
                    else { //指定したaliasでなく、classNameがkey名だった場合
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
            return (new Promise(function (resolve, reject) {
                var queryObj = (new sqlite_clause_translator_1.default()).translateSelect(_this._queryObj, _this._keyClassMap, classList);
                if (!_this._localDB) {
                    reject('Local Database is undefined');
                }
                var returnArray = [];
                _this._localDB.transaction(function (tx) {
                    tx.executeSql(queryObj.query, queryObj.params, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
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
            return new Promise(func);
        };
        return Query;
    }());
    var QueryLimited = /** @class */ (function (_super) {
        __extends(QueryLimited, _super);
        function QueryLimited() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        QueryLimited.prototype.findOne = function () {
            return Promise.reject("Cannot use \"findOne\" method to downlink. Please use \"execute\" method.");
        };
        QueryLimited.prototype.findList = function () {
            return Promise.reject("Cannot use \"findList\" method to downlink. Please use \"execute\" method.");
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
                    tx.executeSql("DELETE FROM " + sqlite_clause_translator_1.default.getQueueTableName(className));
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
                return new Promise(promiseFunc(results));
            });
        };
        return QueryLimited;
    }(Query));
})(Model = exports.Model || (exports.Model = {}));


/***/ }),

/***/ 620:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var SqliteClauseTranslator = /** @class */ (function () {
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
exports.default = SqliteClauseTranslator;


/***/ }),

/***/ 607:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataType = void 0;
var DataType;
(function (DataType) {
    DataType[DataType["Varchar"] = 0] = "Varchar";
    DataType[DataType["Integer"] = 1] = "Integer";
    DataType[DataType["Long"] = 2] = "Long";
    DataType[DataType["Bool"] = 3] = "Bool";
    DataType[DataType["DateTime"] = 4] = "DateTime";
    DataType[DataType["Double"] = 5] = "Double";
})(DataType = exports.DataType || (exports.DataType = {}));


/***/ }),

/***/ 458:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsRoles = exports.Role = exports.getUserClass = void 0;
var ajax_1 = __webpack_require__(358);
function getUserClass(appPot) {
    return /** @class */ (function () {
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
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(User.prototype, "firstName", {
            get: function () {
                return this._columns.firstName;
            },
            set: function (value) {
                this._columns.firstName = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(User.prototype, "lastName", {
            get: function () {
                return this._columns.lastName;
            },
            set: function (value) {
                this._columns.lastName = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(User.prototype, "userId", {
            get: function () {
                return this._columns.userId;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(User.prototype, "password", {
            get: function () {
                return this._columns.password;
            },
            set: function (value) {
                this._columns.password = value;
            },
            enumerable: false,
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
            enumerable: false,
            configurable: true
        });
        User._isNumber = function (x) {
            if (typeof (x) === 'number') {
                return Number.isInteger(x);
            }
            else if (typeof (x) === 'string') {
                return Number.isInteger(Number.parseInt(x));
            }
            return false;
        };
        User.findById = function (userId, options) {
            if (!this._isNumber(userId)) {
                return Promise.reject('userId is not a number');
            }
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
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
            return new Promise(function (resolve, reject) {
                appPot.getAjax().remove("users/" + userId, options)
                    .query({ token: appPot.getAuthInfo().getToken() })
                    .end(ajax_1.Ajax.end(resolve, reject));
            });
        };
        return User;
    }());
}
exports.getUserClass = getUserClass;
var Role;
(function (Role) {
    Role[Role["SuperAdmin"] = 2] = "SuperAdmin";
    Role[Role["Admin"] = 3] = "Admin";
    Role[Role["Manager"] = 4] = "Manager";
    Role[Role["User"] = 5] = "User";
})(Role = exports.Role || (exports.Role = {}));
var GroupsRoles = /** @class */ (function () {
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GroupsRoles.prototype, "groupName", {
        get: function () {
            return this._groupName;
        },
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GroupsRoles.prototype, "description", {
        get: function () {
            return this._description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GroupsRoles.prototype, "roleName", {
        get: function () {
            return this._roleName;
        },
        enumerable: false,
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(728);
/******/ })()
;
});