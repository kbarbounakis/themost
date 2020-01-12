/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {Args} from '@themost/common';
import { HttpConfiguration } from './HttpConfiguration';

 class HttpApplication {

    constructor() {

        /**
         * @property
         * @private
         * @type {*}
         * @name HttpApplication#_services
         */

        Object.defineProperty(this, '_services', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: { }
        });
        // set application configuration
        Object.defineProperty(this, 'configuration', {
            configurable: true,
            enumerable: true,
            writable: false,
            value: new HttpConfiguration()
        });

    }

    getConfiguration() {
        return this.configuration;
    }

    runtime() {
    }

    useStrategy(serviceCtor, strategyCtor) {
        // validate params
        Args.notFunction(serviceCtor,'Service constructor');
        Args.notFunction(strategyCtor,'Strategy constructor');
        Object.defineProperty(this._services, serviceCtor.name, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: new strategyCtor(this)
        });
        return this;
    }

    useService(serviceCtor) {
        return this.useStrategy(serviceCtor, serviceCtor)
    }

    hasStrategy(strategyCtor) {
        Args.notFunction(strategyCtor,'Strategy constructor');
        const keys = Object.keys(this._services);
        for (let i=0; i<keys.length; i++) {
            const key = keys[i];
            if (Object.prototype.hasOwnProperty.call(this._services, key)) {
                const serviceStrategyCtor = this._services[key];
                if (serviceStrategyCtor.constructor && strategyCtor.name === serviceStrategyCtor.constructor.name) {
                    return true;
                }
            }
        }
        return false;
    }

    hasService(serviceCtor) {
        Args.notFunction(serviceCtor, 'Service constructor');
        Args.notNull(serviceCtor.name, 'Service name');
        return Object.prototype.hasOwnProperty.call(this._services, serviceCtor.name);
    }

    getService(serviceCtor) {
        Args.notFunction(serviceCtor, 'Service constructor');
        Args.notNull(serviceCtor.name, 'Service name');
        return this._services[serviceCtor.name];
    }
    
 }

 export {HttpApplication};