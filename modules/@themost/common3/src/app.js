/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {AbstractMethodError} from './errors';
import {AbstractClassError} from './errors';

/**
 *
 * @class
 * @abstract
 * @param {string=} configPath
 */
class IApplication {
    // eslint-disable-next-line no-unused-vars
    constructor(_configPath) {
        if (this.constructor === IApplication.prototype.constructor) {
            throw new AbstractClassError();
        }
    }

    /**
     * Registers an application strategy e.g. an singleton service which to be used in application contextr
     * @param {Function} serviceCtor
     * @param {Function} strategyCtor
     * @returns IApplication
     */
    // eslint-disable-next-line no-unused-vars
    useStrategy(serviceCtor, strategyCtor) {
        throw new AbstractMethodError();
    }

    /**
    * @param {Function} serviceCtor
    * @returns {boolean}
    */
    // eslint-disable-next-line no-unused-vars
    hasStrategy(serviceCtor) {
        throw new AbstractMethodError();
    }

    /**
     * Gets an application strategy based on the given base service type
     * @param {Function} serviceCtor
     * @return {*}
     */
    // eslint-disable-next-line no-unused-vars
    getStrategy(serviceCtor) {
        throw new AbstractMethodError();
    }

    /**
     * @returns {ConfigurationBase}
     */
    getConfiguration() {
        throw new AbstractMethodError();
    }
}

/**
 *
 * @class
 * @abstract
 * @param {IApplication} app
 */
// eslint-disable-next-line no-unused-vars
class IApplicationService {
    // eslint-disable-next-line no-unused-vars
    constructor(app) {
        if (this.constructor === IApplicationService.prototype.constructor) {
            throw new AbstractClassError();
        }
    }
    /**
     * @returns {IApplication}
     */
    getApplication() {
        throw new AbstractMethodError();
    }
}


/**
 * @classdesc Represents an application service
 * @class
 */
// eslint-disable-next-line no-unused-vars
class ApplicationService extends IApplication {
    /**
     * @param {IApplication} app
     */
    constructor(app) {
        super(app);
        Object.defineProperty(this, '_app', {
            enumerable: false,
            writable: false,
            value: app
        });
    }

    /**
     * @returns {IApplication}
     */
    getApplication() {
        return this._app;
    }
}

export {IApplication};
export {IApplicationService};
export {ApplicationService};
