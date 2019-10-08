(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('events'), require('async'), require('sprintf'), require('lodash')) :
  typeof define === 'function' && define.amd ? define(['exports', 'events', 'async', 'sprintf', 'lodash'], factory) :
  (global = global || self, factory(global['@themost/common'] = {}, global.events, global.async, global.sprintf, global._));
}(this, function (exports, events, async, sprintf, _) { 'use strict';

  _ = _ && _.hasOwnProperty('default') ? _['default'] : _;

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _readOnlyError(name) {
    throw new Error("\"" + name + "\" is read-only");
  }

  /**
   * @classdesc SequentialEventEmitter class is an extension of node.js EventEmitter class where listeners are executing in series.
   * @class
   * @constructor
   * @augments EventEmitter
   */

  var SequentialEventEmitter =
  /*#__PURE__*/
  function (_EventEmitter) {
    _inherits(SequentialEventEmitter, _EventEmitter);

    function SequentialEventEmitter() {
      _classCallCheck(this, SequentialEventEmitter);

      return _possibleConstructorReturn(this, _getPrototypeOf(SequentialEventEmitter).apply(this, arguments));
    }

    _createClass(SequentialEventEmitter, [{
      key: "emit",

      /**
       * Executes event listeners in series.
       * @param {String} event - The event that is going to be executed.
       * @param {...*} args - An object that contains the event arguments.
       */
      // eslint-disable-next-line no-unused-vars
      // tslint:disable-nex-lineb no-unused-variable
      value: function emit(event, _args) {
        //ensure callback
        callback = (_readOnlyError("callback"), callback || function () {}); //get listeners

        if (typeof this.listeners !== 'function') {
          throw new Error('undefined listeners');
        }

        var listeners = this.listeners(event);
        var argsAndCallback = [].concat(Array.prototype.slice.call(arguments, 1));

        if (argsAndCallback.length > 0) {
          //check the last argument (expected callback function)
          if (typeof argsAndCallback[argsAndCallback.length - 1] !== "function") {
            throw new TypeError("Expected event callback");
          }
        } //get callback function (the last argument of arguments list)


        var callback = argsAndCallback[argsAndCallback.length - 1]; //validate listeners

        if (listeners.length === 0) {
          //exit emitter
          return callback();
        } //apply each series


        return async.applyEachSeries.apply(this, [listeners].concat(argsAndCallback));
      }
    }]);

    return SequentialEventEmitter;
  }(events.EventEmitter);

  /**
   * MOST Web Framework 3.0 Codename Zero Gravity
   * Copyright (c) 2019, THEMOST LP All rights reserved
   *
   * Use of this source code is governed by an BSD-3-Clause license that can be
   * found in the LICENSE file at https://themost.io/license
   */
  var Errors = [{
    statusCode: 400,
    title: "Bad Request",
    message: "The request cannot be fulfilled due to bad syntax."
  }, {
    statusCode: 401,
    title: "Unauthorized",
    message: "The request was a legal request, but requires user authentication."
  }, {
    statusCode: 403,
    title: "Forbidden",
    message: "The server understood the request, but is refusing to fulfill it."
  }, {
    statusCode: 404,
    title: "Not Found",
    message: "The requested resource could not be found but may be available again in the future."
  }, {
    statusCode: 405,
    title: "Method Not Allowed",
    message: "A request was made of a resource using a request method not supported by that resource."
  }, {
    statusCode: 406,
    title: "Not Acceptable",
    message: "The requested resource is only capable of generating content not acceptable according to the Accept headers sent in the request."
  }, {
    statusCode: 407,
    title: "Proxy Authentication Required",
    message: "The client must first authenticate itself with the proxy."
  }, {
    statusCode: 408,
    title: "Request Timeout",
    message: "The server timed out waiting for the request."
  }, {
    statusCode: 409,
    title: "Conflict",
    message: "The request could not be completed due to a conflict with the current state of the resource."
  }, {
    statusCode: 410,
    title: "Gone",
    message: "The resource requested is no longer available and will not be available again."
  }, {
    statusCode: 411,
    title: "Length Required",
    message: "The request did not specify the length of its content, which is required by the requested resource."
  }, {
    statusCode: 412,
    title: "Precondition Failed",
    message: "The server does not meet one of the preconditions that the requester put on the request."
  }, {
    statusCode: 413,
    title: "Request Entity Too Large",
    message: "The request is larger than the server is willing or able to process."
  }, {
    statusCode: 414,
    title: "Request-URI Too Long",
    message: "The URI provided was too long for the server to process."
  }, {
    statusCode: 415,
    title: "Unsupported Media Type",
    message: "The server is refusing to service the request because the payload is in a format not supported by this method on the target resource."
  }, {
    statusCode: 416,
    title: "Requested Range Not Satisfiable",
    message: "The client has asked for a portion of the file, but the server cannot supply that portion."
  }, {
    statusCode: 417,
    title: "Expectation Failed",
    message: "The server cannot meet the requirements of the Expect request-header field."
  }, {
    statusCode: 496,
    title: "No Cert",
    message: "The client must provide a certificate to fulfill the request."
  }, {
    statusCode: 498,
    title: "Token expired",
    message: "Token was expired or is in invalid state."
  }, {
    statusCode: 499,
    title: "Token required",
    message: "A token is required to fulfill the request."
  }, {
    statusCode: 500,
    title: "Internal Server Error",
    message: "The server encountered an internal error and was unable to complete your request."
  }, {
    statusCode: 501,
    title: "Not Implemented",
    message: "The server either does not recognize the request method, or it lacks the ability to fulfil the request."
  }, {
    statusCode: 502,
    title: "Bad Gateway",
    message: "The server was acting as a gateway or proxy and received an invalid response from the upstream server."
  }, {
    statusCode: 503,
    title: "Service Unavailable",
    message: "The server is currently unavailable (because it is overloaded or down for maintenance)."
  }];
  var Errors_1 = Errors;

  /**
   * @classdesc Thrown when an application tries to call an abstract method.
   * @class
   */

  var AbstractMethodError =
  /*#__PURE__*/
  function (_Error) {
    _inherits(AbstractMethodError, _Error);

    /**
     * @param {string=} msg
     */
    function AbstractMethodError(msg) {
      var _this;

      _classCallCheck(this, AbstractMethodError);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(AbstractMethodError).call(this, msg));
      _this.message = msg || 'Class does not implement inherited abstract method.';

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
      }

      return _this;
    }

    return AbstractMethodError;
  }(_wrapNativeSuper(Error));
  /**
   * @classdesc Thrown when an application tries to instantiate an abstract class.
   * @class
   */

  var AbstractClassError =
  /*#__PURE__*/
  function (_Error2) {
    _inherits(AbstractClassError, _Error2);

    /**
     * @param {string=} msg
     */
    function AbstractClassError(msg) {
      var _this2;

      _classCallCheck(this, AbstractClassError);

      _this2.message = msg || 'An abstract class cannot be instantiated.';

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(_assertThisInitialized(_this2), _this2.constructor);
      }

      return _possibleConstructorReturn(_this2);
    }

    return AbstractClassError;
  }(_wrapNativeSuper(Error));
  /**
   * @classdesc Represents an error with a code.
   * @class
   */

  var CodedError =
  /*#__PURE__*/
  function (_Error3) {
    _inherits(CodedError, _Error3);

    /**
     * @param {string} msg
     * @param {string} code
     */
    function CodedError(msg, code) {
      var _this3;

      _classCallCheck(this, CodedError);

      _this3.message = msg;
      _this3.code = code;

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(_assertThisInitialized(_this3), _this3.constructor);
      }

      return _possibleConstructorReturn(_this3);
    }

    return CodedError;
  }(_wrapNativeSuper(Error));
  /**
   * @classdesc Thrown when an application tries to access a file which does not exist.
   * @class
   */

  var FileNotFoundError =
  /*#__PURE__*/
  function (_CodedError) {
    _inherits(FileNotFoundError, _CodedError);

    /**
    * @param {string=} msg
    */
    function FileNotFoundError(msg) {
      _classCallCheck(this, FileNotFoundError);

      return _possibleConstructorReturn(this, _getPrototypeOf(FileNotFoundError).call(this, msg | 'File not found', "EFOUND"));
    }

    return FileNotFoundError;
  }(CodedError);
  /**
   * @classdesc Represents an HTTP error.
   * @class
   * @param {number} status
   * @param {string=} message
   * @param {string=} innerMessage
   * @constructor
   * @extends CodedError
   */

  var HttpError =
  /*#__PURE__*/
  function (_CodedError2) {
    _inherits(HttpError, _CodedError2);

    function HttpError(status, message, innerMessage) {
      var _this4;

      _classCallCheck(this, HttpError);

      _this4 = _possibleConstructorReturn(this, _getPrototypeOf(HttpError).call(this, message, "EHTTP"));
      var finalStatus = Number.isNumber(status) ? status : 500;
      var err = Errors_1.find(function (x) {
        return x.statusCode === finalStatus;
      });

      if (err) {
        _this4.title = err.title;
        _this4.message = message || err.message;
        _this4.statusCode = err.statusCode;
      } else {
        _this4.title = 'Internal Server Error';
        _this4.message = message || 'The server encountered an internal error and was unable to complete the request.';
        _this4.statusCode = finalStatus;
      }

      if (typeof innerMessage !== 'undefined') {
        _this4.innerMessage = innerMessage;
      }

      return _this4;
    }
    /**
     * @param {Error=} err
     * @returns {HttpError}
     */


    _createClass(HttpError, null, [{
      key: "create",
      value: function create(err) {
        if (err == null) {
          return new HttpError(500);
        }

        if (err.hasOwnProperty('statusCode')) {
          return Object.assign(new HttpError(err.statusCode, err.message), err);
        } else {
          return Object.assign(new HttpError(500, err.message), err);
        }
      }
    }]);

    return HttpError;
  }(CodedError);
  /**
   * @classdesc Represents a 400 HTTP Bad Request error.
   * @class
   */

  var HttpBadRequestError =
  /*#__PURE__*/
  function (_HttpError) {
    _inherits(HttpBadRequestError, _HttpError);

    function HttpBadRequestError(message, innerMessage) {
      _classCallCheck(this, HttpBadRequestError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpBadRequestError).call(this, 400, message, innerMessage));
    }

    return HttpBadRequestError;
  }(HttpError);
  /**
   * @classdesc Represents a 404 HTTP Not Found error.
   * @class
   * @property {string} resource - Gets or sets the requested resource which could not to be found
   */

  var HttpNotFoundError =
  /*#__PURE__*/
  function (_HttpError2) {
    _inherits(HttpNotFoundError, _HttpError2);

    function HttpNotFoundError(message, innerMessage) {
      _classCallCheck(this, HttpNotFoundError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpNotFoundError).call(this, 404, message, innerMessage));
    }

    return HttpNotFoundError;
  }(HttpError);
  /**
   * @classdesc Represents a 405 HTTP Method Not Allowed error.
   * @class
   */

  var HttpMethodNotAllowedError =
  /*#__PURE__*/
  function (_HttpError3) {
    _inherits(HttpMethodNotAllowedError, _HttpError3);

    function HttpMethodNotAllowedError(message, innerMessage) {
      _classCallCheck(this, HttpMethodNotAllowedError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpMethodNotAllowedError).call(this, 405, message, innerMessage));
    }

    return HttpMethodNotAllowedError;
  }(HttpError);
  /**
   * @classdesc Represents a 401 HTTP Unauthorized error.
   * @class
   */

  var HttpUnauthorizedError =
  /*#__PURE__*/
  function (_HttpError4) {
    _inherits(HttpUnauthorizedError, _HttpError4);

    function HttpUnauthorizedError(message, innerMessage) {
      _classCallCheck(this, HttpUnauthorizedError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpUnauthorizedError).call(this, 401, message, innerMessage));
    }

    return HttpUnauthorizedError;
  }(HttpError);
  /**
   * @classdesc HTTP 406 Not Acceptable exception class
   * @class
   */

  var HttpNotAcceptableError =
  /*#__PURE__*/
  function (_HttpError5) {
    _inherits(HttpNotAcceptableError, _HttpError5);

    function HttpNotAcceptableError(message, innerMessage) {
      _classCallCheck(this, HttpNotAcceptableError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpNotAcceptableError).call(this, 406, message, innerMessage));
    }

    return HttpNotAcceptableError;
  }(HttpError);
  /**
   * @classdesc HTTP 408 RequestTimeout exception class
   * @class
   */

  var HttpRequestTimeoutError =
  /*#__PURE__*/
  function (_HttpError6) {
    _inherits(HttpRequestTimeoutError, _HttpError6);

    function HttpRequestTimeoutError(message, innerMessage) {
      _classCallCheck(this, HttpRequestTimeoutError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpRequestTimeoutError).call(this, 408, message, innerMessage));
    }

    return HttpRequestTimeoutError;
  }(HttpError);
  /**
   * @classdesc HTTP 409 Conflict exception class
   * @class
   */

  var HttpConflictError =
  /*#__PURE__*/
  function (_HttpError7) {
    _inherits(HttpConflictError, _HttpError7);

    function HttpConflictError(message, innerMessage) {
      _classCallCheck(this, HttpConflictError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpConflictError).call(this, 409, message, innerMessage));
    }

    return HttpConflictError;
  }(HttpError);
  /**
   * @classdesc HTTP 498 Token Expired exception class
   * @class
   */

  var HttpTokenExpiredError =
  /*#__PURE__*/
  function (_HttpError8) {
    _inherits(HttpTokenExpiredError, _HttpError8);

    function HttpTokenExpiredError(message, innerMessage) {
      _classCallCheck(this, HttpTokenExpiredError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpTokenExpiredError).call(this, 498, message, innerMessage));
    }

    return HttpTokenExpiredError;
  }(HttpError);
  /**
   * @classdesc HTTP 499 Token Required exception class
   * @class
   */

  var HttpTokenRequiredError =
  /*#__PURE__*/
  function (_HttpError9) {
    _inherits(HttpTokenRequiredError, _HttpError9);

    function HttpTokenRequiredError(message, innerMessage) {
      _classCallCheck(this, HttpTokenRequiredError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpTokenRequiredError).call(this, 499, message, innerMessage));
    }

    return HttpTokenRequiredError;
  }(HttpError);
  /**
   * @classdesc Represents a 403 HTTP Forbidden error.
   * @class
   */

  var HttpForbiddenError =
  /*#__PURE__*/
  function (_HttpError10) {
    _inherits(HttpForbiddenError, _HttpError10);

    function HttpForbiddenError(message, innerMessage) {
      _classCallCheck(this, HttpForbiddenError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpForbiddenError).call(this, 403, message, innerMessage));
    }

    return HttpForbiddenError;
  }(HttpError);
  /**
   * @classdesc Represents a 500 HTTP Internal Server error.
   * @class
   */

  var HttpServerError =
  /*#__PURE__*/
  function (_HttpError11) {
    _inherits(HttpServerError, _HttpError11);

    function HttpServerError(message, innerMessage) {
      _classCallCheck(this, HttpServerError);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpServerError).call(this, 500, message, innerMessage));
    }

    return HttpServerError;
  }(HttpError);
  /**
   * @classdesc Represents a 503 HTTP Service Unavailable.
   * @class
   */

  var HttpServiceUnavailable =
  /*#__PURE__*/
  function (_HttpError12) {
    _inherits(HttpServiceUnavailable, _HttpError12);

    function HttpServiceUnavailable(message, innerMessage) {
      _classCallCheck(this, HttpServiceUnavailable);

      return _possibleConstructorReturn(this, _getPrototypeOf(HttpServiceUnavailable).call(this, 503, message, innerMessage));
    }

    return HttpServiceUnavailable;
  }(HttpError);
  /**
   * @classdesc Extends Error object for throwing exceptions on data operations
   * @class
   * @property {string} code - A string that represents an error code e.g. EDATA
   * @property {string} message -  The error message.
   * @property {string} innerMessage - The error inner message.
   * @property {number} status - A number that represents an error status. This error status may be used for throwing the appropriate HTTP error.
   * @property {*} additionalData - Additional data associated with this error
   */

  var DataError =
  /*#__PURE__*/
  function (_CodedError3) {
    _inherits(DataError, _CodedError3);

    /**
     * @param {string=} code - A string that represents an error code
     * @param {string=} message - The error message
     * @param {string=} innerMessage - The error inner message
     * @param {string=} model - The target model
     * @param {string=} field - The target field
     * @param {*} additionalData - Additional data associated with this error
     */
    function DataError(code, message, innerMessage, model, field, additionalData) {
      var _this5;

      _classCallCheck(this, DataError);

      _this5 = _possibleConstructorReturn(this, _getPrototypeOf(DataError).call(this, message, code));
      _this5.code = code || 'EDATA';

      if (typeof model !== 'undefined') {
        _this5.model = model;
      }

      if (typeof field !== 'undefined') {
        _this5.field = field;
      }

      _this5.message = message || 'A general data error occured.';

      if (typeof innerMessage !== 'undefined') {
        _this5.innerMessage = innerMessage;
      }

      _this5.additionalData = additionalData;
      return _this5;
    }

    return DataError;
  }(CodedError);
  /**
   * Thrown when an application attempts to access a data object that cannot be found.
   */

  var NotNullError =
  /*#__PURE__*/
  function (_DataError) {
    _inherits(NotNullError, _DataError);

    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    * @param {string=} field - The target field
    */
    function NotNullError(message, innerMessage, model, field) {
      var _this6;

      _classCallCheck(this, NotNullError);

      _this6 = _possibleConstructorReturn(this, _getPrototypeOf(NotNullError).call(this, 'ENULL', message || 'A value is required.', innerMessage, model, field));
      _this6.statusCode = 409;
      return _this6;
    }

    return NotNullError;
  }(DataError);
  /**
   * @classdesc Thrown when an application attempts to access a data object that cannot be found.
   * @class
   */

  var DataNotFoundError =
  /*#__PURE__*/
  function (_DataError2) {
    _inherits(DataNotFoundError, _DataError2);

    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    */
    function DataNotFoundError(message, innerMessage, model) {
      var _this7;

      _classCallCheck(this, DataNotFoundError);

      _this7 = _possibleConstructorReturn(this, _getPrototypeOf(DataNotFoundError).call(this, 'EFOUND', message || 'The requested data was not found.', innerMessage, model));
      _this7.statusCode = 404;
      return _this7;
    }

    return DataNotFoundError;
  }(DataError);
  /**
   * @class
   * @classdesc Thrown when a data object operation is denied
   */

  var AccessDeniedError =
  /*#__PURE__*/
  function (_DataError3) {
    _inherits(AccessDeniedError, _DataError3);

    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    */
    function AccessDeniedError(message, innerMessage, model) {
      var _this8;

      _classCallCheck(this, AccessDeniedError);

      _this8 = _possibleConstructorReturn(this, _getPrototypeOf(AccessDeniedError).call(this, 'EACCESS', 'Access Denied' , innerMessage, model));
      _this8.statusCode = 401;
      return _this8;
    }

    return AccessDeniedError;
  }(DataError);
  /**
   * @class
   * @classdesc Thrown when a unique constraint is being violated
   */

  var UniqueConstraintError =
  /*#__PURE__*/
  function (_DataError4) {
    _inherits(UniqueConstraintError, _DataError4);

    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    */
    function UniqueConstraintError(message, innerMessage, model) {
      var _this9;

      _classCallCheck(this, UniqueConstraintError);

      _this9 = _possibleConstructorReturn(this, _getPrototypeOf(UniqueConstraintError).call(this, 'EUNQ', message || 'A unique constraint violated', innerMessage, model));
      _this9.statusCode = 409;
      return _this9;
    }

    return UniqueConstraintError;
  }(DataError);

  var IS_NODE = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
  var UUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var HEX_CHARS = 'abcdef1234567890';
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var DATE_TIME_REGEX = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/g;
  var BOOLEAN_TRUE_REGEX = /^true$/ig;
  var BOOLEAN_FALSE_REGEX = /^false$/ig;
  var NULL_REGEX = /^null$/ig;
  var UNDEFINED_REGEX = /^undefined$/ig;
  var INT_REGEX = /^[-+]?\d+$/g;
  var FLOAT_REGEX = /^[+-]?\d+(\.\d+)?$/g;
  var GUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  var LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4
  };
  var UnknownPropertyDescriptor = function UnknownPropertyDescriptor(obj, name) {
    _classCallCheck(this, UnknownPropertyDescriptor);

    Object.defineProperty(this, 'value', {
      configurable: false,
      enumerable: true,
      get: function get() {
        return obj[name];
      },
      set: function set(value) {
        obj[name] = value;
      }
    });
    Object.defineProperty(this, 'name', {
      configurable: false,
      enumerable: true,
      get: function get() {
        return name;
      }
    });
  };
  /**
   * @class
   * @constructor
   */

  var LangUtils =
  /*#__PURE__*/
  function () {
    function LangUtils() {
      _classCallCheck(this, LangUtils);
    }

    _createClass(LangUtils, null, [{
      key: "inherits",

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
      value: function inherits(ctor, superCtor) {
        if (typeof superCtor !== "function" && superCtor !== null) {
          throw new TypeError("Super expression must either be null or a function, not " + _typeof(superCtor));
        } //if process is running under node js


        if (IS_NODE) {
          var utilModule = "util";

          var util = require(utilModule); //call util.inherits() function


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
            Object.setPrototypeOf(ctor, superCtor);
          } else {
            ctor.__proto__ = superCtor;
          }
        } //node.js As an additional convenience, superConstructor will be accessible through the constructor.super_ property.


        ctor.super_ = ctor.__proto__;
      }
      /**
       * Returns an array of strings which represents the arguments' names of the given function
       * @param {Function} fn
       * @returns {Array}
       */

    }, {
      key: "getFunctionParams",
      value: function getFunctionParams(fn) {
        if (typeof fn === 'function') return [];
        var fnStr = fn.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
        if (result === null) result = (_readOnlyError("result"), []);
        return result;
      }
      /**
       * @param {string} value
       */

    }, {
      key: "convert",
      value: function convert(value) {
        var result;

        if (typeof value === 'string') {
          if (value.length === 0) {
            result = value;
          }

          if (value.match(BOOLEAN_TRUE_REGEX)) {
            result = true;
          } else if (value.match(BOOLEAN_FALSE_REGEX)) {
            result = false;
          } else if (value.match(NULL_REGEX) || value.match(UNDEFINED_REGEX)) {
            result = null;
          } else if (value.match(INT_REGEX)) {
            result = parseInt(value);
          } else if (value.match(FLOAT_REGEX)) {
            result = parseFloat(value);
          } else if (value.match(DATE_TIME_REGEX)) {
            result = new Date(Date.parse(value));
          } else {
            result = value;
          }
        } else {
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

    }, {
      key: "extend",
      value: function extend(origin, expr, value, options) {
        options = options || {
          convertValues: false
        }; //find base notation

        var match = /(^\w+)\[/.exec(expr),
            name,
            descriptor,
            expr1;

        if (match) {
          //get property name
          name = match[1]; //validate array property

          if (/^\d+$/g.test(name)) {
            //property is an array
            if (!Array.isArray(origin.value)) origin.value = []; // get new expression

            expr1 = expr.substr(match.index + match[1].length);
            LangUtils.extend(origin, expr1, value, options);
          } else {
            //set property value (unknown)
            origin[name] = origin[name] || new LangUtils();
            descriptor = new UnknownPropertyDescriptor(origin, name); // get new expression

            expr1 = expr.substr(match.index + match[1].length);
            LangUtils.extend(descriptor, expr1, value, options);
          }
        } else if (expr.indexOf('[') === 0) {
          //get property
          var re = /\[(.*?)\]/g;
          match = re.exec(expr);

          if (match) {
            name = match[1]; // get new expression

            expr1 = expr.substr(match.index + match[0].length);

            if (/^\d+$/g.test(name)) {
              //property is an array
              if (!Array.isArray(origin.value)) origin.value = [];
            }

            if (expr1.length === 0) {
              if (origin.value instanceof LangUtils) {
                origin.value = {};
              }

              var typedValue; //convert string value

              if (typeof value === 'string' && options.convertValues) {
                typedValue = LangUtils.convert(value);
              } else {
                typedValue = value;
              }

              if (Array.isArray(origin.value)) origin.value.push(typedValue);else origin.value[name] = typedValue;
            } else {
              if (origin.value instanceof LangUtils) {
                origin.value = {};
              }

              origin.value[name] = origin.value[name] || new LangUtils();
              descriptor = new UnknownPropertyDescriptor(origin.value, name);
              LangUtils.extend(descriptor, expr1, value, options);
            }
          } else {
            throw new Error('Invalid object property notation. Expected [name]');
          }
        } else if (/^\w+$/.test(expr)) {
          if (options.convertValues) origin[expr] = LangUtils.convert(value);else origin[expr] = value;
        } else {
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

    }, {
      key: "parseForm",
      value: function parseForm(form, options) {
        var result = {};
        if (typeof form === 'undefined' || form === null) return result;
        var keys = Object.keys(form);
        keys.forEach(function (key) {
          if (form.hasOwnProperty(key)) {
            LangUtils.extend(result, key, form[key], options);
          }
        });
        return result;
      }
      /**
       * Parses any value or string and returns the resulted object.
       * @param {*} any
       * @returns {*}
       */

    }, {
      key: "parseValue",
      value: function parseValue(any) {
        return LangUtils.convert(any);
      }
      /**
       * Parses any value and returns the equivalent integer.
       * @param {*} any
       * @returns {*}
       */

    }, {
      key: "parseInt",
      value: function (_parseInt) {
        function parseInt(_x) {
          return _parseInt.apply(this, arguments);
        }

        parseInt.toString = function () {
          return _parseInt.toString();
        };

        return parseInt;
      }(function (any) {
        return parseInt(any) || 0;
      })
      /**
       * Parses any value and returns the equivalent float number.
       * @param {*} any
       * @returns {*}
       */

    }, {
      key: "parseFloat",
      value: function (_parseFloat) {
        function parseFloat(_x2) {
          return _parseFloat.apply(this, arguments);
        }

        parseFloat.toString = function () {
          return _parseFloat.toString();
        };

        return parseFloat;
      }(function (any) {
        return parseFloat(any) || 0;
      })
      /**
       * Parses any value and returns the equivalent boolean.
       * @param {*} any
       * @returns {*}
       */

    }, {
      key: "parseBoolean",
      value: function parseBoolean(any) {
        if (typeof any === 'undefined' || any === null) return false;else if (typeof any === 'number') return any !== 0;else if (typeof any === 'string') {
          if (any.match(INT_REGEX) || any.match(FLOAT_REGEX)) {
            return parseInt(any, 10) !== 0;
          } else if (any.match(BOOLEAN_TRUE_REGEX)) return true;else if (any.match(BOOLEAN_FALSE_REGEX)) return false;else if (/^yes$|^on$|^y$|^valid$/i.test(any)) return true;else if (/^no$|^off$|^n$|^invalid$/i.test(any)) return false;else return false;
        } else if (typeof any === 'boolean') return any;else {
          return (parseInt(any) || 0) !== 0;
        }
      }
      /**
       * @static
       * Checks if the given value is a valid date
       * @param {*} value
       * @returns {boolean}
       */

    }, {
      key: "isDate",
      value: function isDate(value) {
        if (value instanceof Date) {
          return true;
        }

        return DATE_TIME_REGEX.test(value);
      }
    }]);

    return LangUtils;
  }();
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

  var Args =
  /*#__PURE__*/
  function () {
    function Args() {
      _classCallCheck(this, Args);
    }

    _createClass(Args, null, [{
      key: "check",

      /**
       * Checks the expression and throws an exception if the condition is not met.
       * @param {*} expr
       * @param {string|Error} err
       */
      value: function check(expr, err) {
        Args.notNull(expr, "Expression");
        var res;

        if (typeof expr === 'function') {
          res = !expr.call();
        } else {
          res = !expr;
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

    }, {
      key: "notNull",
      value: function notNull(arg, name) {
        if (typeof arg === 'undefined' || arg === null) {
          throw new ArgumentError(name + " may not be null or undefined", "ENULL");
        }
      }
      /**
       * @param {*} arg
       * @param {string} name
       */

    }, {
      key: "notString",
      value: function notString(arg, name) {
        if (typeof arg !== 'string') {
          throw new ArgumentError(name + " must be a string", "EARG");
        }
      }
      /**
       * @param {*} arg
       * @param {string} name
       */

    }, {
      key: "notFunction",
      value: function notFunction(arg, name) {
        if (typeof arg !== 'function') {
          throw new ArgumentError(name + " must be a function", "EARG");
        }
      }
      /**
       * @param {*} arg
       * @param {string} name
       */

    }, {
      key: "notNumber",
      value: function notNumber(arg, name) {
        if (typeof arg !== 'number' || isNaN(arg)) {
          throw new ArgumentError(name + " must be number", "EARG");
        }
      }
      /**
       * @param {string|*} arg
       * @param {string} name
       */

    }, {
      key: "notEmpty",
      value: function notEmpty(arg, name) {
        Args.notNull(arg, name);

        if (Object.prototype.toString.bind(arg)() === '[object Array]' && arg.length === 0) {
          throw new ArgumentError(name + " may not be empty", "EEMPTY");
        } else if (typeof arg === 'string' && arg.length === 0) {
          throw new ArgumentError(name + " may not be empty", "EEMPTY");
        }
      }
      /**
       * @param {number|*} arg
       * @param {string} name
       */

    }, {
      key: "notNegative",
      value: function notNegative(arg, name) {
        Args.notNumber(arg, name);

        if (arg < 0) {
          throw new ArgumentError(name + " may not be negative", "ENEG");
        }
      }
      /**
       * @param {number|*} arg
       * @param {string} name
       */

    }, {
      key: "notPositive",
      value: function notPositive(arg, name) {
        Args.notNumber(arg, name);

        if (arg <= 0) {
          throw new ArgumentError(name + " may not be negative or zero", "EPOS");
        }
      }
    }]);

    return Args;
  }();
  /**
   * @class
   * @constructor
   */

  var TextUtils =
  /*#__PURE__*/
  function () {
    function TextUtils() {
      _classCallCheck(this, TextUtils);
    }

    _createClass(TextUtils, null, [{
      key: "toMD5",

      /**
       * Converts the given parameter to MD5 hex string
       * @static
       * @param {*} value
       * @returns {string|undefined}
       */
      value: function toMD5(value) {
        if (typeof value === 'undefined' || value === null) {
          return;
        } //browser implementation


        var md5, md5module;

        if (typeof window !== 'undefined') {
          md5module = 'blueimp-md5';
          md5 = require(md5module);

          if (typeof value === 'string') {
            return md5(value);
          } else if (value instanceof Date) {
            return md5(value.toUTCString());
          } else {
            return md5(JSON.stringify(value));
          }
        } //node.js implementation


        md5module = 'crypto';

        var crypto = require(md5module);

        md5 = crypto.createHash('md5');

        if (typeof value === 'string') {
          md5.update(value);
        } else if (value instanceof Date) {
          md5.update(value.toUTCString());
        } else {
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

    }, {
      key: "toSHA1",
      value: function toSHA1(value) {
        var cryptoModule = 'crypto';

        if (typeof window !== 'undefined') {
          throw new Error('This method is not implemented for this environment');
        }

        var crypto = require(cryptoModule);

        if (typeof value === 'undefined' || value === null) {
          return;
        }

        var sha1 = crypto.createHash('sha1');

        if (typeof value === 'string') {
          sha1.update(value);
        } else if (value instanceof Date) {
          sha1.update(value.toUTCString());
        } else {
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

    }, {
      key: "toSHA256",
      value: function toSHA256(value) {
        var cryptoModule = 'crypto';

        if (typeof window !== 'undefined') {
          throw new Error('This method is not implemented for this environment');
        }

        var crypto = require(cryptoModule);

        if (typeof value === 'undefined' || value === null) {
          return;
        }

        var sha256 = crypto.createHash('sha256');

        if (typeof value === 'string') {
          sha256.update(value);
        } else if (value instanceof Date) {
          sha256.update(value.toUTCString());
        } else {
          sha256.update(JSON.stringify(value));
        }

        return sha256.digest('hex');
      }
      /**
       * Returns a random GUID/UUID string
       * @static
       * @returns {string}
       */

    }, {
      key: "newUUID",
      value: function newUUID() {
        var chars = UUID_CHARS;
        var uuid = []; // rfc4122, version 4 form

        var r = void 0; // rfc4122 requires these characters

        uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
        uuid[14] = "4"; // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5

        for (var i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | Math.random() * 16;
            uuid[i] = chars[i === 19 ? r & 0x3 | 0x8 : r];
          }
        }

        return uuid.join("");
      }
    }]);

    return TextUtils;
  }();
  /**
   * @class
   * @constructor
   */

  var TraceUtils =
  /*#__PURE__*/
  function () {
    function TraceUtils() {
      _classCallCheck(this, TraceUtils);
    }

    _createClass(TraceUtils, null, [{
      key: "useLogger",
      value: function useLogger(logger) {
        TraceUtils._logger = logger;
      }
    }, {
      key: "level",
      value: function level(_level) {
        TraceUtils._logger.level(_level);
      }
      /**
       * @static
       * @param {...*} _data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "log",
      value: function log(_data) {
        TraceUtils._logger.log.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
      }
      /**
       * @static
       * @param {...*} _data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "error",
      value: function error(_data) {
        TraceUtils._logger.error.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
      }
      /**
       *
       * @static
       * @param {...*} _data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "info",
      value: function info(_data) {
        TraceUtils._logger.info.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
      }
      /**
       *
       * @static
       * @param {*} _data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "warn",
      value: function warn(_data) {
        TraceUtils._logger.warn.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
      }
      /**
       *
       * @static
       * @param {*} _data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "verbose",
      value: function verbose(_data) {
        TraceUtils._logger.verbose.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
      }
      /**
       *
       * @static
       * @param {...*} _data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "debug",
      value: function debug(_data) {
        TraceUtils._logger.debug.apply(TraceUtils._logger, Array.prototype.slice.call(arguments));
      }
    }]);

    return TraceUtils;
  }();
  Object.defineProperty(TraceUtils, '_logger', {
    enumerable: false,
    configurable: false,
    value: new TraceLogger()
  });
  /**
   * @class
   * @constructor
   */

  var RandomUtils =
  /*#__PURE__*/
  function () {
    function RandomUtils() {
      _classCallCheck(this, RandomUtils);
    }

    _createClass(RandomUtils, null, [{
      key: "randomChars",

      /**
       * Returns a random string based on the length specified
       * @param {Number} length
       */
      value: function randomChars(length) {
        length = length || 8;
        var chars = "abcdefghkmnopqursuvwxz2456789ABCDEFHJKLMNPQURSTUVWXYZ";
        var str = "";

        for (var i = 0; i < length; i++) {
          str += chars.substr(this.randomInt(0, chars.length - 1), 1);
        }

        return str;
      }
      /**
       * Returns a random integer between a minimum and a maximum value
       * @param {number} min
       * @param {number} max
       */

    }, {
      key: "randomInt",
      value: function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      /**
       * Returns a random string based on the length specified
       * @static
       * @param {number} length
       * @returns {string}
       */

    }, {
      key: "randomHex",
      value: function randomHex(length) {
        length = (length || 8) * 2;
        var str = "";

        for (var i = 0; i < length; i++) {
          str += HEX_CHARS.substr(this.randomInt(0, HEX_CHARS.length - 1), 1);
        }

        return str;
      }
    }]);

    return RandomUtils;
  }();
  /**
   * @class
   * @constructor
   */

  var NumberUtils =
  /*#__PURE__*/
  function () {
    function NumberUtils() {
      _classCallCheck(this, NumberUtils);
    }

    _createClass(NumberUtils, null, [{
      key: "fromBase26",

      /**
       * Converts a base-26 formatted string to the equivalent integer
       * @static
       * @param {string} s A base-26 formatted string e.g. aaaaaaaa for 0, baaaaaaa for 1 etc
       * @return {number} The equivalent integer value
       */
      value: function fromBase26(s) {
        var num = 0;

        if (!/[a-z]{8}/.test(s)) {
          throw new Error('Invalid base-26 format.');
        }

        var a = 'a'.charCodeAt(0);

        for (var i = 7; i >= 0; i--) {
          num = num * 26 + (s[i].charCodeAt(0) - a);
        }

        return num;
      }
      /**
       * Converts an integer to the equivalent base-26 formatted string
       * @static
       * @param {number} x The integer to be converted
       * @return {string} The equivalent string value
       */

    }, {
      key: "toBase26",
      value: function toBase26(x) {
        //noinspection ES6ConvertVarToLetConst
        var num = parseInt(x);

        if (num < 0) {
          throw new Error('A non-positive integer cannot be converted to base-26 format.');
        }

        if (num > 208827064575) {
          throw new Error('A positive integer bigger than 208827064575 cannot be converted to base-26 format.');
        }

        var out = "";
        var length = 1;
        var a = 'a'.charCodeAt(0);

        while (length <= 8) {
          out += String.fromCharCode(a + num % 26);
          num = Math.floor(num / 26);
          length += 1;
        }

        return out;
      }
    }]);

    return NumberUtils;
  }();
  /**
   * @class
   * @constructor
   */

  var PathUtils =
  /*#__PURE__*/
  function () {
    function PathUtils() {
      _classCallCheck(this, PathUtils);
    }

    _createClass(PathUtils, null, [{
      key: "join",

      /**
       *
       * @param {...string} _part
       * @returns {string}
       */
      // eslint-disable-next-line no-unused-vars
      value: function join(_part) {
        var pathModule = "path";

        if (IS_NODE) {
          var path = require(pathModule);

          return path.join.apply(null, Array.prototype.slice.call(arguments));
        } // Split the inputs into a list of path commands.


        var parts = [],
            i,
            l;

        for (i = 0, l = arguments.length; i < l; i++) {
          parts = parts.concat(arguments[i].split("/"));
        } // Interpret the path commands to get the new resolved path.


        var newParts = [];

        for (i = 0, l = parts.length; i < l; i++) {
          var part1 = parts[i]; // Remove leading and trailing slashes
          // Also remove "." segments

          if (!part1 || part1 === ".") continue; // Interpret ".." to pop the last segment

          if (part1 === "..") newParts.pop(); // Push new path segments.
          else newParts.push(part1);
        } // Preserve the initial slash if there was one.


        if (parts[0] === "") newParts.unshift(""); // Turn back into a single string path.

        return newParts.join("/") || (newParts.length ? "/" : ".");
      }
    }]);

    return PathUtils;
  }();
  /**
   * @private
   * @returns {string}
   */

  function timestamp() {
    return new Date().toUTCString();
  }
  /**
   * @private
   * @this TraceLogger
   * @param level
   * @param err
   */


  function writeError(level, err) {
    var keys = Object.keys(err).filter(function (x) {
      return err.hasOwnProperty(x) && x !== 'message' && typeof err[x] !== 'undefined' && err[x] != null;
    });

    if (err instanceof Error) {
      if (err.hasOwnProperty('stack')) {
        this.write(level, err.stack);
      } else {
        this.write(level, err.toString());
      }
    } else {
      this.write(level, err.toString());
    }

    if (keys.length > 0) {
      this.write(level, "Error: " + keys.map(function (x) {
        return "[" + x + "]=" + err[x].toString();
      }).join(', '));
    }
  }
  /**
   * @class
   * @param {*} options
   * @constructor
   */


  var TraceLogger =
  /*#__PURE__*/
  function () {
    function TraceLogger(options) {
      _classCallCheck(this, TraceLogger);

      this.options = {
        colors: false,
        level: "info"
      };

      if (typeof options === "undefined" && options !== null && IS_NODE) {
        if (IS_NODE && process.env.NODE_ENV === "development") {
          this.options.level = "debug";
        }
      }

      if (typeof options !== "undefined" && options !== null) {
        this.options = options; //validate logging level

        Args.check(LOG_LEVELS.hasOwnProperty(this.options.level), "Invalid logging level. Expected error, warn, info, verbose or debug.");
      }
    }
    /**
     * @param {string} level
     * @returns {*}
     */


    _createClass(TraceLogger, [{
      key: "level",
      value: function level(_level2) {
        Args.check(LOG_LEVELS.hasOwnProperty(_level2), "Invalid logging level. Expected error, warn, info, verbose or debug.");
        this.options.level = _level2;
        return this;
      }
      /**
       * @param {...*} data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "log",
      value: function log(data) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof data === 'undefined' || data === null) {
          return;
        }

        if (data instanceof Error) {
          return writeError.bind(this)("info", data);
        }

        if (typeof data !== 'string') {
          return this.write("info", data.toString());
        }

        if (args.length > 1) {
          return this.write("info", sprintf.sprintf.apply(null, args));
        }

        this.write("info", data);
      }
      /**
       * @param {...*} data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "info",
      value: function info(data) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof data === 'undefined' || data === null) {
          return;
        }

        if (data instanceof Error) {
          return writeError.bind(this)("info", data);
        }

        if (typeof data !== 'string') {
          return this.write("info", data.toString());
        }

        if (args.length > 1) {
          return this.write("info", sprintf.sprintf.apply(null, args));
        }

        this.write("info", data);
      }
      /**
       * @param {...*} data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "error",
      value: function error(data) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof data === 'undefined' || data === null) {
          return;
        }

        if (data instanceof Error) {
          return writeError.bind(this)("error", data);
        }

        if (typeof data !== 'string') {
          return this.write("error", data.toString());
        }

        if (args.length > 1) {
          return this.write("error", sprintf.sprintf.apply(null, args));
        }

        this.write("error", data);
      }
      /**
       * @param {...*} data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "warn",
      value: function warn(data) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof data === 'undefined' || data === null) {
          return;
        }

        if (data instanceof Error) {
          return writeError.bind(this)("warn", data);
        }

        if (typeof data !== 'string') {
          return this.write("warn", data.toString());
        }

        if (args.length > 1) {
          return this.write("warn", sprintf.sprintf.apply(null, args));
        }

        this.write("warn", data);
      }
      /**
       * @param {...*} data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "verbose",
      value: function verbose(data) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof data === 'undefined' || data === null) {
          return;
        }

        if (data instanceof Error) {
          return writeError.bind(this)("verbose", data);
        }

        if (typeof data !== 'string') {
          return this.write("verbose", data.toString());
        }

        if (args.length > 1) {
          return this.write("verbose", sprintf.sprintf.apply(null, args));
        }

        this.write("verbose", data);
      }
      /**
       * @param {...*} data
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "debug",
      value: function debug(data) {
        var args = Array.prototype.slice.call(arguments);

        if (typeof data === 'undefined' || data === null) {
          return;
        }

        if (data instanceof Error) {
          return writeError.bind(this)("debug", data);
        }

        if (typeof data !== 'string') {
          return this.write("debug", data.toString());
        }

        if (args.length > 1) {
          return this.write("debug", sprintf.sprintf.apply(null, args));
        }

        this.write("debug", data);
      }
    }, {
      key: "write",
      value: function write(level, text) {
        if (LOG_LEVELS[level] > LOG_LEVELS[this.options.level]) {
          return;
        } // eslint-disable-next-line no-console


        console.log(timestamp() + " [" + level.toUpperCase() + "] " + text);
      }
    }]);

    return TraceLogger;
  }();
  /**
   * @param {number} value
   * @constructor
   */

  var Base26Number =
  /*#__PURE__*/
  function () {
    function Base26Number(value) {
      _classCallCheck(this, Base26Number);

      var thisValue = value;

      this.toString = function () {
        return Base26Number.toBase26(thisValue);
      };
    }
    /**
     *
     * @param {number} x
     * @returns {string}
     */


    _createClass(Base26Number, null, [{
      key: "toBase26",
      value: function toBase26(x) {
        var num = Math.floor(x | 0);

        if (num < 0) {
          throw new Error("A non-positive integer cannot be converted to base-26 format.");
        }

        if (num > 208827064575) {
          throw new Error("A positive integer bigger than 208827064575 cannot be converted to base-26 format.");
        }

        var out = "";
        var length = 1;
        var a = "a".charCodeAt(0);

        while (length <= 8) {
          out += String.fromCharCode(a + num % 26);
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

    }, {
      key: "fromBase26",
      value: function fromBase26(s) {
        var num = 0;

        if (!/[a-z]{8}/.test(s)) {
          throw new Error("Invalid base-26 format.");
        }

        var a = "a".charCodeAt(0);

        for (var i = 7; i >= 0; i--) {
          num = num * 26 + (s[i].charCodeAt(0) - a);
        }

        return num;
      }
    }]);

    return Base26Number;
  }();
  /**
   * @class
   * @param {string=} value
   * @constructor
   */

  var Guid =
  /*#__PURE__*/
  function () {
    function Guid(value) {
      _classCallCheck(this, Guid);

      var _value;

      if (typeof value === "string") {
        // format value
        _value = value.replace(/^{/, "").replace(/{$/, ""); // and validate

        Args.check(GUID_REGEX.test(_value), "Value must be a valid UUID");
      } else {
        // generate a new guid string
        _value = TextUtils.newUUID();
      } // define property


      Object.defineProperty(this, '_value', {
        enumerable: false,
        configurable: true,
        value: test
      });
    }

    _createClass(Guid, [{
      key: "toJSON",
      value: function toJSON() {
        return this._value;
      }
    }, {
      key: "valueOf",
      value: function valueOf() {
        return this._value;
      }
    }, {
      key: "toString",
      value: function toString() {
        return this._value;
      }
      /**
       * @param {string|*} s
       * @returns {boolean}
       */

    }], [{
      key: "isGuid",
      value: function isGuid(s) {
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

    }, {
      key: "newGuid",
      value: function newGuid() {
        return new Guid();
      }
    }]);

    return Guid;
  }();
  var ArgumentError =
  /*#__PURE__*/
  function (_TypeError) {
    _inherits(ArgumentError, _TypeError);

    /**
    * @param {string} msg
    * @param {string} code
    */
    function ArgumentError(msg, code) {
      var _this;

      _classCallCheck(this, ArgumentError);

      _this.message = msg;
      _this.code = code || "ERR_ARG";

      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
      }

      return _possibleConstructorReturn(_this);
    }

    return ArgumentError;
  }(_wrapNativeSuper(TypeError));

  /**
   * @class Represents an application configuration
   * @param {string=} configPath
   * @property {*} settings
   * @constructor
   */

  var ConfigurationBase =
  /*#__PURE__*/
  function () {
    function ConfigurationBase(configPath) {
      _classCallCheck(this, ConfigurationBase);

      // set strategies
      Object.defineProperty(this, '_strategies', {
        enumerable: false,
        writable: false,
        value: {}
      }); // set configuration path

      Object.defineProperty(this, '_configurationPath', {
        enumerable: false,
        writable: false,
        value: configPath || PathUtils.join(process.cwd(), 'config')
      });
      TraceUtils.debug('Initializing configuration under %s.', this._configurationPath); // set execution path

      Object.defineProperty(this, '_executionPath', {
        enumerable: false,
        writable: false,
        value: PathUtils.join(this._configurationPath, '..')
      });
      TraceUtils.debug('Setting execution path under %s.', this._executionPath); // set config source
      // set execution path

      Object.defineProperty(this, '_config', {
        enumerable: false,
        configurable: false,
        value: {}
      }); //load default module loader strategy

      this.useStrategy(ModuleLoaderStrategy, DefaultModuleLoaderStrategy); //get configuration source

      var configSourcePath;

      try {
        var env = 'production'; //node.js mode

        if (process && process.env) {
          env = process.env['NODE_ENV'] || 'production';
        } //browser mode
        else if (window && window.env) {
            env = window.env['BROWSER_ENV'] || 'production';
          }

        configSourcePath = PathUtils.join(this._configurationPath, 'app.' + env + '.json');
        TraceUtils.debug('Validating environment configuration source on %s.', configSourcePath);
        this._config = require(configSourcePath);
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          TraceUtils.log('The environment specific configuration cannot be found or is inaccesible.');

          try {
            configSourcePath = PathUtils.join(this._configurationPath, 'app.json');
            TraceUtils.debug('Validating application configuration source on %s.', configSourcePath);
            this._config = require(configSourcePath);
          } catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
              TraceUtils.log('The default application configuration cannot be found or is inaccesible.');
            } else {
              TraceUtils.error('An error occured while trying to open default application configuration.');
              TraceUtils.error(err);
            }

            TraceUtils.debug('Initializing empty configuration');
            this._config = {};
          }
        } else {
          TraceUtils.error('An error occured while trying to open application configuration.');
          TraceUtils.error(err); //load default configuration

          this._config = {};
        }
      } //initialize settings object


      this._config['settings'] = this._config['settings'] || {};
      /**
       * @name ConfigurationBase#settings
       * @type {*}
       */

      Object.defineProperty(this, 'settings', {
        get: function get() {
          return this._config['settings'];
        },
        enumerable: true,
        configurable: false
      });
    } //noinspection JSUnusedGlobalSymbols

    /**
     * Returns the configuration source object
     * @returns {*}
     */


    _createClass(ConfigurationBase, [{
      key: "getSource",
      value: function getSource() {
        return this._config;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Returns the source configuration object based on the given path (e.g. settings.auth.cookieName or settings/auth/cookieName)
       * @param {string} p - A string which represents an object path
       * @returns {Object|Array}
       */

    }, {
      key: "getSourceAt",
      value: function getSourceAt(p) {
        return _.at(this._config, p.replace(/\//g, '.'))[0];
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Returns a boolean which indicates whether the specified  object path exists or not (e.g. settings.auth.cookieName or settings/auth/cookieName)
       * @param {string} p - A string which represents an object path
       * @returns {boolean}
       */

    }, {
      key: "hasSourceAt",
      value: function hasSourceAt(p) {
        return _.isObject(_.at(this._config, p.replace(/\//g, '.'))[0]);
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Sets the config value to the specified object path (e.g. settings.auth.cookieName or settings/auth/cookieName)
       * @param {string} p - A string which represents an object path
       * @param {*} value
       * @returns {Object}
       */

    }, {
      key: "setSourceAt",
      value: function setSourceAt(p, value) {
        return _.set(this._config, p.replace(/\//g, '.'), value);
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Sets the current execution path
       * @param {string} p
       * @returns ConfigurationBase
       */

    }, {
      key: "setExecutionPath",
      value: function setExecutionPath(p) {
        this._executionPath = p;
        return this;
      }
      /**
       * Gets the current execution path
       * @returns {string}
       */

    }, {
      key: "getExecutionPath",
      value: function getExecutionPath() {
        return this._executionPath;
      }
      /**
       * Gets the current configuration path
       * @returns {string}
       */

    }, {
      key: "getConfigurationPath",
      value: function getConfigurationPath() {
        return this._configurationPath;
      }
      /**
       * Register a configuration strategy
       * @param {Function} configStrategyCtor
       * @param {Function} strategyCtor
       * @returns ConfigurationBase
       */

    }, {
      key: "useStrategy",
      value: function useStrategy(configStrategyCtor, strategyCtor) {
        Args.notFunction(configStrategyCtor, "Configuration strategy constructor");
        Args.notFunction(strategyCtor, "Strategy constructor");
        this._strategies["$".concat(configStrategyCtor.name)] = new strategyCtor(this);
        return this;
      } //noinspection JSUnusedGlobalSymbols

      /**
       * Gets a configuration strategy
       * @param {Function} configStrategyCtor
       */

    }, {
      key: "getStrategy",
      value: function getStrategy(configStrategyCtor) {
        Args.notFunction(configStrategyCtor, "Configuration strategy constructor");
        return this._strategies["$".concat(configStrategyCtor.name)];
      }
      /**
       * Gets a configuration strategy
       * @param {Function} configStrategyCtor
       */

    }, {
      key: "hasStrategy",
      value: function hasStrategy(configStrategyCtor) {
        Args.notFunction(configStrategyCtor, "Configuration strategy constructor");
        return typeof this._strategies["$".concat(configStrategyCtor.name)] !== 'undefined';
      }
      /**
       * Gets the current configuration
       * @returns ConfigurationBase - An instance of DataConfiguration class which represents the current data configuration
       */

    }], [{
      key: "getCurrent",
      value: function getCurrent() {
        if (ConfigurationBase._currentConfiguration == null) {
          ConfigurationBase._currentConfiguration = new ConfigurationBase();
        }

        return ConfigurationBase._currentConfiguration;
      }
      /**
       * Sets the current configuration
       * @param {ConfigurationBase} configuration
       * @returns ConfigurationBase - An instance of ApplicationConfiguration class which represents the current configuration
       */

    }, {
      key: "setCurrent",
      value: function setCurrent(configuration) {
        if (configuration instanceof ConfigurationBase) {
          if (!configuration.hasStrategy(ModuleLoaderStrategy)) {
            configuration.useStrategy(ModuleLoaderStrategy, DefaultModuleLoaderStrategy);
          }

          ConfigurationBase._currentConfiguration = configuration;
          return ConfigurationBase._currentConfiguration;
        }

        throw new TypeError('Invalid argument. Expected an instance of DataConfiguration class.');
      }
    }]);

    return ConfigurationBase;
  }();
  Object.defineProperty(ConfigurationBase, '_currentConfiguration', {
    enumerable: false,
    configurable: false,
    value: null
  });
  /**
   * @class
   * @param {ConfigurationBase} config
   * @constructor
   * @abstract
   */

  var ConfigurationStrategy =
  /*#__PURE__*/
  function () {
    function ConfigurationStrategy(config) {
      _classCallCheck(this, ConfigurationStrategy);

      Args.check(this.constructor.name !== ConfigurationStrategy, new AbstractClassError());
      Args.notNull(config, 'Configuration');
      this._config = config;
    }
    /**
     * @returns {ConfigurationBase}
     */


    _createClass(ConfigurationStrategy, [{
      key: "getConfiguration",
      value: function getConfiguration() {
        return this._config;
      }
    }]);

    return ConfigurationStrategy;
  }();
  /**
   * @class
   * @constructor
   * @param {ConfigurationBase} config
   * @extends ConfigurationStrategy
   */

  var ModuleLoaderStrategy =
  /*#__PURE__*/
  function (_ConfigurationStrateg) {
    _inherits(ModuleLoaderStrategy, _ConfigurationStrateg);

    function ModuleLoaderStrategy(config) {
      _classCallCheck(this, ModuleLoaderStrategy);

      return _possibleConstructorReturn(this, _getPrototypeOf(ModuleLoaderStrategy).call(this, config));
    }

    _createClass(ModuleLoaderStrategy, [{
      key: "require",
      value: function (_require) {
        function require(_x) {
          return _require.apply(this, arguments);
        }

        require.toString = function () {
          return _require.toString();
        };

        return require;
      }(function (modulePath) {
        Args.notEmpty(modulePath, 'Module Path');

        if (!/^.\//i.test(modulePath)) {
          if (require.resolve && require.resolve.paths) {
            /**
             * get require paths collection
             * @type string[]
             */
            var paths = require.resolve.paths(modulePath); //get execution


            var path1 = this.getConfiguration().getExecutionPath(); //loop directories to parent (like classic require)

            while (path1) {
              //if path does not exist in paths collection
              if (paths.indexOf(PathUtils.join(path1, 'node_modules')) < 0) {
                //add it
                paths.push(PathUtils.join(path1, 'node_modules')); //and check the next path which is going to be resolved

                if (path1 === PathUtils.join(path1, '..')) {
                  //if it is the same with the current path break loop
                  break;
                } //otherwise get parent path


                path1 = PathUtils.join(path1, '..');
              } else {
                //path already exists in paths collection, so break loop
                break;
              }
            }

            var finalModulePath = require.resolve(modulePath, {
              paths: paths
            });

            return require(finalModulePath);
          } else {
            return require(modulePath);
          }
        }

        return require(PathUtils.join(this.getConfiguration().getExecutionPath(), modulePath));
      })
    }]);

    return ModuleLoaderStrategy;
  }(ConfigurationStrategy);
  /**
   * @classdesc
   * @extends ModuleLoaderStrategy
   */

  var DefaultModuleLoaderStrategy =
  /*#__PURE__*/
  function (_ModuleLoaderStrategy) {
    _inherits(DefaultModuleLoaderStrategy, _ModuleLoaderStrategy);

    /**
    * @param {ConfigurationBase} config
    */
    function DefaultModuleLoaderStrategy(config) {
      _classCallCheck(this, DefaultModuleLoaderStrategy);

      return _possibleConstructorReturn(this, _getPrototypeOf(DefaultModuleLoaderStrategy).call(this, config));
    }

    return DefaultModuleLoaderStrategy;
  }(ModuleLoaderStrategy);

  var HTML_END_CHAR = '>';
  var HTML_FULL_END_STRING = ' />';
  var HTML_SPACE_CHAR = ' ';
  var HTML_ATTR_STRING = '%0="%1"';
  var HTML_START_TAG_STRING = '<%0';
  var HTML_END_TAG_STRING = '</%0>';
  /**
   * @classdesc HtmlWriter class represents a helper class for rendering HTML content.
   * @class
   * @constructor
   */

  var HtmlWriter =
  /*#__PURE__*/
  function () {
    function HtmlWriter() {
      _classCallCheck(this, HtmlWriter);

      /**
       * @private
       * @type {Array}
       */
      this.bufferedAttributes = [];
      /**
       * @private
       * @type {Array}
       */

      this.bufferedTags = [];
      /**
       * @private
       * @type {String}
       */

      this.buffer = '';
      /**
       * @private
       * @type {Integer}
       */

      this.indent = true;
    } // noinspection JSUnusedGlobalSymbols

    /**
     * Writes an attribute to an array of attributes that is going to be used in writeBeginTag function
     * @param {String} name - The name of the HTML attribute
     * @param {String} value - The value of the HTML attribute
     * @returns {HtmlWriter}
     */


    _createClass(HtmlWriter, [{
      key: "writeAttribute",
      value: function writeAttribute(name, value) {
        this.bufferedAttributes.push({
          name: name,
          value: value
        });
        return this;
      } // noinspection JSUnusedGlobalSymbols

      /**
       * Writes an array of attributes to the output buffer. This attributes are going to be rendered after writeBeginTag or WriteFullBeginTag function call.
       * @param {Array|Object} obj - An array of attributes or an object that represents an array of attributes
       * @returns {HtmlWriter}
       */

    }, {
      key: "writeAttributes",
      value: function writeAttributes(obj) {
        if (obj === null) return this;

        if (Array.isArray(obj)) {
          for (var i = 0; i < obj.length; i++) {
            this.bufferedAttributes.push({
              name: obj[i].name,
              value: obj[i].value
            });
          }
        } else {
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              if (obj[prop] !== null) {
                this.bufferedAttributes.push({
                  name: prop,
                  value: obj[prop]
                });
              }
            }
          }
        }

        return this;
      } // noinspection JSUnusedGlobalSymbols

      /**
       * @param {String} tag
       * @returns {HtmlWriter}
       */

    }, {
      key: "writeBeginTag",
      value: function writeBeginTag(tag) {
        //write <TAG
        if (this.indent) {
          //this.buffer += '\n';
          this.buffer += '\t'.repeat(this.bufferedTags.length);
        }

        this.buffer += HTML_START_TAG_STRING.replace(/%0/, tag);
        this.bufferedTags.push(tag);

        if (this.bufferedAttributes.length > 0) {
          var s = '';
          this.bufferedAttributes.forEach(function (attr) {
            //write attribute='value'
            s += HTML_SPACE_CHAR;
            s += HTML_ATTR_STRING.replace(/%0/, attr.name).replace(/%1/, _.escape(attr.value));
          });
          this.buffer += s;
        }

        this.bufferedAttributes.splice(0, this.bufferedAttributes.length);
        this.buffer += HTML_END_CHAR;
        return this;
      } // noinspection JSUnusedGlobalSymbols

      /**
       * Writes a full begin HTML tag (e.g <div/>).
       * @param {String} tag
       * @returns {HtmlWriter}
       */

    }, {
      key: "writeFullBeginTag",
      value: function writeFullBeginTag(tag) {
        //write <TAG
        if (this.indent) {
          this.buffer += '\n';
          this.buffer += _.repeat('\t', this.bufferedTags.length);
        }

        this.buffer += HTML_START_TAG_STRING.replace(/%0/, tag);

        if (this.bufferedAttributes.length > 0) {
          var s = '';
          this.bufferedAttributes.forEach(function (attr) {
            //write attribute='value'
            s += HTML_SPACE_CHAR;
            s += HTML_ATTR_STRING.replace(/%0/, attr.name).replace(/%1/, _.escape(attr.value));
          });
          this.buffer += s;
        }

        this.bufferedAttributes.splice(0, this.bufferedAttributes.length);
        this.buffer += HTML_FULL_END_STRING;
        return this;
      } // noinspection JSUnusedGlobalSymbols

      /**
       * Writes an end HTML tag (e.g </div>) based on the current buffered tags.
       * @returns {HtmlWriter}
       */

    }, {
      key: "writeEndTag",
      value: function writeEndTag() {
        var tagsLength = this.bufferedTags ? this.bufferedTags.length : 0;
        if (tagsLength === 0) return this;

        if (this.indent) {
          this.buffer += '\n';
          this.buffer += _.repeat('\t', tagsLength - 1);
        }

        this.buffer += HTML_END_TAG_STRING.replace(/%0/, this.bufferedTags[tagsLength - 1]);
        this.bufferedTags.splice(tagsLength - 1, 1);
        return this;
      } // noinspection JSUnusedGlobalSymbols

      /**
       *
       * @param {String} s
       * @returns {HtmlWriter}
       */

    }, {
      key: "writeText",
      value: function writeText(s) {
        if (!s) return this;

        if (this.indent) {
          this.buffer += '\n';
          this.buffer += _.repeat('\t', this.bufferedTags.length);
        }

        this.buffer += _.escape(s);
        return this;
      }
      /**
       *
       * @param {String} s
       * @returns {HtmlWriter}
       */

    }, {
      key: "write",
      value: function write(s) {
        this.buffer += s;
        return this;
      }
      /**
       * @returns {String}
       */

    }, {
      key: "toString",
      value: function toString() {
        return this.buffer;
      } // noinspection JSUnusedGlobalSymbols

      /**
       * @param {function} fn
       */

    }, {
      key: "writeTo",
      value: function writeTo(fn) {
        if (typeof fn === 'function') {
          //call function
          fn(this.buffer); //and clear buffer

          this.buffer = ''; //and clear buffered tags

          this.bufferedTags.splice(0, this.bufferedTags.length);
        }
      }
    }]);

    return HtmlWriter;
  }();

  /**
   *
   * @class
   * @abstract
   * @param {string=} configPath
   */

  var IApplication =
  /*#__PURE__*/
  function () {
    // eslint-disable-next-line no-unused-vars
    function IApplication(_configPath) {
      _classCallCheck(this, IApplication);

      if (this.constructor === IApplication.prototype.constructor) {
        throw new AbstractClassError();
      }
    }
    /**
     * Registers an application strategy e.g. an singleton service which to be used in application contextr
     * @param {Function} serviceCtor
     * @param {Function} strategyCtor
     * @returns IApplication
     */
    // eslint-disable-next-line no-unused-vars


    _createClass(IApplication, [{
      key: "useStrategy",
      value: function useStrategy(serviceCtor, strategyCtor) {
        throw new AbstractMethodError();
      }
      /**
      * @param {Function} serviceCtor
      * @returns {boolean}
      */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "hasStrategy",
      value: function hasStrategy(serviceCtor) {
        throw new AbstractMethodError();
      }
      /**
       * Gets an application strategy based on the given base service type
       * @param {Function} serviceCtor
       * @return {*}
       */
      // eslint-disable-next-line no-unused-vars

    }, {
      key: "getStrategy",
      value: function getStrategy(serviceCtor) {
        throw new AbstractMethodError();
      }
      /**
       * @returns {ConfigurationBase}
       */

    }, {
      key: "getConfiguration",
      value: function getConfiguration() {
        throw new AbstractMethodError();
      }
    }]);

    return IApplication;
  }();
  /**
   *
   * @class
   * @abstract
   * @param {IApplication} app
   */
  // eslint-disable-next-line no-unused-vars


  var IApplicationService =
  /*#__PURE__*/
  function () {
    function IApplicationService(app) {
      _classCallCheck(this, IApplicationService);

      if (this.constructor === IApplicationService.prototype.constructor) {
        throw new AbstractClassError();
      }
    }
    /**
     * @returns {IApplication}
     */


    _createClass(IApplicationService, [{
      key: "getApplication",
      value: function getApplication() {
        throw new AbstractMethodError();
      }
    }]);

    return IApplicationService;
  }();
  /**
   * @classdesc Represents an application service
   * @class
   */
  // eslint-disable-next-line no-unused-vars


  var ApplicationService =
  /*#__PURE__*/
  function (_IApplication) {
    _inherits(ApplicationService, _IApplication);

    /**
     * @param {IApplication} app
     */
    function ApplicationService(app) {
      var _this;

      _classCallCheck(this, ApplicationService);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(ApplicationService).call(this, app));
      Object.defineProperty(_assertThisInitialized(_this), '_app', {
        enumerable: false,
        writable: false,
        value: app
      });
      return _this;
    }
    /**
     * @returns {IApplication}
     */


    _createClass(ApplicationService, [{
      key: "getApplication",
      value: function getApplication() {
        return this._app;
      }
    }]);

    return ApplicationService;
  }(IApplication);

  exports.AbstractClassError = AbstractClassError;
  exports.AbstractMethodError = AbstractMethodError;
  exports.AccessDeniedError = AccessDeniedError;
  exports.ApplicationService = ApplicationService;
  exports.Args = Args;
  exports.ArgumentError = ArgumentError;
  exports.Base26Number = Base26Number;
  exports.CodedError = CodedError;
  exports.ConfigurationBase = ConfigurationBase;
  exports.ConfigurationStrategy = ConfigurationStrategy;
  exports.DataError = DataError;
  exports.DataNotFoundError = DataNotFoundError;
  exports.DefaultModuleLoaderStrategy = DefaultModuleLoaderStrategy;
  exports.FileNotFoundError = FileNotFoundError;
  exports.Guid = Guid;
  exports.HtmlWriter = HtmlWriter;
  exports.HttpBadRequestError = HttpBadRequestError;
  exports.HttpConflictError = HttpConflictError;
  exports.HttpError = HttpError;
  exports.HttpForbiddenError = HttpForbiddenError;
  exports.HttpMethodNotAllowedError = HttpMethodNotAllowedError;
  exports.HttpNotAcceptableError = HttpNotAcceptableError;
  exports.HttpNotFoundError = HttpNotFoundError;
  exports.HttpRequestTimeoutError = HttpRequestTimeoutError;
  exports.HttpServerError = HttpServerError;
  exports.HttpServiceUnavailable = HttpServiceUnavailable;
  exports.HttpTokenExpiredError = HttpTokenExpiredError;
  exports.HttpTokenRequiredError = HttpTokenRequiredError;
  exports.HttpUnauthorizedError = HttpUnauthorizedError;
  exports.IApplication = IApplication;
  exports.IApplicationService = IApplicationService;
  exports.LangUtils = LangUtils;
  exports.ModuleLoaderStrategy = ModuleLoaderStrategy;
  exports.NotNullError = NotNullError;
  exports.NumberUtils = NumberUtils;
  exports.PathUtils = PathUtils;
  exports.RandomUtils = RandomUtils;
  exports.SequentialEventEmitter = SequentialEventEmitter;
  exports.TextUtils = TextUtils;
  exports.TraceLogger = TraceLogger;
  exports.TraceUtils = TraceUtils;
  exports.UniqueConstraintError = UniqueConstraintError;
  exports.UnknownPropertyDescriptor = UnknownPropertyDescriptor;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=themost_common.js.map
