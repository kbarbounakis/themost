/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import _ from "lodash";

import {TraceUtils} from '@themost/common/utils';
import {LangUtils} from '@themost/common/utils';
import {DataContext} from './types';
import {DataConfigurationStrategy} from './data-configuration';
import cfg from './data-configuration';
import Symbol from 'symbol';
const nameProperty = Symbol('name');

/**
 * @classdesc Represents the default data context of MOST Data Applications.
 * The default data context uses the adapter which is registered as the default adapter in application configuration.
 * @description
 ```
 adapters: [
 ...
 { "name":"development", "invariantName":"...", "default":false,
    "options": {
      "server":"localhost",
      "user":"user",
      "password":"password",
      "database":"test"
    }
},
 { "name":"development_with_pool", "invariantName":"pool", "default":true,
    "options": {
      "adapter":"development"
    }
}
 ...
 ]
 ```
 * @class
 * @constructor
 * @augments {DataContext}
 * @property {DataAdapter} db - Gets a data adapter based on the current configuration settings.
 */
class DefaultDataContext {
    constructor() {
        /**
         * @type {DataAdapter|*}
         */
        let db_= null;
        /**
         * @name DataAdapter#hasConfiguration
         * @type {Function}
         * @param {Function} getConfigurationFunc
         */
        /**
         * @private
         */
        this.finalize_ = () => {
            if (db_)
                db_.close();
            db_=null;
        };
        const self = this;
        // set data context name with respect to DataContext implementation
        const _name = 'default';
        Object.defineProperty(this, 'name', {
           enumerable: false,
           configurable: true,
            get: function() {
                 return _name;
            }
        });

        self.getDb = () => {

            if (db_)
                return db_;
            let er;
            //otherwise load database options from configuration
            const strategy = self.getConfiguration().getStrategy(DataConfigurationStrategy);
            const adapter = _.find(strategy.adapters, x => {
                return x["default"];
            });
            if (_.isNil(adapter)) {
                er = new Error('The default data adapter is missing.'); er.code = 'EADAPTER';
                throw er;
            }
            /**
             * @type {*}
             */
            const adapterType = strategy.adapterTypes[adapter.invariantName];
            //validate data adapter type
            if (_.isNil(adapterType)) {
                er = new Error('Invalid adapter type.'); er.code = 'EADAPTER';
                throw er;
            }
            if (typeof adapterType.createInstance !== 'function') {
                er= new Error('Invalid adapter type. Adapter initialization method is missing.'); er.code = 'EADAPTER';
                throw er;
            }
            //otherwise load adapter
            /**
             * @type {DataAdapter|*}
             */
            db_ = adapterType.createInstance(adapter.options);
            if (typeof db_.hasConfiguration === 'function') {
                db_.hasConfiguration(() => {
                   return self.getConfiguration();
                });
            }
            return db_;
        };

        self.setDb = value => {
            /**
             * @type {DataAdapter|*}
             */
            db_ = value;
            if (db_) {
                if (typeof db_.hasConfiguration === 'function') {
                    db_.hasConfiguration(() => {
                        return self.getConfiguration();
                    });
                }
            }
        };

        delete self.db;

        Object.defineProperty(self, 'db', {
            get: function() {
                return self.getDb();
            },
            set: function(value) {
                self.setDb(value);
            },
            configurable: true,
            enumerable:false });
    }

    /**
     * Gets an instance of DataConfiguration class which is associated with this data context
     * @returns {ConfigurationBase|*}
     */
    getConfiguration() {
        return cfg.current;
    }

    /**
     * Gets an instance of DataModel class based on the given name.
     * @param name {string} - A string that represents the model name.
     * @returns {DataModel} - An instance of DataModel class associated with this data context.
     */
    model(name) {
        const self = this;
        if ((name === null) || (name === undefined))
            return null;
        const obj = self.getConfiguration().getStrategy(DataConfigurationStrategy).model(name);
        if (_.isNil(obj))
            return null;
        const DataModel = require('./data-model').DataModel;
        const model = new DataModel(obj);
        //set model context
        model.context = self;
        //return model
        return model;
    }

    /**
     * Finalizes the current data context
     * @param {Function} cb - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     */
    finalize(cb) {
        cb = cb || (() => {});
        this.finalize_();
        cb.call(this);
    }
}

LangUtils.inherits(DefaultDataContext, DataContext);

/**
 * @classdesc Represents a data context based on a data adapter's name.
 * The specified adapter name must be registered in application configuration.
 * @class
 * @constructor
 * @augments DataContext
 * @property {DataAdapter} db - Gets a data adapter based on the given adapter's name.
 */
class NamedDataContext {
    constructor(name) {
        NamedDataContext.super_.bind(this)();
        /**
         * @type {DataAdapter}
         * @private
         */
        let db_;
        /**
         * @private
         */
        this.finalize_ = () => {
            try {
                if (db_)
                    db_.close();
            }
            catch(err) {
                TraceUtils.debug('An error occurred while closing the underlying database context.');
                TraceUtils.debug(err);
            }
            db_ = null;
        };
        const self = this;
        self[nameProperty] = name;

        self.getDb = () => {
            if (db_)
                return db_;
            const strategy = self.getConfiguration().getStrategy(DataConfigurationStrategy);
            //otherwise load database options from configuration
            const adapter = strategy.adapters.find(x => {
                return x.name === self[nameProperty];
            });
            let er;
            if (typeof adapter ==='undefined' || adapter===null) {
                er = new Error('The specified data adapter is missing.'); er.code = 'EADAPTER';
                throw er;
            }
            //get data adapter type
            const adapterType = strategy.adapterTypes[adapter.invariantName];
            //validate data adapter type
            if (_.isNil(adapterType)) {
                er = new Error('Invalid adapter type.'); er.code = 'EADAPTER';
                throw er;
            }
            if (typeof adapterType.createInstance !== 'function') {
                er= new Error('Invalid adapter type. Adapter initialization method is missing.'); er.code = 'EADAPTER';
                throw er;
            }
            //otherwise load adapter
            db_ = adapterType.createInstance(adapter.options);
            if (typeof db_.hasConfiguration === 'function') {
                db_.hasConfiguration(() => {
                    return self.getConfiguration();
                });
            }
            return db_;
        };

        /**
         * @param {DataAdapter|*} value
         */
        self.setDb = value => {
            db_ = value;
            if (db_) {
                if (typeof db_.hasConfiguration === 'function') {
                    db_.hasConfiguration(() => {
                        return self.getConfiguration();
                    });
                }
            }

        };

        /**
         * @name NamedDataContext#db
         * @type {DataAdapter}
         */

        Object.defineProperty(self, 'db', {
            get : function() {
                return self.getDb();
            },
            set : function(value) {
                self.setDb(value);
            },
            configurable : true,
            enumerable:false });

        /**
         * @name NamedDataContext#name
         * @type {string}
         */
        Object.defineProperty(self, 'name', {
            get: function () {
                return self[nameProperty];
            }
        });

    }

    /**
     * Gets a string which represents the name of this context
     * @returns {string}
     */
    getName() {
        return this[nameProperty];
    }

    /**
     * Gets an instance of DataConfiguration class which is associated with this data context
     * @returns {DataConfiguration}
     */
    getConfiguration() {
        return cfg.getNamedConfiguration(this.name);
    }

    /**
     * Gets an instance of DataModel class based on the given name.
     * @param name {string} - A string that represents the model name.
     * @returns {DataModel} - An instance of DataModel class associated with this data context.
     */
    model(name) {
        const self = this;
        if ((name === null) || (name === undefined))
            return null;
        const obj = self.getConfiguration().getStrategy(DataConfigurationStrategy).model(name);
        if (_.isNil(obj))
            return null;
        const DataModel = require('./data-model').DataModel;
        const model = new DataModel(obj);
        //set model context
        model.context = self;
        //return model
        return model;

    }

    finalize(cb) {
        cb = cb || (() => {});
        this.finalize_();
        cb.call(this);
    }
}

LangUtils.inherits(NamedDataContext, DataContext);


if (typeof exports !== 'undefined')
{
    module.exports.DefaultDataContext = DefaultDataContext;
    module.exports.NamedDataContext = NamedDataContext;
}
