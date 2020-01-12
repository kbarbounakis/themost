/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {IncomingMessage, ServerResponse} from 'http';
import {IApplication} from '@themost/common';
import {HttpConfiguration} from "./HttpConfiguration";

export declare class HttpApplication extends IApplication {

    constructor (executionPath:string);
    readonly configuration: HttpConfiguration;
    getConfiguration():HttpConfiguration;
    createContext(request: IncomingMessage, response: ServerResponse): HttpContext;
    runtime(): RequestListener;
    useStrategy(serviceCtor: Function, strategyCtor: Function): HttpApplication;
    useService(serviceCtor: Function): HttpApplication;
    hasStrategy(serviceCtor: Function): boolean;
    hasService(serviceCtor: Function): boolean;
    getService<T>(serviceCtor: T): T;
}