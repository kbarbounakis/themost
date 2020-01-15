/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import Q from 'q';

import functions from './functions';

/**
 * @module @themost/data/data-filter-resolver
 * @ignore
 */

/**
 * @ignore
 * @class
 * @abstract
 * @constructor
 * @augments DataModel
 */
class DataFilterResolver {
    resolveMember(member, callback) {
        if (/\//.test(member)) {
            const arr = member.split('/');
            callback(null, arr.slice(arr.length-2).join('.'));
        }
        else {
            callback(null, this.viewAdapter.concat('.', member))
        }
    }

    resolveMethod(name, args, callback) {
        callback = callback || (() => { });
        if (typeof DataFilterResolver.prototype[name] === 'function') {
            const a = args || [];
            a.push(callback);
            try {
                return DataFilterResolver.prototype[name].apply(this, a);
            }
            catch(e) {
                return callback(e);
            }

        }
        callback();
    }

    /**
     * @param {Function} callback
     */
    me(callback) {
        const fx = new functions.FunctionContext(this.context, this);
        fx.user().then(value => {
            callback(null, value)
        }).catch(err => {
            callback(err);
        });
    }

    /**
     * @param {Function} callback
     */
    now(callback) {
        callback(null, new Date());
    }

    /**
     * @param {Function} callback
     */
    today(callback) {
        const res = new Date();
        res.setHours(0,0,0,0);
        callback(null, res);
    }

    /**
     * @param {Function} callback
     */
    lang(callback) {
        let culture = this.context.culture();
        if (culture) {
            return callback(null, culture.substr(0,2));
        }
        else {
            return callback(null, "en");
        }

    }
}

/**
 * @param {Function} callback
 */
DataFilterResolver.prototype.user = DataFilterResolver.prototype.me;

if (typeof exports !== 'undefined')
{
    module.exports = {
        DataFilterResolver:DataFilterResolver
    };
}