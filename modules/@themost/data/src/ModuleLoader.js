/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

/**
 * @class
 * @constructor
 * @abstract
 */
class ModuleLoader {
    constructor() {
        if (this.constructor.name === 'ModuleLoader') {
            throw new Error('An abstract class cannot be instantiated.');
        }
    }

    /**
     * @param {string} modulePath
     * @returns {*}
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    require(modulePath) {
        throw new Error('Class does not implement inherited abstract method.');
    }
}

export {ModuleLoader};
