/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
'use strict';
var LangUtils = require('@themost/common/utils').LangUtils;
var HttpDataController = require('./data');
/**
 * @classdesc HttpLookupController class describes a lookup model data controller.
 * @class
 * @constructor
 * @param {HttpContext} context
 */
function HttpLookupController(context) {
    HttpLookupController.super_.bind(this)(context);
}

LangUtils.inherits(HttpLookupController, HttpDataController);

if (typeof module !== 'undefined') {
    module.exports = HttpLookupController;
}