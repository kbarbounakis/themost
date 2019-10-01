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
import {HttpHandler} from "./handler";

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

        Object.defineProperty(this, 'handlers', {
           value: [],
           enumerable: false,
           configurable: false
        });
        // set executionPath
        this.executionPath = executionPath || process.cwd();
        // set development mode
        this.development = process.env.NODE_ENV === 'development';
        // build configuration from execution path

    }

    createContext(req, res) {
        let context;
        if (this.hasStrategy(HttpContextProvider)) {
            context = this.getStrategy(HttpContextProvider).createContext(req, res);
        }
        else {
            context = new HttpContext(req, res);
        }
        context.application = this;application
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

    use(handler) {
        if (handler instanceof HttpHandler) {
            // append consumer to collection
            this.handlers.push(handler);
            return this;
        }
        if (typeof handler === 'function') {
            // append function as consumer to collection
            this.handlers.push(new HttpHandler(handler));
        }
        throw new Error('An http handler must be either an instance of HttpHandler class or a function.');
    }

    /**
    * @private
    * @param {HttpContext} context
    */
    async _execute(context) {
        let handler;
        let result;
        for(let i=0; i<=this.handlers.length; i++) {
            handler = this.handlers[i];
            // execute handler
            result = await handler.run(context);
        }
    }

    /**
     * @returns RequestHandler
     */
    runtime() {
        const self = this;
        // noinspection JSValidateTypes
        return function runtimeMiddleware(req, res, next) {
            const context = self.createContext(req, res);
            // set req.context property
            Object.defineProperty(req, 'context', {
                enumerable: false,
                writable: false,
                value: context
            });
            // set req.context property
            Object.defineProperty(res, 'context', {
                enumerable: false,
                writable: false,
                value: context
            });
            req.on('close', ()=> {
                // finalize context
                context.finalize(() => {
                    //
                });
            });
            return self._execute(context).then(_result => {
                return next();
            }).catch(err => {
                return next(err);
            });
        }
    }
}
