/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

import { sprintf } from 'sprintf';
import _ from 'lodash';
/**
 * @class
 * @constructor
 */
export class ODataQuery {
    constructor() {
        /**
         * @private
         */
        Object.defineProperty(this, 'privates', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
        });
    }
    /**
     * @private
     * @returns ODataQuery
     */
    append() {
        const self = this;
        let exprs;
        if (self.privates.left) {
            let expr = null;
            if (self.privates.op === 'in') {
                if (_.isArray(self.privates.right)) {
                    //expand values
                    exprs = [];
                    _.forEach(self.privates.right, x => {
                        exprs.push(self.privates.left + ' eq ' + QueryExpression.escape(x));
                    });
                    if (exprs.length > 0)
                        expr = '(' + exprs.join(' or ') + ')';
                }
            }
            else if (self.privates.op === 'nin') {
                if (_.isArray(self.privates.right)) {
                    //expand values
                    exprs = [];
                    _.forEach(self.privates.right, x => {
                        exprs.push(self.privates.left + ' ne ' + QueryExpression.escape(x));
                    });
                    if (exprs.length > 0)
                        expr = '(' + exprs.join(' and ') + ')';
                }
            }
            else
                expr = self.privates.left + ' ' + self.privates.op + ' ' + QueryExpression.escape(self.privates.right);
            if (expr) {
                if (_.isNil(self.$filter))
                    self.$filter = expr;
                else {
                    self.privates.lop = self.privates.lop || 'and';
                    self.privates._lop = self.privates._lop || self.privates.lop;
                    if (self.privates._lop === self.privates.lop)
                        self.$filter = self.$filter + ' ' + self.privates.lop + ' ' + expr;
                    else
                        self.$filter = '(' + self.$filter + ') ' + self.privates.lop + ' ' + expr;
                    self.privates._lop = self.privates.lop;
                }
            }
        }
        delete self.privates.lop;
        delete self.privates.left;
        delete self.privates.op;
        delete self.privates.right;
        return this;
    }
    /**
     * @param {...string} attr
     * @returns ODataQuery
     */
    select(attr) {
        const args = (arguments.length > 1) ? Array.prototype.slice.call(arguments) : attr;
        this.$select = _.map(args, arg => {
            if (_.isArray(arg)) {
                return arg.join(',');
            }
            return arg;
        }).join(',');
        return this;
    }
    /**
     * @param {number} val
     * @returns ODataQuery
     */
    take(val) {
        this.$top = isNaN(val) ? 0 : val;
        return this;
    }
    /**
     * @param {number} val
     * @returns ODataQuery
     */
    skip(val) {
        this.$skip = isNaN(val) ? 0 : val;
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @returns ODataQuery
     */
    orderBy(name) {
        if (!name == null) {
            this.$orderby = name.toString();
        }
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    orderByDescending(name) {
        if (!name == null) {
            this.$orderby = name.toString() + ' desc';
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    thenBy(name) {
        if (!name == null) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString());
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    thenByDescending(name) {
        if (!name == null) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString()) + ' desc';
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    where(name) {
        this.privates.left = name;
        return this;
    }
    /**
     * @param {String=} name
     * @returns ODataQuery
     */
    and(name) {
        this.privates.lop = 'and';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }
    /**
     * @param {String=} name
     * @returns ODataQuery
     */
    or(name) {
        this.privates.lop = 'or';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }
    /**
     * @param {*} value
     * @returns ODataQuery
     */
    equal(value) {
        this.privates.op = 'eq';
        this.privates.right = value;
        return this.append();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    indexOf(name) {
        this.privates.left = 'indexof(' + name + ')';
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns ODataQuery
     */
    endsWith(name, s) {
        this.privates.left = sprintf('endswith(%s,%s)', name, QueryExpression.escape(s));
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns ODataQuery
     */
    startsWith(name, s) {
        this.privates.left = sprintf('startswith(%s,%s)', name, QueryExpression.escape(s));
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns ODataQuery
     */
    substringOf(name, s) {
        this.privates.left = sprintf('substringof(%s,%s)', name, QueryExpression.escape(s));
        return this;
    }
    /**
     * @param {*} name
     * @param {number} pos
     * @param {number} length
     * @returns ODataQuery
     */
    substring(name, pos, length) {
        this.privates.left = sprintf('substring(%s,%s,%s)', name, pos, length);
        return this;
    }
    /**
     * @param {*} name
     * @returns ODataQuery
     */
    length(name) {
        this.privates.left = sprintf('length(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns ODataQuery
     */
    toLower(name) {
        this.privates.left = sprintf('tolower(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns ODataQuery
     */
    toUpper(name) {
        this.privates.left = sprintf('toupper(%s)', name);
        return this;
    }
    /**
     * @param {*} name
     * @returns ODataQuery
     */
    trim(name) {
        this.privates.left = sprintf('trim(%s)', name);
        return this;
    }
    /**
     * @param {*} s0
     * @param {*} s1
     * @param {*=} s2
     * @param {*=} s3
     * @param {*=} s4
     * @returns ODataQuery
     */
    concat(s0, s1, s2, s3, s4) {
        this.privates.left = 'concat(' + QueryExpression.escape(s0) + ',' + QueryExpression.escape(s1);
        if (typeof s2 !== 'undefined')
            this.privates.left += ',' + QueryExpression.escape(s2);
        if (typeof s3 !== 'undefined')
            this.privates.left += ',' + QueryExpression.escape(s3);
        if (typeof s4 !== 'undefined')
            this.privates.left += ',' + QueryExpression.escape(s4);
        this.privates.left += ')';
        return this;
    }
    field(name) {
        return { "$name": name };
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    day(name) {
        this.privates.left = sprintf('day(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    hour(name) {
        this.privates.left = sprintf('hour(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    minute(name) {
        this.privates.left = sprintf('minute(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    month(name) {
        this.privates.left = sprintf('month(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    second(name) {
        this.privates.left = sprintf('second(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    year(name) {
        this.privates.left = sprintf('year(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    round(name) {
        this.privates.left = sprintf('round(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    floor(name) {
        this.privates.left = sprintf('floor(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns ODataQuery
     */
    ceiling(name) {
        this.privates.left = sprintf('ceiling(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns ODataQuery
     */
    // noinspection JSUnusedGlobalSymbols
    notEqual(value) {
        this.privates.op = 'ne';
        this.privates.right = value;
        return this.append();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns ODataQuery
     */
    greaterThan(value) {
        this.privates.op = 'gt';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {*} value
     * @returns ODataQuery
     */
    greaterOrEqual(value) {
        this.privates.op = 'ge';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {*} value
     * @returns ODataQuery
     */
    lowerThan(value) {
        this.privates.op = 'lt';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {*} value
     * @returns ODataQuery
     */
    lowerOrEqual(value) {
        this.privates.op = 'le';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {Array} values
     * @returns ODataQuery
     */
    in(values) {
        this.privates.op = 'in';
        this.privates.right = values;
        return this.append();
    }
    /**
     * @param {Array} values
     * @returns ODataQuery
     */
    notIn(values) {
        this.privates.op = 'nin';
        this.privates.right = values;
        return this.append();
    }
}
