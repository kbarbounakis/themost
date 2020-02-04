/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import path from 'path';
import { ModuleLoader } from './ModuleLoader';
const executionPathProperty = Symbol('executionPath');
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
                return require.main.require(modulePath);
            }
            return require(modulePath);
        }
        return require(path.join(this.getExecutionPath(), modulePath));
    }
}

export {DefaultModuleLoader};