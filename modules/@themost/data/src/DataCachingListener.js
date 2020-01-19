import sprintf from 'sprintf';
import _ from 'lodash';
import { TraceUtils } from '@themost/common';
import { TextUtils } from '@themost/common';
import { DataCacheStrategy } from './DataCacheStrategy';
/**
 * @classdesc Represents a data caching listener which is going to be used while executing queries against
 * data models where data caching is enabled. This listener is registered by default.
 * @constructor
 */
class DataCachingListener {
    /**
     * Occurs before executing an query expression, validates data caching configuration and gets cached data.
     * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeExecute(event, callback) {
        try {
            if (_.isNil(event)) {
                return callback();
            }
            //validate caching
            const caching = (event.model.caching === 'always' || event.model.caching === 'conditional');
            if (!caching) {
                return callback();
            }
            // get cache attribute
            let dataCache;
            if (event.emitter && typeof event.emitter.data === 'function') {
                dataCache = event.emitter.data('cache');
            }
            // if caching is enabled and cache attribute is defined
            if (caching && typeof dataCache === 'boolean' && cache === false) {
                return callback();
            }
            //validate conditional caching
            if (event.model.caching === 'conditional') {
                if (event.emitter && typeof event.emitter.data === 'function') {
                    if (!event.emitter.data('cache')) {
                        return callback();
                    }
                }
            }
            /**
             * @type {DataCacheStrategy}
             */
            let cache = event.model.context.getConfiguration().getStrategy(DataCacheStrategy);
            if (typeof cache === 'undefined' || cache === null) {
                return callback();
            }
            if (event.query && event.query.$select) {
                //create hash
                let hash;
                if (event.emitter && typeof event.emitter.toMD5 === 'function') {
                    //get hash from emitter (DataQueryable)
                    hash = event.emitter.toMD5();
                }
                else {
                    //else calculate hash
                    hash = TextUtils.toMD5({ query: event.query });
                }
                //format cache key
                const key = '/' + event.model.name + '/?query=' + hash;
                //calculate execution time (debug)
                const logTime = new Date().getTime();
                //query cache
                cache.get(key).then(result => {
                    if (typeof result !== 'undefined') {
                        //delete expandables
                        if (event.emitter) {
                            delete event.emitter.$expand;
                        }
                        //set cached flag
                        event['cached'] = true;
                        //set execution default
                        event['result'] = result;
                        //log execution time (debug)
                        try {
                            if (process.env.NODE_ENV === 'development') {
                                TraceUtils.log(sprintf.sprintf('Cache (Execution Time:%sms):%s', (new Date()).getTime() - logTime, key));
                            }
                        }
                        catch (err) {
                            //
                        }
                        //exit
                        return callback();
                    }
                    else {
                        //do nothing and exit
                        return callback();
                    }
                }).catch(err => {
                    TraceUtils.log('DataCacheListener: An error occurred while trying to get cached data.');
                    TraceUtils.log(err);
                    return callback();
                });
            }
            else {
                return callback();
            }
        }
        catch (err) {
            return callback(err);
        }
    }
    /**
     * Occurs before executing an query expression, validates data caching configuration and stores data to cache
     * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    afterExecute(event, callback) {
        try {
            //validate caching
            const caching = (event.model.caching === 'always' || event.model.caching === 'conditional');
            if (!caching) {
                return callback();
            }
            // get cache attribute
            let dataCache;
            if (event.emitter && typeof event.emitter.data === 'function') {
                dataCache = event.emitter.data('cache');
            }
            // if caching is enabled and cache attribute is defined
            if (caching && typeof dataCache === 'boolean' && cache === false) {
                return callback();
            }
            //validate conditional caching
            if (event.model.caching === 'conditional') {
                if (event.emitter && typeof event.emitter.data === 'function') {
                    if (!event.emitter.data('cache')) {
                        return callback();
                    }
                }
            }
            /**
             * @type {DataCacheStrategy}
             */
            let cache = event.model.context.getConfiguration().getStrategy(DataCacheStrategy);
            if (typeof cache === 'undefined' || cache === null) {
                return callback();
            }
            if (event.query && event.query.$select) {
                if (typeof event.result !== 'undefined' && !event.cached) {
                    //create hash
                    let hash;
                    if (event.emitter && typeof event.emitter.toMD5 === 'function') {
                        //get hash from emitter (DataQueryable)
                        hash = event.emitter.toMD5();
                    }
                    else {
                        //else calculate hash
                        hash = TextUtils.toMD5({ query: event.query });
                    }
                    const key = '/' + event.model.name + '/?query=' + hash;
                    if (process.env.NODE_ENV === 'development') {
                        TraceUtils.debug('DataCacheListener: Setting data to cache [' + key + ']');
                    }
                    cache.add(key, event.result);
                    return callback();
                }
            }
            return callback();
        }
        catch (err) {
            return callback(err);
        }
    }
}
export {DataCachingListener};
