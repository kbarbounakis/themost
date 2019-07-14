/**
 * @license
 * MOST Web Framework 3.0 Codename Zero-Gravity
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

import {IncomingMessage, ServerResponse} from 'http';
import {HttpApplication} from "./app";
import {DefaultDataContext} from '@themost/data/data-context';
import {ConfigurationBase} from "@themost/common";

export declare class HttpContext extends DefaultDataContext {

	constructor(req : IncomingMessage, res : ServerResponse);
	request : IncomingMessage;
	response: ServerResponse;
	application: HttpApplication;
	getApplication(): HttpApplication;
	getConfiguration(): ConfigurationBase;
	culture(value? : string): HttpContext;
	translate(...text : string[]): string;
	engine(extension : string): void;

}

