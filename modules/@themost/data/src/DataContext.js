import { SequentialEventEmitter } from '@themost/common';
import { AbstractClassError } from '@themost/common';
import { AbstractMethodError } from '@themost/common';
/**
 * @classdesc Represents the main data context.
 * @class
 * @augments SequentialEventEmitter
 * @constructor
 * @abstract
 */
class DataContext extends SequentialEventEmitter {
    constructor() {
        super();
        //throw abstract class error
        if (this.constructor === DataContext.prototype.constructor) {
            throw new AbstractClassError();
        }
        /**
         * @property db
         * @description Gets the current database adapter
         * @type {DataAdapter}
         * @memberOf DataContext#
         */
        Object.defineProperty(this, 'db', {
            get: function () {
                return null;
            },
            configurable: true,
            enumerable: false
        });
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * Gets a data model based on the given data context
     * @param name {string} A string that represents the model to be loaded.
     * @returns {DataModel}
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    model(name) {
        throw new AbstractMethodError();
    }
    /**
     * Gets an instance of DataConfiguration class which is associated with this data context
     * @returns {ConfigurationBase}
     * @abstract
     */
    getConfiguration() {
        throw new AbstractMethodError();
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * @param {Function} callback
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    finalize(callback) {
        throw new AbstractMethodError();
    }
}
export {DataContext};