/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
/**/
const URL = require('url').URL;
const qs = require('qs');

function query() {
    return function query(req, res, next) {
        // if request is undefined exit
        if (req == null) {
            return;
        }
        // validate request query
        if (req.query != null) {
            return;
        }
        // parse and set request query
        req.query = qs.parse(new URL(req.url, ((req.connection && req.connection.encrypted) ? 'https://' : 'http://') + req.headers.host).query);
        // continue
        return next();
    }
}

module.exports = query;
