/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import _ from 'lodash';
import {LangUtils} from "@themost/common/utils";
import {Args} from "@themost/common/utils";
import {SequentialEventEmitter} from "@themost/common/emitter";
import {AbstractMethodError} from '@themost/common/errors';
import {ConfigurationStrategy} from '@themost/common/config';
import Symbol from "symbol";
import Q from 'q';
const currentProperty = Symbol("current");
const CACHE_ABSOLUTE_EXPIRATION = 1200;

/**
 * @class
 * @classdesc Implements data cache mechanisms in MOST Data Applications.
 * DataCache class is used as the internal data caching engine, if any other caching mechanism is not defined.
 * @property {Number} ttl - An amount of time in seconds which is the default cached item lifetime.
 * @constructor
 * @augments SequentialEventEmitter
 * @deprecated
 */
class DataCache {
    constructor() {
        // noinspection JSUnusedGlobalSymbols
        this.initialized = false;
    }

    /**
     * Initializes data caching.
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     *
     * @example
     var d = require("most-data");
     //try to find article with id 100 in cache
     d.cache.current.init(function(err) {
        done(err);
     };
     */
    init(callback) {
        try {
            if (this.initialized) {
                callback();
                return;
            }
            const NodeCache = require( "node-cache" );
            this.rawCache = new NodeCache();
            this.initialized = true;
            callback();
        }
        catch (e) {
            callback(e);
        }
    }

    /**
     * Removes a cached value.
     * @param {string} key - A string that represents the key of the cached value
     * @param {function(Error=)=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     *
     * @example
     var d = require("most-data");
     //try to find article with id 100 in cache
     d.cache.current.remove('/Article/100', function(err) {
        done(err);
     };
     */
    remove(key, callback) {
        const self = this;
        callback = callback || (() => {});
        self.init(err => {
            if (err) {
                callback(err);
            }
            else {
                self.rawCache.set(key, callback);
            }
        });
    }

    /**
     * Flush all cached data.
     * @param {function(Error=)=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     *
     * @example
     var d = require("most-data");
     //try to find article with id 100 in cache
     d.cache.current.removeAll(function(err) {
        done(err);
     };
     */
    removeAll(callback) {
        const self = this;
        callback = callback || (() => {});
        self.init(err => {
            if (err) {
                callback(err);
            }
            else {
                self.rawCache.flushAll();
                callback();
            }
        });
    }

    /**
     * Sets a key value pair in cache.
     * @param {string} key - A string that represents the key of the cached value
     * @param {*} value - The value to be cached
     * @param {number=} ttl - A TTL in seconds. This parameter is optional.
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred and the second argument will return true on success.
     *
     * @example
     var d = require("most-data");
     d.cache.current.add('/User/100', { "id":100,"name":"user1@example.com","description":"User #1" }, 1200, function(err) {
        done(err);
     });
     */
    add(key, value, ttl, callback) {
        const self = this;
        callback = callback || (() => {});
        self.init(err => {
            if (err) {
                callback(err);
            }
            else {
                self.rawCache.set(key, value, ttl, callback);
            }
        });
    }

    /**
     * Gets data from cache or executes the defined function and adds the result to the cache with the specified key
     * @param {string|*} key - A string that represents the of the cached data
     * @param {function(function(Error=,*=))} fn - A function to execute if data will not be found in cache
     * @param {function(Error=,*=)} callback - A callback function where the first argument will contain the Error object if an error occurred and the second argument will contain the result.
     * @example
     var d = require("most-data");
     //try to find user with id 100 in cache
     d.cache.current.ensure('/User/100', function(cb) {
            //otherwise get user from database
          context.model('User').where('id').equal(100).first().then(function(result) {
            cb(null, result);
          }).catch(function(err) {
            cb(err);
          }
     }, function(err, result) {
        //and finally return the result
        done(err,result);
     };
     */
    ensure(key, fn, callback) {
        const self = this;
        callback = callback || (() => {});
        if (typeof fn !== 'function') {
            callback(new Error('Invalid argument. Expected function.'));
            return;
        }
        //try to get from cache
        self.get(key, (err, result) => {
            if (err) { callback(err); return; }
            if (typeof result !== 'undefined') {
                callback(null, result);
            }
            else {
                //execute fn
                fn((err, result) => {
                    if (err) { callback(err); return; }
                    self.add(key, (typeof result === 'undefined') ? null: result, self.ttl, () => {
                        callback(null, result);
                    });
                });
            }
        });
    }

    /**
     * Gets a cached value defined by the given key.
     * @param {string|*} key - A string that represents the key of the cached value
     * @param {function(Error=,*=)} callback - A callback function where the first argument will contain the Error object if an error occurred and the second argument will contain the result.
     *
     * @example
     var d = require("most-data");
     //try to find article with id 100 in cache
     d.cache.current.get('/Article/100', function(err, result) {
        done(err,result);
     };
     */
    get(key, callback) {
        const self = this;
        callback = callback || (() => {});
        if (_.isNil(key)) {
            return callback();
        }
        self.init(err => {
            if (err) {
                callback(err);
            }
            else {
                self.rawCache.get(key, (err, value) => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (typeof value[key] !== 'undefined') {
                            callback(null, value[key]);
                        }
                        else {
                            callback();
                        }
                    }
                });
            }
        });
    }

    /**
     * @returns DataCache
     */
    static getCurrent() {
        if (typeof global !== 'undefined' || global !== null) {
            const app = global.application;
            if (app) {
                //and if this application has a cache object
                if (app.cache) {
                    //use this cache
                    return app.cache;
                }
            }
        }
        if (DataCache[currentProperty]) {
            return DataCache[currentProperty];
        }
        DataCache[currentProperty] = new DataCache();
        return DataCache[currentProperty];
    }
}

LangUtils.inherits(DataCache, SequentialEventEmitter);

/**
 *
 * @param {ConfigurationBase} config
 * @constructor
 *
 */
class DataCacheStrategy {
    constructor(config) {
        DataCacheStrategy.super_.bind(this)(config);
    }

    /**
     * Sets a key value pair in cache.
     * @abstract
     * @param {string} key - A string that represents the key of the cached value
     * @param {*} value - The value to be cached
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    add(key, value, absoluteExpiration) {
        throw new AbstractMethodError();
    }

    /**
     * Removes a cached value.
     * @abstract
     * @param {string} key - A string that represents the key of the cached value to be removed
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    remove(key) {
        throw new AbstractMethodError();
    }

    /**
     * Flush all cached data.
     * @abstract
     * @returns {Promise|*}
     */
    clear() {
        throw new AbstractMethodError();
    }

    /**
     * Gets a cached value defined by the given key.
     * @param {string} key
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    get(key) {
        throw new AbstractMethodError();
    }

    /**
     * Gets data from cache or executes the defined function and adds the result to the cache with the specified key
     * @param {string|*} key - A string which represents the key of the cached data
     * @param {Function} getFunc - A function to execute if data will not be found in cache
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    getOrDefault(key, getFunc, absoluteExpiration) {
        throw new AbstractMethodError();
    }
}

LangUtils.inherits(DataCacheStrategy, ConfigurationStrategy);

/**
 *
 * @param {ConfigurationBase} config
 * @constructor
 *
 */
class DefaultDataCacheStrategy {
    constructor(config) {
        DefaultDataCacheStrategy.super_.bind(this)(config);
        const NodeCache = require( "node-cache" );
        let expiration = CACHE_ABSOLUTE_EXPIRATION;
        const absoluteExpiration = LangUtils.parseInt(config.getSourceAt('settings/cache/absoluteExpiration'));
        if (absoluteExpiration>0) {
            expiration = absoluteExpiration;
        }
        this.rawCache = new NodeCache({
            stdTTL:expiration
        });
    }

    /**
     * Sets a key value pair in cache.
     * @param {string} key - A string that represents the key of the cached value
     * @param {*} value - The value to be cached
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    add(key, value, absoluteExpiration) {
        const self = this;
        return Q.Promise((resolve, reject) => {
            self.rawCache.set(key, value, absoluteExpiration, err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    /**
     * Gets a cached value defined by the given key.
     * @param {string} key
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    get(key) {
        const self = this;
        return Q.Promise((resolve, reject) => {
            self.rawCache.get(key, (err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res[key]);
            });
        });
    }

    /**
     * Removes a cached value.
     * @param {string} key - A string that represents the key of the cached value to be removed
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    remove(key) {
        const self = this;
        return Q.Promise((resolve, reject) => {
            self.rawCache.del(key, (err, count) => {
                if (err) {
                    return reject(err);
                }
                return resolve(count);
            });
        });
    }

    /**
     * Flush all cached data.
     * @returns {Promise|*}
     */
    clear() {
        const self = this;
        return Q.Promise((resolve, reject) => {
            self.rawCache.flushAll((err, count) => {
                if (err) {
                    return reject(err);
                }
                return resolve(count);
            });
        });
    }

    /**
     * Gets data from cache or executes the defined function and adds the result to the cache with the specified key
     * @param {string|*} key - A string which represents the key of the cached data
     * @param {Function} getFunc - A function to execute if data will not be found in cache
     * @param {number=} absoluteExpiration - An absolute expiration time in seconds. This parameter is optional.
     * @returns {Promise|*}
     */
    // eslint-disable-next-line no-unused-vars
    getOrDefault(key, getFunc, absoluteExpiration) {
        const self = this;
        return Q.Promise((resolve, reject) => {
            //try to get from cache
            self.rawCache.get(key, (err, result) => {
                if (err) {
                    return reject(err);
                }
                else if (typeof result !== 'undefined' && result.hasOwnProperty(key)) {
                    return resolve(result[key]);
                }
                else {
                    try {
                        //execute function and validate promise
                        const source = getFunc();
                        Args.check(typeof source !== 'undefined' && typeof source.then === 'function', 'Invalid argument. Expected a valid promise.');
                        return source.then(res => {
                            if (_.isNil(res)) {
                                return resolve();
                            }
                            return self.rawCache.set(key, res, absoluteExpiration, err => {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve(res);
                            });
                        });
                    }
                    catch(err) {
                        return reject(err);
                    }
                }
            });
        });
    }
}

LangUtils.inherits(DefaultDataCacheStrategy, DataCacheStrategy);


if (typeof exports !== 'undefined') {

    module.exports.DataCache = DataCache;
    module.exports.DataCacheStrategy = DataCacheStrategy;
    module.exports.DefaultDataCacheStrategy = DefaultDataCacheStrategy;
}