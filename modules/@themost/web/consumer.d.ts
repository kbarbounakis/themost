/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {HttpContext} from "./context";
import {IncomingMessage, ServerResponse} from "http";

export declare class HttpConsumer {
    constructor(callable:(req: IncomingMessage, res?: ServerResponse)=> any, params?: any);
    callable:(...args: any[])=> Promise<any>;
    params?: any;
    run(context: HttpContext, ...args: any[]);
}
