/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {Errors as errors} from './http-error-codes';


/**
 * @classdesc Thrown when an application tries to call an abstract method.
 * @class
 */
export class AbstractMethodError extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg) {
        super(msg || 'Class does not implement inherited abstract method.');
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * @classdesc Thrown when an application tries to instantiate an abstract class.
 * @class
 */
export class AbstractClassError extends Error {
    /**
     * @param {string=} msg
     */
    constructor(msg) {
        super(msg || 'An abstract class cannot be instantiated.');
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * @classdesc Represents an error with a code.
 * @class
 */
export class CodedError extends Error {
    /**
     * @param {string} msg
     * @param {string} code
     */
    constructor(msg, code) {
        super(msg);
        this.code = code;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * @classdesc Thrown when an application tries to access a file which does not exist.
 * @class
 */
export class FileNotFoundError extends CodedError {
    /**
    * @param {string=} msg
    */
    constructor(msg) {
        super(msg | 'File not found', "EFOUND");
    }
}


/**
 * @classdesc Represents an HTTP error.
 * @class
 * @param {number} status
 * @param {string=} message
 * @param {string=} innerMessage,
 * @constructor
 * @extends CodedError
 */
export class HttpError extends CodedError {
    constructor(status, message, innerMessage) {
        super(message, "EHTTP");
        const finalStatus = (typeof status === 'number') ? parseInt(status, 10) : 500;
        const err = errors.find( x => {
            return x.statusCode === finalStatus;
        });
        if (err) {
            this.title = err.title;
            this.message = message || err.message;
            this.statusCode = err.statusCode;
        }
        else {
            this.title = 'Internal Server Error';
            this.message = message || 'The server encountered an internal error and was unable to complete the request.';
            this.statusCode = finalStatus
        }
        if (typeof innerMessage !== 'undefined') {
            this.innerMessage = innerMessage;
        }
    }

    /**
     * @deprecated This static has been deprecated and it's going to be removed. Use default constructor instead.
     * @param {Error=} err
     * @returns {HttpError}
     */
    static create(err) {
        if (err == null) {
            return new HttpError(500);
        }
        if (err.hasOwnProperty('statusCode')) {
            return Object.assign(new HttpError(err.statusCode, err.message), err);
        }
        else {
            return Object.assign(new HttpError(500, err.message), err);
        }
    }
}

/**
 * @classdesc Represents a 400 HTTP Bad Request error.
 * @class
 */
export class HttpBadRequestError extends HttpError {
    constructor(message, innerMessage) {
        super(400, message, innerMessage);
    }
}

/**
 * @classdesc Represents a 404 HTTP Not Found error.
 * @class
 * @property {string} resource - Gets or sets the requested resource which could not to be found
 */
 export class HttpNotFoundError extends HttpError {
    constructor(message, innerMessage) {
        super(404, message, innerMessage);
    }
 }
/**
 * @classdesc Represents a 405 HTTP Method Not Allowed error.
 * @class
 */
export class HttpMethodNotAllowedError extends HttpError {
    constructor(message, innerMessage) {
        super(405, message, innerMessage);
    }
}

/**
 * @classdesc Represents a 401 HTTP Unauthorized error.
 * @class
 */
export class HttpUnauthorizedError extends HttpError {
    constructor(message, innerMessage) {
        super(401, message, innerMessage);
    }
}
/**
 * @classdesc HTTP 406 Not Acceptable exception class
 * @class
 */
export class HttpNotAcceptableError extends HttpError {
    constructor(message, innerMessage) {
        super(406, message, innerMessage);
    }
}

/**
 * @classdesc HTTP 408 RequestTimeout exception class
 * @class
 */
export class HttpRequestTimeoutError extends HttpError {
    constructor(message, innerMessage) {
        super(408, message, innerMessage);
    }
}

/**
 * @classdesc HTTP 409 Conflict exception class
 * @class
 */
export class HttpConflictError extends HttpError {
    constructor(message, innerMessage) {
        super(409, message, innerMessage);
    }
}

/**
 * @classdesc HTTP 498 Token Expired exception class
 * @class
 */
export class HttpTokenExpiredError extends HttpError {
    constructor(message, innerMessage) {
        super(498, message, innerMessage);
    }
}
/**
 * @classdesc HTTP 499 Token Required exception class
 * @class
 */
export class HttpTokenRequiredError extends HttpError {
    constructor(message, innerMessage) {
        super(499, message, innerMessage);
    }
}
/**
 * @classdesc Represents a 403 HTTP Forbidden error.
 * @class
 */
export class HttpForbiddenError extends HttpError {
    constructor(message, innerMessage) {
        super(403, message, innerMessage);
    }
}
/**
 * @classdesc Represents a 500 HTTP Internal Server error.
 * @class
 */
export class HttpServerError extends HttpError {
    constructor(message, innerMessage) {
        super(500, message, innerMessage);
    }
}
/**
 * @classdesc Represents a 503 HTTP Service Unavailable.
 * @class
 */
export class HttpServiceUnavailable extends HttpError {
    constructor(message, innerMessage) {
        super(503, message, innerMessage);
    }
}
/**
 * @classdesc Extends Error object for throwing exceptions on data operations
 * @class
 * @property {string} code - A string that represents an error code e.g. EDATA
 * @property {string} message -  The error message.
 * @property {string} innerMessage - The error inner message.
 * @property {number} status - A number that represents an error status. This error status may be used for throwing the appropriate HTTP error.
 * @property {*} additionalData - Additional data associated with this error
 */
export class DataError extends CodedError {
    /**
     * @param {string=} code - A string that represents an error code
     * @param {string=} message - The error message
     * @param {string=} innerMessage - The error inner message
     * @param {string=} model - The target model
     * @param {string=} field - The target field
     * @param {*} additionalData - Additional data associated with this error
     */
    constructor(code, message, innerMessage, model, field, additionalData) {
        super(message, code);
        this.code = code || 'EDATA';
        if (typeof model !== 'undefined') {
            this.model = model;
        }
        if (typeof field !== 'undefined') {
            this.field = field;
        }
        this.message = message || 'A general data error occured.';
        if (typeof innerMessage !== 'undefined') {
            this.innerMessage = innerMessage;
        }
        this.additionalData = additionalData;
    }
}

/**
 * Thrown when an application attempts to access a data object that cannot be found.
 */
export class NotNullError extends DataError {
    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    * @param {string=} field - The target field
    */
    constructor(message, innerMessage, model, field) {
        super('ENULL', message || 'A value is required.', innerMessage, model, field);
        this.statusCode = 409;
    }
}

/**
 * @classdesc Thrown when an application attempts to access a data object that cannot be found.
 * @class
 */
export class DataNotFoundError extends DataError {
    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    */
    constructor(message, innerMessage, model) {
        super('EFOUND', message || 'The requested data was not found.', innerMessage, model);
        this.statusCode = 404;
    }
}

/**
 * @class
 * @classdesc Thrown when a data object operation is denied
 */
export class AccessDeniedError extends DataError {
    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    */
    constructor(message, innerMessage, model) {
        super('EACCESS', ('Access Denied' || message), innerMessage, model);
        this.statusCode = 401;
    }
}

/**
 * @class
 * @classdesc Thrown when a unique constraint is being violated
 */
export class UniqueConstraintError extends DataError {
    /**
    * @param {string=} message - The error message
    * @param {string=} innerMessage - The error inner message
    * @param {string=} model - The target model
    */
    constructor(message, innerMessage, model) {
        super('EUNQ', message || 'A unique constraint violated', innerMessage, model);
        this.statusCode = 409;
    }
}
