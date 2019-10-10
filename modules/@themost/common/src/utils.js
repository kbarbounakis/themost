/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {sprintf} from "sprintf";

const IS_NODE = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
const UUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const HEX_CHARS = 'abcdef1234567890';
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const DATE_TIME_REGEX = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/g;
const BOOLEAN_TRUE_REGEX = /^true$/ig;
const BOOLEAN_FALSE_REGEX = /^false$/ig;
const NULL_REGEX = /^null$/ig;
const UNDEFINED_REGEX = /^undefined$/ig;
const INT_REGEX =/^[-+]?\d+$/g;
const FLOAT_REGEX =/^[+-]?\d+(\.\d+)?$/g;
const GUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4
};

export class UnknownPropertyDescriptor {
    constructor(obj, name) {
        Object.defineProperty(this, 'value', { 
            configurable:false, 
            enumerable:true, 
            get: function() { 
                    return obj[name]; 
                }, 
            set: function(value) { 
                    obj[name]=value; 
                }
        });
        Object.defineProperty(this, 'name', { 
            configurable:false, 
            enumerable:true, 
            get: function() { 
                return name; 
                } 
        });
    }
}

/**
 * @class
 * @constructor
 */
export class LangUtils {
    /**
     * Inherit the prototype methods from one constructor into another.
     * @param {Function} ctor
     * @param {Function|*} superCtor
     * @deprecated This method has been deprecated and it will be removed in next version
     * @example
    function Animal() {
        //
    }

    function Dog() {
        Dog.super_.bind(this)();
    }
    LangUtils.inherits(Dog,Animal);
     */
    static inherits(ctor, superCtor) {

        if (typeof superCtor !== "function" && superCtor !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superCtor);
        }

        //if process is running under node js
        if (IS_NODE) {
            const utilModule = "util";
            const util = require(utilModule);
            //call util.inherits() function
            return util.inherits(ctor, superCtor);
        }

        ctor.prototype = Object.create(superCtor && superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superCtor) {
            /**
             * @function setPrototypeOf
             * @param {*} obj
             * @param {*} prototype
             * @memberOf Object
             * @static
             */
            if (typeof Object.setPrototypeOf === 'function') {
                Object.setPrototypeOf(ctor, superCtor)
            }
            else {
                ctor.__proto__ = superCtor
            }
        }
        //node.js As an additional convenience, superConstructor will be accessible through the constructor.super_ property.
        ctor.super_ = ctor.__proto__;
    }

    /**
     * Returns an array of strings which represents the arguments' names of the given function
     * @param {Function} fn
     * @returns {Array}
     */
    static getFunctionParams(fn) {
        if (typeof fn === 'function')
            return [];
        const fnStr = fn.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        if(result === null)
            result = [];
        return result;
    }

    /**
     * @param {string} value
     */
    static convert(value) {
        let result;
        if ((typeof value === 'string'))
        {
            if (value.length===0) {
                result = value
            }
            if (value.match(BOOLEAN_TRUE_REGEX)) {
                result = true;
            }
            else if (value.match(BOOLEAN_FALSE_REGEX)) {
                result = false;
            }
            else if (value.match(NULL_REGEX) || value.match(UNDEFINED_REGEX)) {
                result = null;
            }
            else if (value.match(INT_REGEX)) {
                result = parseInt(value);
            }
            else if (value.match(FLOAT_REGEX)) {
                result = parseFloat(value);
            }
            else if (value.match(DATE_TIME_REGEX)) {
                result = new Date(Date.parse(value));
            }
            else {
                result = value;
            }
        }
        else {
            result = value;
        }
        return result;
    }

    /**
     *
     * @param {*} origin
     * @param {string} expr
     * @param {string} value
     * @param {*=} options
     * @returns {*}
     */
    static extend(origin, expr, value, options) {

        options = options || { convertValues:false };
        //find base notation
        let match = /(^\w+)\[/.exec(expr), name, descriptor, expr1;
        if (match) {
            //get property name
            name = match[1];
            //validate array property
            if (/^\d+$/g.test(name)) {
                //property is an array
                if (!Array.isArray(origin.value))
                    origin.value = [];
                // get new expression
                expr1 = expr.substr(match.index + match[1].length);
                LangUtils.extend(origin, expr1, value, options);
            }
            else {
                //set property value (unknown)
                origin[name] = origin[name] || new LangUtils();
                descriptor = new UnknownPropertyDescriptor(origin, name);
                // get new expression
                expr1 = expr.substr(match.index + match[1].length);
                LangUtils.extend(descriptor, expr1, value, options);
            }
        }
        else if (expr.indexOf('[')===0) {
            //get property
            const re = /\[(.*?)\]/g;
            match = re.exec(expr);
            if (match) {
                name = match[1];
                // get new expression
                expr1 = expr.substr(match.index + match[0].length);
                if (/^\d+$/g.test(name)) {
                    //property is an array
                    if (!Array.isArray(origin.value))
                        origin.value = [];
                }
                if (expr1.length===0) {
                    if (origin.value instanceof LangUtils) {
                        origin.value = {};
                    }
                    let typedValue;
                    //convert string value
                    if ((typeof value === 'string') && options.convertValues) {
                        typedValue = LangUtils.convert(value);
                    }
                    else {
                        typedValue = value;
                    }
                    if (Array.isArray(origin.value))
                        origin.value.push(typedValue);
                    else
                        origin.value[name] = typedValue;
                }
                else {
                    if (origin.value instanceof LangUtils) {
                        origin.value = { };
                    }
                    origin.value[name] = origin.value[name] || new LangUtils();
                    descriptor = new UnknownPropertyDescriptor(origin.value, name);
                    LangUtils.extend(descriptor, expr1, value, options);
                }
            }
            else {
                throw new Error('Invalid object property notation. Expected [name]');
            }
        }
        else if (/^\w+$/.test(expr)) {
            if (options.convertValues)
                origin[expr] = LangUtils.convert(value);
            else
                origin[expr] = value;
        }
        else {
            throw new Error('Invalid object property notation. Expected property[name] or [name]');
        }
        return origin;
    }

    /**
     *
     * @param {*} form
     * @param {*=} options
     * @returns {*}
     */
    static parseForm(form, options) {
        const result = {};
        if (typeof form === 'undefined' || form===null)
            return result;
        const keys = Object.keys(form);
        keys.forEach(key => {
            if (form.hasOwnProperty(key))
            {
                LangUtils.extend(result, key, form[key], options)
            }
        });
        return result;
    }

    /**
     * Parses any value or string and returns the resulted object.
     * @param {*} any
     * @returns {*}
     */
    static parseValue(any) {
        return LangUtils.convert(any);
    }

    /**
     * Parses any value and returns the equivalent integer.
     * @param {*} any
     * @returns {*}
     */
    static parseInt(any) {
        return parseInt(any) || 0;
    }

    /**
     * Parses any value and returns the equivalent float number.
     * @param {*} any
     * @returns {*}
     */
    static parseFloat(any) {
        return parseFloat(any) || 0;
    }

    /**
     * Parses any value and returns the equivalent boolean.
     * @param {*} any
     * @returns {*}
     */
    static parseBoolean(any) {
        if (typeof any === 'undefined' || any === null)
            return false;
        else if (typeof any === 'number')
            return any !== 0;
        else if (typeof any === 'string') {
            if (any.match(INT_REGEX) || any.match(FLOAT_REGEX)) {
                return parseInt(any, 10) !== 0;
            }
            else if (any.match(BOOLEAN_TRUE_REGEX))
                return true;
            else if (any.match(BOOLEAN_FALSE_REGEX))
                return false;
            else if (/^yes$|^on$|^y$|^valid$/i.test(any))
                return true;
            else if (/^no$|^off$|^n$|^invalid$/i.test(any))
                return false;
            else
                return false;
        }
        else if (typeof any === 'boolean')
            return any;
        else {
            return (parseInt(any) || 0) !== 0;
        }
    }

    /**
     * @static
     * Checks if the given value is a valid date
     * @param {*} value
     * @returns {boolean}
     */
    static isDate(value) {
        if (value instanceof Date) {
            return true;
        }
        return DATE_TIME_REGEX.test(value);
    }
}

/**
 * @function captureStackTrace
 * @memberOf Error
 * @param {Error} thisArg
 * @param {string} name
 * @static
 */

/**
 * @class
 * @constructor
 */
export class Args {
    /**
     * Checks the expression and throws an exception if the condition is not met.
     * @param {*} expr
     * @param {string|Error} err
     */
    static check(expr, err) {
        Args.notNull(expr,"Expression");
        let res;
        if (typeof expr === 'function') {
            res = !(expr.call());
        }
        else {
            res = (!expr);
        }
        if (res) {
            if (err instanceof Error) {
                throw err;
            }
            throw new ArgumentError(err, "ECHECK");
        }
    }

    /**
     *
     * @param {*} arg
     * @param {string} name
     */
    static notNull(arg, name) {
        if (typeof arg === 'undefined' || arg === null) {
            throw new ArgumentError(name + " may not be null or undefined", "ENULL");
        }
    }

    /**
     * @param {*} arg
     * @param {string} name
     */
    static notString(arg, name) {
        if (typeof arg !== 'string') {
            throw new ArgumentError(name + " must be a string", "EARG");
        }
    }

    /**
     * @param {*} arg
     * @param {string} name
     */
    static notFunction(arg, name) {
        if (typeof arg !== 'function') {
            throw new ArgumentError(name + " must be a function", "EARG");
        }
    }

    /**
     * @param {*} arg
     * @param {string} name
     */
    static notNumber(arg, name) {
        if ((typeof arg !== 'number') || isNaN(arg)) {
            throw new ArgumentError(name + " must be number", "EARG");
        }
    }

    /**
     * @param {string|*} arg
     * @param {string} name
     */
    static notEmpty(arg, name) {
        Args.notNull(arg,name);
        if ((Object.prototype.toString.bind(arg)() === '[object Array]') && (arg.length === 0)) {
            throw new ArgumentError(name + " may not be empty","EEMPTY");
        }
        else if ((typeof arg === 'string') && (arg.length===0)) {
            throw new ArgumentError(name + " may not be empty","EEMPTY");
        }
    }

    /**
     * @param {number|*} arg
     * @param {string} name
     */
    static notNegative(arg, name) {
        Args.notNumber(arg,name);
        if (arg<0) {
            throw new ArgumentError(name + " may not be negative", "ENEG");
        }
    }

    /**
     * @param {number|*} arg
     * @param {string} name
     */
    static notPositive(arg, name) {
        Args.notNumber(arg,name);
        if (arg<=0) {
            throw new ArgumentError(name + " may not be negative or zero", "EPOS");
        }
    }
}

/**
 * @class
 * @constructor
 */
export class TextUtils {
    /**
     * Converts the given parameter to MD5 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    static toMD5(value) {

        if (typeof value === 'undefined' || value === null) {
            return;
        }
        //browser implementation
        let md5, md5module;
        if (typeof window !== 'undefined') {
            md5module = 'blueimp-md5';
            md5 = require(md5module);
            if (typeof value === 'string') {
                return md5(value);
            }
            else if (value instanceof Date) {
                return md5(value.toUTCString());
            }
            else {
                return md5(JSON.stringify(value));
            }
        }
        //node.js implementation
        md5module = 'crypto';
        const crypto = require(md5module);
        md5 = crypto.createHash('md5');
        if (typeof value === 'string') {
            md5.update(value);
        }
        else if (value instanceof Date) {
            md5.update(value.toUTCString());
        }
        else {
            md5.update(JSON.stringify(value));
        }
        return md5.digest('hex');
    }

    /**
     * Converts the given parameter to SHA1 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    static toSHA1(value) {

        const cryptoModule = 'crypto';
        if (typeof window !== 'undefined') {
            throw new Error('This method is not implemented for this environment')
        }

        const crypto = require(cryptoModule);
        if (typeof value === 'undefined' || value === null) {
            return;
        }
        const sha1 = crypto.createHash('sha1');
        if (typeof value === 'string') {
            sha1.update(value);
        }
        else if (value instanceof Date) {
            sha1.update(value.toUTCString());
        }
        else {
            sha1.update(JSON.stringify(value));
        }
        return sha1.digest('hex');
    }

    /**
     * Converts the given parameter to SHA256 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    static toSHA256(value) {

        const cryptoModule = 'crypto';
        if (typeof window !== 'undefined') {
            throw new Error('This method is not implemented for this environment')
        }

        const crypto = require(cryptoModule);
        if (typeof value === 'undefined' || value === null) {
            return;
        }
        const sha256 = crypto.createHash('sha256');
        if (typeof value === 'string') {
            sha256.update(value);
        }
        else if (value instanceof Date) {
            sha256.update(value.toUTCString());
        }
        else {
            sha256.update(JSON.stringify(value));
        }
        return sha256.digest('hex');
    }

    /**
     * Returns a random GUID/UUID string
     * @static
     * @returns {string}
     */
    static newUUID() {
        const chars = UUID_CHARS;
        const uuid = [];
        // rfc4122, version 4 form
        let r = void 0;
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
        uuid[14] = "4";

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (let i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[i === 19 ? r & 0x3 | 0x8 : r];
            }
        }
        return uuid.join("");
    }
}

/**
 * @class
 * @param {*} options
 * @constructor
 */
export class TraceLogger {
    constructor(options) {
        this.options = {
            colors:false,
            level:"info"
        };
        if (typeof options === "undefined" && options !== null && IS_NODE) {
            if (IS_NODE && process.env.NODE_ENV === "development") {
                this.options.level = "debug";
            }
        }
        if (typeof options !== "undefined" && options !== null ) {
            this.options = options;
            //validate logging level
            Args.check(LOG_LEVELS.hasOwnProperty(this.options.level), "Invalid logging level. Expected error, warn, info, verbose or debug.");
        }
    }

    /**
     * @param {string} level
     * @returns {*}
     */
    level(level) {
        Args.check(LOG_LEVELS.hasOwnProperty(level), "Invalid logging level. Expected error, warn, info, verbose or debug.");
        this.options.level = level;
        return this;
    }

    /**
     * @param {...*} data
     */
    // eslint-disable-next-line no-unused-vars
    log(data) {
        const args = Array.prototype.slice.call(arguments);
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        if (data instanceof Error) {
            return writeError.bind(this)("info",data);
        }
        if (typeof data !== 'string') {
            return this.write("info", data.toString());
        }
        if (args.length>1) {
            return this.write("info", sprintf.apply(null, args));
        }
        this.write("info", data);
    }

    /**
     * @param {...*} data
     */
    // eslint-disable-next-line no-unused-vars
    info(data) {
        const args = Array.prototype.slice.call(arguments);
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        if (data instanceof Error) {
            return writeError.bind(this)("info",data);
        }
        if (typeof data !== 'string') {
            return this.write("info", data.toString());
        }
        if (args.length>1) {
            return this.write("info", sprintf.apply(null, args));
        }
        this.write("info", data);
    }

    /**
     * @param {...*} data
     */
    // eslint-disable-next-line no-unused-vars
    error(data) {
        const args = Array.prototype.slice.call(arguments);
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        if (data instanceof Error) {
            return writeError.bind(this)("error",data);
        }
        if (typeof data !== 'string') {
            return this.write("error", data.toString());
        }
        if (args.length>1) {
            return this.write("error", sprintf.apply(null, args));
        }
        this.write("error", data);
    }

    /**
     * @param {...*} data
     */
    // eslint-disable-next-line no-unused-vars
    warn(data) {
        const args = Array.prototype.slice.call(arguments);
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        if (data instanceof Error) {
            return writeError.bind(this)("warn",data);
        }
        if (typeof data !== 'string') {
            return this.write("warn", data.toString());
        }
        if (args.length>1) {
            return this.write("warn", sprintf.apply(null, args));
        }
        this.write("warn", data);
    }

    /**
     * @param {...*} data
     */
    // eslint-disable-next-line no-unused-vars
    verbose(data) {
        const args = Array.prototype.slice.call(arguments);
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        if (data instanceof Error) {
            return writeError.bind(this)("verbose",data);
        }
        if (typeof data !== 'string') {
            return this.write("verbose", data.toString());
        }
        if (args.length>1) {
            return this.write("verbose", sprintf.apply(null, args));
        }
        this.write("verbose", data);
    }

    /**
     * @param {...*} data
     */
    // eslint-disable-next-line no-unused-vars
    debug(data) {
        const args = Array.prototype.slice.call(arguments);
        if (typeof data === 'undefined' || data === null) {
            return;
        }
        if (data instanceof Error) {
            return writeError.bind(this)("debug",data);
        }
        if (typeof data !== 'string') {
            return this.write("debug", data.toString());
        }
        if (args.length>1) {
            return this.write("debug", sprintf.apply(null, args));
        }
        this.write("debug", data);

    }

    write(level, text) {
        if (LOG_LEVELS[level]>LOG_LEVELS[this.options.level]) {
            return;
        }
        // eslint-disable-next-line no-console
        console.log(timestamp() + " [" + level.toUpperCase() + "] " + text);
    }
}

/**
 * @class
 * @constructor
 */
export class TraceUtils {
    static useLogger(logger) {
        TraceUtils._logger = logger;
    }

    static level(level) {
        TraceUtils._logger.level(level);
    }

    /**
     * @static
     * @param {...*} _data
     */
    // eslint-disable-next-line no-unused-vars
    static log(_data) {
        TraceUtils._logger.log.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
    }

    /**
     * @static
     * @param {...*} _data
     */
    // eslint-disable-next-line no-unused-vars
    static error(_data) {
        TraceUtils._logger.error.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
    }

    /**
     *
     * @static
     * @param {...*} _data
     */
    // eslint-disable-next-line no-unused-vars
    static info(_data) {
        TraceUtils._logger.info.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
    }

    /**
     *
     * @static
     * @param {*} _data
     */
    // eslint-disable-next-line no-unused-vars
    static warn(_data) {
        TraceUtils._logger.warn.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
    }

    /**
     *
     * @static
     * @param {*} _data
     */
    // eslint-disable-next-line no-unused-vars
    static verbose(_data) {
        TraceUtils._logger.verbose.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
    }

    /**
     *
     * @static
     * @param {...*} _data
     */
    // eslint-disable-next-line no-unused-vars
    static debug(_data) {
        TraceUtils._logger.debug.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
    }
}
Object.defineProperty(TraceUtils, '_logger', {
    enumerable: false,
    configurable: false,
    value: new TraceLogger()
});


/**
 * @class
 * @constructor
 */
export class RandomUtils {
    /**
     * Returns a random string based on the length specified
     * @param {Number} length
     */
    static randomChars(length) {
        length = length || 8;
        const chars = "abcdefghkmnopqursuvwxz2456789ABCDEFHJKLMNPQURSTUVWXYZ";
        let str = "";
        for(let i = 0; i < length; i++) {
            str += chars.substr(this.randomInt(0, chars.length-1),1);
        }
        return str;
    }

    /**
     * Returns a random integer between a minimum and a maximum value
     * @param {number} min
     * @param {number} max
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Returns a random string based on the length specified
     * @static
     * @param {number} length
     * @returns {string}
     */
    static randomHex(length) {
        length = (length || 8)*2;
        let str = "";
        for(let i = 0; i < length; i++) {
            str += HEX_CHARS.substr(this.randomInt(0, HEX_CHARS.length-1),1);
        }
        return str;
    }
}

/**
 * @class
 * @constructor
 */
export class NumberUtils {
    /**
     * Converts a base-26 formatted string to the equivalent integer
     * @static
     * @param {string} s A base-26 formatted string e.g. aaaaaaaa for 0, baaaaaaa for 1 etc
     * @return {number} The equivalent integer value
     */
    static fromBase26(s) {
        let num = 0;
        if (!/[a-z]{8}/.test(s)) {
            throw new Error('Invalid base-26 format.');
        }
        const a = 'a'.charCodeAt(0);
        for (let i = 7; i >=0; i--) {
            num = (num * 26) + (s[i].charCodeAt(0) - a);
        }
        return num;
    }

    /**
     * Converts an integer to the equivalent base-26 formatted string
     * @static
     * @param {number} x The integer to be converted
     * @return {string} The equivalent string value
     */
    static toBase26(x) {
        //noinspection ES6ConvertVarToLetConst
        var num = parseInt(x);
        if (num<0) {
            throw new Error('A non-positive integer cannot be converted to base-26 format.');
        }
        if (num>208827064575) {
            throw new Error('A positive integer bigger than 208827064575 cannot be converted to base-26 format.');
        }
        let out = "";
        let length = 1;
        const a = 'a'.charCodeAt(0);
        while(length<=8)
        {
            out += String.fromCharCode(a + (num % 26));
            num = Math.floor(num / 26);
            length += 1;
        }
        return out;
    }
}

/**
 * @class
 * @constructor
 */
export class PathUtils {
    /**
     *
     * @param {...string} _part
     * @returns {string}
     */
    // eslint-disable-next-line no-unused-vars
    static join(_part) {
        const pathModule = "path";
        if (IS_NODE) {
            const path = require(pathModule);
            return path.join.apply(null, Array.prototype.slice.call(arguments));
        }
        // Split the inputs into a list of path commands.
        let parts = [], i, l;
        for (i = 0, l = arguments.length; i < l; i++) {
            parts = parts.concat(arguments[i].split("/"));
        }
    // Interpret the path commands to get the new resolved path.
        const newParts = [];
        for (i = 0, l = parts.length; i < l; i++) {
            const part1 = parts[i];
            // Remove leading and trailing slashes
            // Also remove "." segments
            if (!part1 || part1 === ".") continue;
            // Interpret ".." to pop the last segment
            if (part1 === "..") newParts.pop();
            // Push new path segments.
            else newParts.push(part1);
        }
    // Preserve the initial slash if there was one.
        if (parts[0] === "") newParts.unshift("");
    // Turn back into a single string path.
        return newParts.join("/") || (newParts.length ? "/" : ".");
    }
}

/**
 * @private
 * @returns {string}
 */
function timestamp() {
    return (new Date()).toUTCString();
}

/**
 * @private
 * @this TraceLogger
 * @param level
 * @param err
 */
function writeError(level, err) {

    const keys = Object.keys(err).filter(x => {
        return err.hasOwnProperty(x) && x !== 'message' && typeof err[x] !== 'undefined' && err[x] != null;
    });
    if (err instanceof Error) {
        if (err.hasOwnProperty('stack')) {
            this.write(level, err.stack);
        }
        else {
            this.write(level, err.toString());
        }
    }
    else {
        this.write(level, err.toString());
    }
    if (keys.length>0) {
        this.write(level, "Error: " + keys.map( x => {
            return "[" + x + "]=" + err[x].toString()
        }).join(', '));
    }
}


/**
 * @param {number} value
 * @constructor
 */
export class Base26Number {

    constructor(value) {
        const thisValue = value;
        this.toString = () => {
            return Base26Number.toBase26(thisValue);
        }
    }

    /**
     *
     * @param {number} x
     * @returns {string}
     */
    static toBase26(x) {
        let num = Math.floor(x | 0);
        if (num<0) {
            throw new Error("A non-positive integer cannot be converted to base-26 format.");
        }
        if (num>208827064575) {
            throw new Error("A positive integer bigger than 208827064575 cannot be converted to base-26 format.");
        }
        let out = "";
        let length = 1;
        const a = "a".charCodeAt(0);
        while(length<=8) {
            out += String.fromCharCode(a + (num % 26));
            num = Math.floor(num / 26);
            length += 1;
        }
        return out;
    }

    /**
     *
     * @param {string} s
     * @returns {number}
     */
    static fromBase26(s) {
        let num = 0;
        if (!/[a-z]{8}/.test(s)) {
            throw new Error("Invalid base-26 format.");
        }
        const a = "a".charCodeAt(0);
        for (let i = 7; i >=0; i--) {
            num = (num * 26) + (s[i].charCodeAt(0) - a);
        }
        return num;
    }
}

/**
 * @class
 * @param {string=} value
 * @constructor
 */
export class Guid {
    constructor(value) {
        let _value;
        if (typeof value === "string") {
            // format value
            _value = value.replace(/^{/,"").replace(/{$/,"");
            // and validate
            Args.check(GUID_REGEX.test(_value),"Value must be a valid UUID");
        }
        else {
            // generate a new guid string
            _value = TextUtils.newUUID();
        }
        // define property
        Object.defineProperty(this, '_value', {
                enumerable: false,
                configurable: true,
                value: _value
            });
    }

    toJSON() {
        return this._value;
    }

    valueOf() {
        return this._value;
    }

    toString() {
        return this._value;
    }

    equals(b) {
        if (b instanceof Guid) {
            return this._value.toLowerCase() === b._value.toLowerCase();
        }
        if (typeof b === 'string') {
            return this._value.toLowerCase() === b.toLowerCase();
        }
        return this._value === b;
    }

    /**
     * @param {string|*} s
     * @returns {boolean}
     */
    static isGuid(s) {
        if (s instanceof Guid) {
            return true;
        }
        if (typeof s !== "string") {
            return false;
        }
        return GUID_REGEX.test(s);
    }

    /**
     * @returns {Guid}
     */
    static newGuid() {
        return new Guid();
    }
}

export class ArgumentError extends TypeError {
    /**
    * @param {string} msg
    * @param {string} code
    */
    constructor(msg, code) {
        super(msg);
        this.code = code || "ERR_ARG";
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
