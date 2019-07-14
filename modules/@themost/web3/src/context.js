/**
 * @license
 * MOST Web Framework 3.0 Codename Zero-Gravity
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DefaultDataContext} from "@themost/data";

export class HttpContext extends DefaultDataContext {
    /**
     *
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    constructor(req, res) {
        /**
         * @name HttpContext#application
         * @type {HttpApplication}
         */
        super();
        // set context request
        Object.defineProperty(this, 'request', {
            value: req,
            configurable: true,
            enumerable: true
        });
        // set context response
        Object.defineProperty(this, 'response', {
            value: res,
            configurable: true,
            enumerable: true
        });
    }
}
