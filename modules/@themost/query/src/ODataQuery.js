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
export class OpenDataQuery {
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
     * @returns OpenDataQuery
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
     * @returns OpenDataQuery
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
     * @returns OpenDataQuery
     */
    take(val) {
        this.$top = isNaN(val) ? 0 : val;
        return this;
    }
    /**
     * @param {number} val
     * @returns OpenDataQuery
     */
    skip(val) {
        this.$skip = isNaN(val) ? 0 : val;
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @returns OpenDataQuery
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
     * @returns OpenDataQuery
     */
    orderByDescending(name) {
        if (!name == null) {
            this.$orderby = name.toString() + ' desc';
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    thenBy(name) {
        if (!name == null) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString());
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    thenByDescending(name) {
        if (!name == null) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString()) + ' desc';
        }
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    where(name) {
        this.privates.left = name;
        return this;
    }
    /**
     * @param {String=} name
     * @returns OpenDataQuery
     */
    and(name) {
        this.privates.lop = 'and';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }
    /**
     * @param {String=} name
     * @returns OpenDataQuery
     */
    or(name) {
        this.privates.lop = 'or';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }
    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    equal(value) {
        this.privates.op = 'eq';
        this.privates.right = value;
        return this.append();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    indexOf(name) {
        this.privates.left = 'indexof(' + name + ')';
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns OpenDataQuery
     */
    endsWith(name, s) {
        this.privates.left = sprintf('endswith(%s,%s)', name, QueryExpression.escape(s));
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns OpenDataQuery
     */
    startsWith(name, s) {
        this.privates.left = sprintf('startswith(%s,%s)', name, QueryExpression.escape(s));
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns OpenDataQuery
     */
    substringOf(name, s) {
        this.privates.left = sprintf('substringof(%s,%s)', name, QueryExpression.escape(s));
        return this;
    }
    /**
     * @param {*} name
     * @param {number} pos
     * @param {number} length
     * @returns OpenDataQuery
     */
    substring(name, pos, length) {
        this.privates.left = sprintf('substring(%s,%s,%s)', name, pos, length);
        return this;
    }
    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    length(name) {
        this.privates.left = sprintf('length(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    toLower(name) {
        this.privates.left = sprintf('tolower(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    toUpper(name) {
        this.privates.left = sprintf('toupper(%s)', name);
        return this;
    }
    /**
     * @param {*} name
     * @returns OpenDataQuery
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
     * @returns OpenDataQuery
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
     * @returns OpenDataQuery
     */
    day(name) {
        this.privates.left = sprintf('day(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    hour(name) {
        this.privates.left = sprintf('hour(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    minute(name) {
        this.privates.left = sprintf('minute(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    month(name) {
        this.privates.left = sprintf('month(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    second(name) {
        this.privates.left = sprintf('second(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    year(name) {
        this.privates.left = sprintf('year(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    round(name) {
        this.privates.left = sprintf('round(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    floor(name) {
        this.privates.left = sprintf('floor(%s)', name);
        return this;
    }
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    ceiling(name) {
        this.privates.left = sprintf('ceiling(%s)', name);
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns OpenDataQuery
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
     * @returns OpenDataQuery
     */
    greaterThan(value) {
        this.privates.op = 'gt';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    greaterOrEqual(value) {
        this.privates.op = 'ge';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    lowerThan(value) {
        this.privates.op = 'lt';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    lowerOrEqual(value) {
        this.privates.op = 'le';
        this.privates.right = value;
        return this.append();
    }
    /**
     * @param {Array} values
     * @returns OpenDataQuery
     */
    in(values) {
        this.privates.op = 'in';
        this.privates.right = values;
        return this.append();
    }
    /**
     * @param {Array} values
     * @returns OpenDataQuery
     */
    notIn(values) {
        this.privates.op = 'nin';
        this.privates.right = values;
        return this.append();
    }
}
