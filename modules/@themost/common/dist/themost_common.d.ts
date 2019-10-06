/// <reference types="node" />
import { EventEmitter } from 'events';

/**
 * @class
 * @extends EventEmitter
 */
declare class SequentialEventEmitter extends EventEmitter {
    /**
     * @constructor
     */
    constructor();
    /**
     * Emits an event by specifying additional arguments where the last argument is a callback function
     * @param {string | symbol} event
     * @param args
     * @returns {any}
     */
    emit(event: string | symbol, ...args: any[]): any;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listenerCount(type: string | symbol): number;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
}

interface IHttpErrorCode {
    title: string;
    status: number;
    message: string;
}
interface IStatusError {
    statusCode: number;
}
interface ICodeError {
    code: string;
}
/**
 * @class
 * @augments TypeError
 */
declare class AbstractMethodError extends Error {
    constructor(message?: string);
}
/**
 * @classdesc Abstract Class Exception
 * @class
 * @augments Error
 *
 */
declare class AbstractClassError extends TypeError {
    constructor(message?: string);
}
/**
 * @class
 * @augments Error
 */
declare class FileNotFoundError extends Error {
    constructor(message?: string);
}
/**
 * @class
 * @augments Error
 */
declare class HttpError extends Error implements IStatusError {
    /**
     * @param {Error} err
     * @returns {HttpError}
     */
    static create(err: any): HttpError;
    /**
     * Gets or sets a short title for this HTTP error (e.g. Not Found, Bad Request)
     */
    title: string;
    /**
     * Gets or sets the status code if this HTTP error
     */
    statusCode: number;
    /**
     * Gets or sets an inner message for this HTTP error.
     */
    innerMessage: string;
    /**
     * @constructor
     * @param {number=} status
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(status?: number, message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 400 Bad Request exception class
 * @class
 */
declare class HttpBadRequestError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 404 Not Found Exception class
 * @class
 * @augments HttpError
 */
declare class HttpNotFoundError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
    /**
     * Gets or sets the resource which could not to be found
     */
    resource: string;
}
/**
 * @classdesc HTTP 405 Method Not Allowed exception class
 * @class
 * @augments HttpError
 */
declare class HttpMethodNotAllowedError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 406 Not Acceptable exception class
 * @class
 * @augments HttpError
 */
declare class HttpNotAcceptableError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 408 RequestTimeout exception class
 * @class
 * @augments HttpError
 */
declare class HttpRequestTimeoutError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 409 Conflict exception class
 * @class
 * @augments HttpError
 */
declare class HttpConflictError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 498 Token Expired exception class
 * @class
 * @augments HttpError
 */
declare class HttpTokenExpiredError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 499 Token Required exception class
 * @class
 * @augments HttpError
 */
declare class HttpTokenRequiredError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 401 Unauthorized Exception class
 * @class
 * @augments HttpError
 */
declare class HttpUnauthorizedError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * HTTP 403 Forbidden Exception class
 * @class
 * @param {string=} message
 * @param {string=} innerMessage
 * @augments HttpError
 */
declare class HttpForbiddenError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 500 Internal Server Error Exception class
 * @class
 * @augments HttpError
 */
declare class HttpServerError extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc HTTP 503 Service Unavailable
 * @class
 * @augments HttpError
 */
declare class HttpServiceUnavailable extends HttpError {
    /**
     * @constructor
     * @param {string=} message
     * @param {string=} innerMessage
     */
    constructor(message?: string, innerMessage?: string);
}
/**
 * @classdesc Extends Error object for throwing exceptions on data operations
 * @class
 * @property {string} code - A string that represents an error code e.g. EDATA
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @property {number} status - A number that represents an error status. This error status may be used for throwing the appropriate HTTP error.
 * @augments Error
 */
declare class DataError extends Error implements IStatusError, ICodeError {
    /**
     * Gets or sets a string which may be used to identify this error e.g. EDATA, EVIOLATION etc
     */
    statusCode: number;
    /**
     * Gets or sets a string which may be used to identify this error e.g. EDATA, EVIOLATION etc
     */
    code: string;
    /**
     * Gets or sets a string which represents the target data model, if any
     */
    model: string;
    /**
     * Gets or sets a string which represents the target data field, if any
     */
    field: string;
    /**
     * Gets or sets an inner message for this error.
     */
    innerMessage: string;
    constructor(code?: string, message?: string, innerMessage?: string, model?: string, field?: string);
}
/**
 * @classdesc Extends Error object for throwing not null exceptions.
 * @class
 * @property {string} code - A string that represents an error code. The default error code is ENULL.
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @property {number} status - A number that represents an error status. This error status may be used for throwing the appropriate HTTP error. The default status is 409 (Conflict)
 * @property {string} model - The target model name
 * @property {string} field - The target field name
 * @augments DataError
 */
declare class NotNullError extends DataError {
    /**
     * @constructor
     * @param {string=} message - The error message
     * @param {string=} innerMessage - The error inner message
     * @param {string=} model - The target model
     * @param {string=} field - The target field
     */
    constructor(message?: string, innerMessage?: string, model?: string, field?: string);
}
/**
 * @classdesc Extends Error object for throwing not found exceptions.
 * @class
 * @property {string} code - A string that represents an error code. The default error code is EFOUND.
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @property {number} status - A number that represents an error status. This error status may be used for throwing the appropriate HTTP error. The default status is 404 (Conflict)
 * @property {string} model - The target model name
 * @augments DataError
 */
declare class DataNotFoundError extends DataError {
    /**
     * @constructor
     * @param {string=} message - The error message
     * @param {string=} innerMessage - The error inner message
     * @param {string=} model - The target model
     */
    constructor(message?: string, innerMessage?: string, model?: string);
}
/**
 * @classdesc Extends Error object for throwing unique constraint exceptions.
 * @class
 * @property {string} code - A string that represents an error code. The default error code is ENULL.
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @property {number} status - A number that represents an error status. This error status may be used for throwing the appropriate HTTP error. The default status is 409 (Conflict)
 * @property {string} model - The target model name
 * @property {string} constraint - The target constraint name
 * @augments DataError
 */
declare class UniqueConstraintError extends DataError {
    /**
     * Gets or sets the name of the violated constraint
     */
    constraint: string;
    constructor(message?: string, innerMessage?: string, model?: string, constraint?: string);
}
/**
 * @classdesc Represents an access denied data exception.
 * @class
 *
 * @param {string=} message - The error message
 * @param {string=} innerMessage - The error inner message
 * @property {string} code - A string that represents an error code. The error code is EACCESS.
 * @property {number} status - A number that represents an error status. The error status is 401.
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @augments DataError
 */
declare class AccessDeniedError extends DataError {
    constructor(message?: string, innerMessage?: string);
}

/**
 * @class
 */
declare class Args {
    /**
     * Checks the expression and throws an exception if the condition is not met.
     * @param {*} expr
     * @param {string|Error} err
     */
    static check(expr: any, err: string | Error): void;
    /**
     *
     * @param {*} arg
     * @param {string} name
     */
    static notNull(arg: any, name: string): void;
    /**
     * @param {*} arg
     * @param {string} name
     */
    static notString(arg: any, name: string): void;
    /**
     * @param {*} arg
     * @param {string} name
     */
    static notFunction(arg: any, name: string): void;
    /**
     * @param {*} arg
     * @param {string} name
     */
    static notNumber(arg: any, name: string): void;
    /**
     * @param {string|*} arg
     * @param {string} name
     */
    static notEmpty(arg: any, name: any): void;
    /**
     * @param {number|*} arg
     * @param {string} name
     */
    static notNegative(arg: any, name: any): void;
    /**
     * @param {number|*} arg
     * @param {string} name
     */
    static notPositive(arg: any, name: any): void;
}
declare class Base26Number {
    static toBase26(x: number): string;
    static fromBase26(s: string): number;
    private value;
    constructor(value: any);
    toString(): string;
}
declare class TextUtils {
    /**
     * Converts the given parameter to MD5 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    static toMD5(value: any): string;
    /**
     * Converts the given parameter to SHA1 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    static toSHA1(value: any): string;
    /**
     * Converts the given parameter to SHA256 hex string
     * @static
     * @param {*} value
     * @returns {string|undefined}
     */
    static toSHA256(value: any): string;
    /**
     * Returns a random GUID/UUID string
     * @static
     * @returns {string}
     */
    static newUUID(): string;
}
/**
 *
 */
declare class Guid {
    /**
     * @param {string} s
     * @returns {boolean}
     */
    static isGuid(s: string): boolean;
    /**
     * @returns {Guid}
     */
    static newGuid(): Guid;
    private value;
    /**
     * @constructor
     * @param {string} value
     */
    constructor(value?: string);
    /**
     * @returns {string}
     */
    toString(): string;
    /**
     * @returns {string}
     */
    valueOf(): string;
    toJSON(): string;
}
/**
 * @class
 */
declare class RandomUtils {
    /**
     * Returns a random string based on the length specified
     * @param {Number} length
     */
    static randomChars(length: number): string;
    /**
     * Returns a random integer between a minimum and a maximum value
     * @param {number} min
     * @param {number} max
     */
    static randomInt(min: number, max: number): number;
    /**
     * Returns a random string based on the length specified
     * @static
     * @param {number} length
     * @returns {string}
     */
    static randomHex(length: number): string;
}
interface IConvertOptions {
    convertValues: boolean;
}
/**
 * @class
 */
declare class LangUtils {
    /**
     * Returns an array of strings which represents the arguments' names of the given function
     * @param {Function} fn
     * @returns {Array}
     */
    static getFunctionParams(fn: any): any[];
    /**
     * Parses HTTP form formatted values (e.g. "user[name]", user[password], user[options][rememberMe] etc ) and returns the equivalent native object
     * @param {*} form
     * @param {IConvertOptions} options
     * @returns {*}
     * @example
     *
     */
    static parseForm(form: any, options?: IConvertOptions): {};
    /**
     * Parses value value or string and returns the resulted object.
     * @param {*} value
     * @returns {*}
     */
    static parseValue(value: any): any;
    /**
     * Parses value value and returns the equivalent integer.
     * @param {*} value
     * @returns {*}
     */
    static parseInt(value: any): number;
    /**
     * Parses value value and returns the equivalent float number.
     * @param {*} value
     * @returns {*}
     */
    static parseFloat(value: any): number;
    /**
     * Parses value value and returns the equivalent boolean.
     * @param {*} value
     * @returns {*}
     */
    static parseBoolean(value: any): boolean;
    /**
     * @param {string} value
     */
    private static convert(value);
    /**
     *
     * @param {*} origin
     * @param {string} expr
     * @param {string} value
     * @param {IConvertOptions=} options
     * @returns {*}
     */
    private static extend(origin, expr, value, options?);

    /**
     * Checks if the given value is a valid date
     * @param {*} value
     * @returns {boolean}
     */
    static isDate(value):boolean;

    /**
     * @param constructor
     * @param superConstructor
     */
    static inherits(constructor: any, superConstructor: any): void;

}
/**
 * @class
 */
declare class PathUtils {
    /**
     *
     * @param {...string} part
     * @returns {string}
     */
    static join(...part: any[]): string;
}
interface ITraceLogger {
    level(level: string): ITraceLogger;
    /**
     * @param {...*} data
     */
    log(...data: any[]): any;
    /**
     * @param {...*} data
     */
    info(...data: any[]): any;
    /**
     * @param {...*} data
     */
    error(...data: any[]): any;
    /**
     * @param {...*} data
     */
    warn(...data: any[]): any;
    /**
     * @param {...*} data
     */
    debug(...data: any[]): any;
}
interface ITraceLoggerOptions {
    colors: boolean;
    level: string;
}
declare class TraceLogger implements ITraceLogger {
    private options;
    constructor(options?: ITraceLoggerOptions);
    level(level: string): this;
    log(...data: any[]): void;
    info(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
    verbose(...data: any[]): void;
    debug(...data: any[]): void;
    private timestamp();
    private write(level, text);
}
declare class TraceUtils {

    static level(level: string): void;

    static useLogger(logger: ITraceLogger): void;
    /**
     * @static
     * @param {...*} data
     */
    static log(...data: any[]): void;
    /**
     * @static
     * @param {...*} data
     */
    static error(...data: any[]): void;
    /**
     *
     * @static
     * @param {...*} data
     */
    static info(...data: any[]): void;
    /**
     *
     * @static
     * @param {*} data
     */
    static warn(...data: any[]): void;
    /**
     *
     * @static
     * @param {...*} data
     */
    static debug(...data: any[]): void;
}

/**
 * @class
 */
declare class ArgumentError extends TypeError {
    /**
     * Gets or sets a string which may be used to identify this error e.g. ECHECK, ENULL etc
     */
    code: string;
    constructor(message: any, code?: string);
}

/**
 * @class
 */
declare class ConfigurationBase {
    /**
     * Gets the current configuration
     * @returns ConfigurationBase - An instance of DataConfiguration class which represents the current data configuration
     */
    public static getCurrent(): ConfigurationBase;
    /**
     * Sets the current configuration
     * @param {ConfigurationBase} configuration
     * @returns ConfigurationBase - An instance of ApplicationConfiguration class which represents the current configuration
     */
    public static setCurrent(configuration: ConfigurationBase): any;
    public readonly settings: any;
    /**
     * @constructor
     * @param {string=} configPath
     */
    constructor(configPath?: string);
    /**
     * Register a configuration strategy
     * @param {Function|*} configStrategyCtor
     * @param {Function|*} strategyCtor
     * @returns ConfigurationBase
     */
    public useStrategy(configStrategyCtor: any, strategyCtor: any): this;
    /**
     * Gets a configuration strategy
     * @param {Function|*} configStrategyCtor
     * @returns {ConfigurationStrategy|*}
     */
    public getStrategy(configStrategyCtor: any): any;
    /**
     * Gets a configuration strategy
     * @param {Function} configStrategyCtor
     */
    public hasStrategy(configStrategyCtor: any): boolean;
    /**
     * Returns the configuration source object
     * @returns {*}
     */
    public getSource(): any;
    /**
     * Returns the source configuration object based on the given path (e.g. settings.auth.cookieName or settings/auth/cookieName)
     * @param {string} p - A string which represents an object path
     * @returns {Object|Array}
     */
    public getSourceAt(p: string): any;
    /**
     * Returns a boolean which indicates whether the specified  object path exists or not (e.g. settings.auth.cookieName or settings/auth/cookieName)
     * @param {string} p - A string which represents an object path
     * @returns {boolean}
     */
    public hasSourceAt(p: string): boolean;
    /**
     * Sets the config value to the specified object path (e.g. settings.auth.cookieName or settings/auth/cookieName)
     * @param {string} p - A string which represents an object path
     * @param {*} value
     * @returns {Object}
     */
    public setSourceAt(p: any, value: any): any;
    /**
     * Sets the current execution path
     * @param {string} p
     */
    public setExecutionPath(p: string): ConfigurationBase;
    /**
     * Gets the current execution path
     * @returns {string}
     */
    public getExecutionPath(): string;
    /**
     * Gets the current configuration path
     * @returns {string}
     */
    public getConfigurationPath(): string;
}
/**
 * @class
 */
declare class ConfigurationStrategy {
    /**
     * @constructor
     * @param {ConfigurationBase} config
     */
    constructor(config: ConfigurationBase);
    /**
     * @returns {ConfigurationBase}
     */
    public getConfiguration(): ConfigurationBase;
}
declare class ModuleLoaderStrategy extends ConfigurationStrategy {
    /**
     *
     * @param {ConfigurationBase} config
     */
    constructor(config: ConfigurationBase);
    /**
     * @param {string} modulePath
     * @returns {*}
     */
    public require(modulePath: any): any;
}
declare class DefaultModuleLoaderStrategy extends ModuleLoaderStrategy {
    /**
     *
     * @param {ConfigurationBase} config
     */
    constructor(config: any);
}

/**
 *
 */
declare class HtmlWriter {
    /**
     * @private
     * @type {Array}
     */
    public bufferedAttributes: any[];

    /**
     * @private
     * @type {Array}
     */
    public bufferedTags: string[];

    /**
     * and clear buffer
     */
    public buffer: string;
    /**
     * Writes an attribute to an array of attributes that is going to be used in writeBeginTag function
     * @param {String} name - The name of the HTML attribute
     * @param {String} value - The value of the HTML attribute
     * @returns {HtmlWriter}
     * @param name
     * @param value
     * @return
     */
    public writeAttribute(name: string, value: string): /* HtmlWriter.prototype.+HtmlWriter */ any;

    /**
     * Writes an array of attributes to the output buffer. This attributes are going to be rendered after writeBeginTag or WriteFullBeginTag function call.
     * @param {Array|Object} obj - An array of attributes or an object that represents an array of attributes
     * @returns {HtmlWriter}
     * @param obj
     * @return
     */
    public writeAttributes(obj: any[] | {}): /* !this */ any;

    /**
     * @param {String} tag
     * @returns {HtmlWriter}
     * @param tag
     * @return
     */
    public writeBeginTag(tag: string): /* !this */ any;

    /**
     * Writes a full begin HTML tag (e.g <div/>).
     * @param {String} tag
     * @returns {HtmlWriter}
     * @param tag
     * @return
     */
    public writeFullBeginTag(tag: string): /* !this */ any;

    /**
     * Writes an end HTML tag (e.g </div>) based on the current buffered tags.
     * @returns {HtmlWriter}
     * @return
     */
    public writeEndTag(): /* !this */ any;

    /**
     * @param {String} s
     * @returns {HtmlWriter}
     * @param s
     * @return
     */
    public writeText(s: string): /* !this */ any;

    /**
     * @param {String} s
     * @returns {HtmlWriter}
     * @param s
     * @return
     */
    public write(s: string): /* !this */ any;

    /**
     * @param {function} fn
     * @param fn
     */
    public writeTo(fn: any): void;

}

declare abstract class IApplication {
    /**
     * Registers an application strategy e.g. an singleton service which to be used in application contextr
     * @param {Function} serviceCtor
     * @param {Function} strategyCtor
     * @returns IApplication
     */
    abstract useStrategy(serviceCtor: void, strategyCtor: void): IApplication;
    /**
     * @param {Function} serviceCtor
     * @returns {boolean}
     */
    abstract hasStrategy(serviceCtor: void): boolean;
    /**
     * Gets an application strategy based on the given base service type
     * @param {Function} serviceCtor
     * @return {*}
     */
    abstract getStrategy(serviceCtor: void): IApplicationService;

    /**
     * Gets the configuration of this application
     * @returns {ConfigurationBase}
     */
    abstract getConfiguration():ConfigurationBase;
}

declare abstract class IApplicationService {
    /**
     * Gets the application of this service
     * @returns {IApplication}
     */
    abstract getApplication():IApplication;
}

declare class ApplicationService implements IApplicationService {
    /**
     * @constructor
     * @param {IApplication=} app
     */
    constructor(app: IApplication);
    /**
     * Gets the application of this service
     * @returns {IApplication}
     */
    getApplication():IApplication;
    /**
     * Registers an application strategy e.g. an singleton service which to be used in application contextr
     * @param {Function} serviceCtor
     * @param {Function} strategyCtor
     * @returns IApplication
     */
    useStrategy(serviceCtor: void, strategyCtor: void): IApplication;
    /**
     * @param {Function} serviceCtor
     * @returns {boolean}
     */
    hasStrategy(serviceCtor: void): boolean;
    /**
     * Gets an application strategy based on the given base service type
     * @param {Function} serviceCtor
     * @return {*}
     */
    getStrategy(serviceCtor: void): IApplicationService;

    /**
     * Gets the configuration of this application
     * @returns {ConfigurationBase}
     */
    getConfiguration():ConfigurationBase;
}

export { AbstractClassError, AbstractMethodError, AccessDeniedError, ApplicationService, Args, ArgumentError, Base26Number, ConfigurationBase, ConfigurationStrategy, DataError, DataNotFoundError, DefaultModuleLoaderStrategy, FileNotFoundError, Guid, HtmlWriter, HttpBadRequestError, HttpConflictError, HttpError, HttpForbiddenError, HttpMethodNotAllowedError, HttpNotAcceptableError, HttpNotFoundError, HttpRequestTimeoutError, HttpServerError, HttpServiceUnavailable, HttpTokenExpiredError, HttpTokenRequiredError, HttpUnauthorizedError, IApplication, IApplicationService, ICodeError, IConvertOptions, IHttpErrorCode, IStatusError, ITraceLogger, ITraceLoggerOptions, LangUtils, ModuleLoaderStrategy, NotNullError, PathUtils, RandomUtils, SequentialEventEmitter, TextUtils, TraceLogger, TraceUtils, UniqueConstraintError };
//# sourceMappingURL=themost_common.d.ts.map
