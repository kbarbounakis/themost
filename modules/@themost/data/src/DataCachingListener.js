import sprintf from 'sprintf';
import _ from 'lodash';
import { TraceUtils } from '@themost/common';
import { TextUtils } from '@themost/common';
/**
 * @classdesc Represents a data caching listener which is going to be used while executing queries against
 * data models where data caching is enabled. This listener is registered by default.
 <p>
      Data caching may be disabled when <a href="DataModel.html">DataModel</a>.caching property is set to 'none'. This is the default behaviour of a data model.
 </p>
 <pre class="prettyprint"><code>
 {
     "name": "Order", ... , "caching":"none"
     ...
 }
 </code></pre>
 <p>
 Data caching may be used when <a href="DataModel.html">DataModel</a>.caching property is set to 'always'.
 </p>
 <pre class="prettyprint"><code>
 {
     "name": "OrderStatus", ... , "caching":"always"
     ...
 }
 </code></pre>
 <p>
 Data caching may be conditionally enabled when <a href="DataModel.html">DataModel</a>.caching property is set to 'conditional'.
 </p>
 <pre class="prettyprint"><code>
 {
     "name": "Product", ... , "caching":"conditional"
     ...
 }
 </code></pre>
 <p>
 In this case, data caching will be used when an instance of <a href="DataQueryable.html">DataQueryable</a> class requests data with cache equal to true:
 </p>
 <pre class="prettyprint"><code>
    context.model('Product')
            .where('category').is('Laptops')
            .cache(true)
            .orderBy('name')
            .list().then(function(result) {
                done(null, result);
            }).catch(function(err) {
                done(err);
            });
 </code></pre>
 * @class
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
            var cache = event.model.context.getConfiguration().getStrategy(DataCacheStrategy);
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
            var cache = event.model.context.getConfiguration().getStrategy(DataCacheStrategy);
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
