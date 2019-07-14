/**
 * @license
 * MOST Web Framework 3.0 Codename Zero-Gravity
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {Args} from "@themost/common";
import {HttpContext} from "./context";
import {HttpContextProvider} from "./types";

export class HttpApplication {
    /**
     * @param {string=} executionPath
     */
    constructor(executionPath) {

        Object.defineProperty(this, 'services', {
           value: { },
           enumerable: false,
           configurable: false
        });

    }

    createContext(req, res) {
        let context;
        if (this.hasStrategy(HttpContextProvider)) {
            context = this.getStrategy(HttpContextProvider).createContext(req, res);
        }
        else {
            context = new HttpContext(req, res);
        }
        context.application = this;
        return context;
    }

    /**
     * @param {Function} serviceCtor
     * @param {Function} strategyCtor
     * @returns {HttpApplication}
     */
    useStrategy(serviceCtor, strategyCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        Args.notFunction(strategyCtor,"Strategy constructor");
        this.services[serviceCtor.name] = new strategyCtor(this);
        return this;
    }

    /**
     * @param {Function} serviceCtor
     * @returns {HttpApplication}
     */
    useService(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        this.services[serviceCtor.name] = new serviceCtor(this);
        return this;
    }

    /**
     * @param {Function} serviceCtor
     * @returns {boolean}
     */
    hasService(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        return this.services.hasOwnProperty(serviceCtor.name);
    }

    /**
     * @param {Function} strategyCtor
     * @returns {boolean}
     */
    hasStrategy(strategyCtor) {
        Args.notFunction(strategyCtor,"Strategy constructor");
        return this.services.hasOwnProperty(strategyCtor.name);
    }

    /**
     * @param {Function} serviceCtor
     * @returns {*}
     */
    getService(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        return this.services[serviceCtor.name];
    }

    /**
     * @param {Function} strategyCtor
     * @returns {*}
     */
    getStrategy(strategyCtor) {
        Args.notFunction(strategyCtor,"Strategy constructor");
        return this.services[strategyCtor.name];
    }

    /**
     * @returns RequestHandler
     */
    runtime() {
        const self = this;
        // noinspection JSValidateTypes
        return function runtimeMiddleware(req, res, next) {
            const context = self.createContext(req, res);
            req.on('close', ()=> {
                // finalize context
                context.finalize(() => {
                    //
                });
            });
            return next();
        }
    }
}
