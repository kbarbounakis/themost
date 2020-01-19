/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import _ from 'lodash';

const types = { };

/**
 * @classdesc Represents the event arguments of a data model listener.
 * @class
 * @constructor
 * @property {DataModel|*} model - Represents the underlying model.
 * @property {DataObject|*} target - Represents the underlying data object.
 * @property {Number|*} state - Represents the operation state (Update, Insert, Delete).
 * @property {DataQueryable|*} emitter - Represents the event emitter, normally a DataQueryable object instance.
 * @property {*} query - Represents the underlying query expression. This property may be null.
 * @property {DataObject|*} previous - Represents the underlying data object.
 */
class DataEventArgs {
    //
}

/**
 * @classdesc Represents a data model's listener
 * @class
 * @constructor
 * @abstract
  */
class DataEventListener {
    /**
     * Occurs before executing a data operation. The event arguments contain the query that is going to be executed.
     * @param {DataEventArgs} e - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    // eslint-disable-next-line no-unused-vars
    beforeExecute(e, cb) {
        return cb();
    }

    /**
     * Occurs after executing a data operation. The event arguments contain the executed query.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    // eslint-disable-next-line no-unused-vars
    afterExecute(event, cb) {
        return cb();
    }

    /**
     * Occurs before creating or updating a data object.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    // eslint-disable-next-line no-unused-vars
    beforeSave(event, cb) {
        return cb();
    }

    /**
     * Occurs after creating or updating a data object.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    // eslint-disable-next-line no-unused-vars
    afterSave(event, cb) {
        return cb();
    }

    /**
     * Occurs before removing a data object.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     * @returns {DataEventListener}
     */
    // eslint-disable-next-line no-unused-vars
    beforeRemove(event, cb) {
        return cb();
    }

    /**
     * Occurs after removing a data object.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    // eslint-disable-next-line no-unused-vars
    afterRemove(event, cb) {
        return cb();
    }

    /**
     * Occurs after upgrading a data model.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} cb - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    // eslint-disable-next-line no-unused-vars
    afterUpgrade(event, cb) {
        return cb();
    }
}

const DateTimeRegex = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/g;
const BooleanTrueRegex = /^true$/ig;
const BooleanFalseRegex = /^false$/ig;
/*
var NullRegex = /^null$/ig;
var UndefinedRegex = /^undefined$/ig;
*/
const IntegerRegex =/^[-+]?\d+$/g;
const FloatRegex =/^[+-]?\d+(\.\d+)?$/g;


/**
 * @class
 * @constructor
 * @property {string} name - Gets or sets a short description for this listener
 * @property {string} type - Gets or sets a string which is the path of the module that exports this listener.
 * @property {boolean} disabled - Gets or sets a boolean value that indicates whether this listener is disabled or not. The default value is false.
 * @description
 * <p>
 * A data model uses event listeners as triggers which are automatically executed after data operations.
 * Those listeners are defined in [eventListeners] section of a model's schema.
 * </p>
 * <pre class="prettyprint">
 *<code>
*     {
*          ...
*          "fields": [ ... ],
*          ...
*          "eventListeners": [
*              { "name":"Update Listener", "type":"/app/controllers/an-update-listener.js" },
*              { "name":"Another Update Listener", "type":"module-a/lib/listener" }
*          ]
*          ...
*     }
 *</code>
 * </pre>
 * @example
 * // A simple DataEventListener that sends a message to sales users after new order was arrived.
 * var web = require("most-web");
 exports.afterSave = function(event, callback) {
    //exit if state is other than [Insert]
    if (event.state != 1) { return callback() }
    //initialize web mailer
    var mm = require("most-web-mailer"), context = event.model.context;
    //send new order mail template by passing new item data
    mm.mailer(context).to("sales@example.com")
        .cc("supervisor@example.com")
        .subject("New Order")
        .template("new-order").send(event.target, function(err) {
        if (err) { return web.common.log(err); }
        return callback();
    });
};
 *
 */
class DataModelEventListener {

}
/**
 * An enumeration of tha available privilege types
 * @enum
 */
const PrivilegeType = {
    /**
     * Self Privilege (self).
     * @type {string}
     */
    Self: 'self',
    /**
     * Parent Privilege (parent)
     * @type {string}
     */
    Parent: 'parent',
    /**
     * Item Privilege (child)
     * @type {string}
     */
    Item: 'item',
    /**
     * Global Privilege (global)
     * @type {string}
     */
    Global: 'global'
};

/**
 * Represents a query result when this query uses paging parameters.
 * @class
 * @property {number} total - The total number of records
 * @property {number} skip - The number of skipped records
 * @property {Array} value - An array of objects which represents the query results.
 * @constructor
  */
class DataResultSet {
    constructor() {
        this.total = 0;
        this.skip = 0;
        this.value = [];
    }
}

/**
 * An enumeration of the available data object states
 * @enum {number}
 */
const DataObjectState = {
    /**
     * Insert State (1)
     */
    Insert:1,
    /**
     * Update State (2)
     */
    Update:2,
    /**
     * Delete State (4)
     */
    Delete:4
};

/**
 * An enumeration of the available data caching types
 * @enum {string}
 */
const DataCachingType = {
    /**
     * Data will never be cached (none)
     */
    None: 'none',
    /**
     * Data will always be cached (always)
     */
    Always: 'always',
    /**
     * Data will conditionally be cached (conditional)
     */
    Conditional: 'conditional'
};

const parsers = {
    parseInteger: function(val) {
        if (_.isNil(val))
            return 0;
        else if (typeof val === 'number')
            return val;
        else if (typeof val === 'string') {
            if (val.match(IntegerRegex) || val.match(FloatRegex)) {
                return parseInt(val, 10);
            }
            else if (val.match(BooleanTrueRegex))
                return 1;
            else if (val.match(BooleanFalseRegex))
                return 0;
        }
        else if (typeof val === 'boolean')
            return val===true ? 1 : 0;
        else {
            return parseInt(val) || 0;
        }
    },
    parseCounter: function(val) {
        return types.parsers.parseInteger(val);
    },
    parseFloat: function(val) {
        if (_.isNil(val))
            return 0;
        else if (typeof val === 'number')
            return val;
        else if (typeof val === 'string') {
            if (val.match(IntegerRegex) || val.match(FloatRegex)) {
                return parseFloat(val);
            }
            else if (val.match(BooleanTrueRegex))
                return 1;
        }
        else if (typeof val === 'boolean')
            return val===true ? 1 : 0;
        else {
            return parseFloat(val);
        }
    },
    parseNumber: function(val) {
        return types.parsers.parseFloat(val);
    },
    parseDateTime: function(val) {
        if (_.isNil(val))
            return null;
        if (val instanceof Date)
            return val;
        if (typeof val === 'string') {
            if (val.match(DateTimeRegex))
                return new Date(Date.parse(val));
        }
        else if (typeof val === 'number') {
            return new Date(val);
        }
        return null;
    },
    parseDate: function(val) {
        const res = types.parsers.parseDateTime(val);
        if (res instanceof Date) {
            res.setHours(0,0,0,0);
            return res;
        }
        return res;
    },
    parseBoolean: function(val) {
        return (types.parsers.parseInteger(val)!==0);
    },
    parseText: function(val) {
        if (_.isNil(val))
            return val;
        else if (typeof val === 'string') {
            return val;
        }
        else {
            return val.toString();
        }
    }
};

export {
    parsers,
    PrivilegeType,
    DataObjectState,
    DataCachingType,
    DataEventArgs,
    DataEventListener,
    DataResultSet,
    DataModelEventListener
}