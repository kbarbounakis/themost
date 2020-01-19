import { AbstractClassError } from '@themost/common';
import { AbstractMethodError } from '@themost/common';
/**
 * @abstract
 * @constructor
 */
class DataContextEmitter {
    constructor() {
        if (this.constructor === DataContextEmitter.prototype.constructor) {
            throw new AbstractClassError();
        }
    }
    /**
     * @abstract
     */
    ensureContext() {
        throw new AbstractMethodError();
    }
}
