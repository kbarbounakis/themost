import { AbstractMethodError } from '@themost/common';
import { ConfigurationStrategy } from '@themost/common';
/**
 *
 * @param {ConfigurationBase} config
 * @constructor
 *
 */
class DataCacheStrategy extends ConfigurationStrategy {
    constructor(config) {
        super(config);
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
export {DataCacheStrategy};