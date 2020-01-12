/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {IApplication} from '@themost/common';
import {IncomingMessage, ServerResponse} from 'http';
import {HttpApplication} from "./HttpApplication";
import {HttpConfiguration} from "./HttpConfiguration";

export declare class HttpContext {
		
	constructor(httpRequest : IncomingMessage, httpResponse : ServerResponse);
	application: IApplication;
	getApplication(): IApplication;
	getConfiguration(): HttpConfiguration;
	request : IncomingMessage;
	response: ServerResponse;
}

