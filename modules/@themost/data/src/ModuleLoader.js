/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import path from 'path';
const executionPathProperty = Symbol('executionPath');

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

/**
 * @class
 * @param {string} executionPath
 * @constructor
 * @augments ModuleLoader
 * @extends ModuleLoader
 */
class DefaultModuleLoader extends ModuleLoader {
    constructor(executionPath) {
        super();
        this[executionPathProperty] = path.resolve(executionPath) || process.cwd();
    }

    getExecutionPath() {
        return this[executionPathProperty];
    }

    /**
     * @param {string} modulePath
     * @returns {*}
     */
    require(modulePath) {
        if (!/^.\//i.test(modulePath)) {
            //load module which is not starting with ./
            if (require.main && typeof require.main.require === 'function') {
                return require.main.require(modulePath)
            }
            return require(modulePath);
        }
        return require(path.join(this.getExecutionPath(),modulePath));
    }
}
export {DefaultModuleLoader, ModuleLoader};
