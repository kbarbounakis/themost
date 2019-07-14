/**
 * @license
 * MOST Web Framework 3.0 Codename Zero-Gravity
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {IApplicationService} from "@themost/common";

export class HttpApplicationService extends IApplicationService {
    constructor(app) {
        super();
        Object.defineProperty(this, 'application', {
            value: app,
            writable: false
        });
    }
    getApplication() {
        return this.application;
    }
}

export class HttpContextProvider extends HttpApplicationService {
    constructor(app) {
        super(app);
    }
}
