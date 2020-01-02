/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {SqlFormatter} from './SqlFormatter';

const REGEXP_SINGLE_QUOTE = /\\'/g;
const SINGLE_QUOTE_ESCAPE = '\'\'';
const REGEXP_DOUBLE_QUOTE = /\\"/g;
const DOUBLE_QUOTE_ESCAPE = '"';
const REGEXP_SLASH = /\\\\/g;
const SLASH_ESCAPE = '\\';

/**
 *
 * @param number
 * @param length
 * @returns {string}
 */
function zeroPad(number, length) {
    number = number || 0;
    let res = number.toString();
    while (res.length < length) {
        res = '0' + res;
    }
    return res;
}

// noinspection JSUnusedGlobalSymbols
/**
 * @augments {SqlFormatter}
 */
export class MemoryFormatter extends SqlFormatter {

    static get NAME_FORMAT() {
        return '"$1"'
    }

    /**
     * @constructor
     */
    constructor() {
        super();
        this.settings = {
            nameFormat: MemoryFormatter.NAME_FORMAT,
            aliasKeyword: 'AS',
            forceAlias: true
        };
    }

    // escapeName(name) {
    //     if (typeof name === 'string')
    //         return name.replace(/(\w+)/ig, this.settings.nameFormat);
    //     return name;
    // }

    /**
     * Escapes an object or a value and returns the equivalent sql value.
     * @param {*} value - A value that is going to be escaped for SQL statements
     * @param {boolean=} unquoted - An optional value that indicates whether the resulted string will be quoted or not.
     * returns {string} - The equivalent SQL string value
     */
    escape(value, unquoted) {
        if (typeof value === 'boolean') {
            return value ? '1' : '0';
        }
        if (value instanceof Date) {
            return this.escapeDate(value);
        }
        let res = super.escape.bind(this)(value, unquoted);
        if (typeof value === 'string') {
            if (REGEXP_SINGLE_QUOTE.test(res))
            //escape single quote (that is already escaped)
                res = res.replace(/\\'/g, SINGLE_QUOTE_ESCAPE);
            if (REGEXP_DOUBLE_QUOTE.test(res))
            //escape double quote (that is already escaped)
                res = res.replace(/\\"/g, DOUBLE_QUOTE_ESCAPE);
            if (REGEXP_SLASH.test(res))
            //escape slash (that is already escaped)
                res = res.replace(/\\\\/g, SLASH_ESCAPE);
        }
        return res;
    }

    /**
     * @param {Date|*} val
     * @returns {string}
     */
    escapeDate(val) {
        const year = val.getFullYear();
        const month = zeroPad(val.getMonth() + 1, 2);
        const day = zeroPad(val.getDate(), 2);
        const hour = zeroPad(val.getHours(), 2);
        const minute = zeroPad(val.getMinutes(), 2);
        const second = zeroPad(val.getSeconds(), 2);
        const millisecond = zeroPad(val.getMilliseconds(), 3);
        //format timezone
        const offset = val.getTimezoneOffset(),
            timezone = (offset <= 0 ? '+' : '-') + zeroPad(-Math.floor(offset / 60), 2) + ':' + zeroPad(offset % 60, 2);
        return "'" + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + "." + millisecond + timezone + "'";
    }

    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexof(p0, p1) {
        return `(INSTR(${this.escape(p0)},${this.escape(p1)})-1)`;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Implements indexOf(str,substr) expression formatter.
     * @param {string} p0 The source string
     * @param {string} p1 The string to search for
     * @returns {string}
     */
    $indexOfBytes(p0, p1) {
        return `(INSTR(${this.escape(p0)},${this.escape(p1)})-1)`;
    }

    /**
     * Implements contains(a,b) expression formatter.
     * @param {*} p0 The source string
     * @param {*} p1 The string to search for
     * @returns {string}
     */
    $text(p0, p1) {
        return `(INSTR(${this.escape(p0)},${this.escape(p1)})-1)>=0`;
    }

    /**
     * Implements simple regular expression formatter. Important Note: SQLite 3 does not provide a core sql function for regular expression matching.
     * @param {*} p0 The source string or field
     * @param {*} p1 The string to search for
     */
    $regex(p0, p1) {
        //escape expression
        let s1 = this.escape(p1, true);
        //implement starts with equivalent for LIKE T-SQL
        if (/^\^/.test(s1)) {
            s1 = s1.replace(/^\^/, '');
        } else {
            s1 = '%' + s1;
        }
        //implement ends with equivalent for LIKE T-SQL
        if (/\$$/.test(s1)) {
            s1 = s1.replace(/\$$/, '');
        } else {
            s1 += '%';
        }
        return `LIKE(\'${s1}\',${this.escape(p0)}) >= 1`;
    }

    /**
     * Implements concat(a,b,..) expression formatter.
     * @param {*...} p0
     * @returns {string}
     */
    $concat() {
        const args = Array.from(arguments);
        return '(' + args.map( arg => {
            return `IFNULL(${this.escape(arg)},\'\')`;
        }).join(' || ') + ')';
    }

    /**
     * Implements substring(str,pos) expression formatter.
     * @param {String} p0 The source string
     * @param {Number} pos The starting position
     * @param {Number=} length The length of the resulted string
     * @returns {string}
     */
    $substring(p0, pos, length) {
        if (length) {
            return `SUBSTR(${this.escape(p0)},${pos + 1},${length})`;
        }
        return `SUBSTR(${this.escape(p0)},${pos + 1})`;
    }

    /**
     * Implements substring(str,pos) expression formatter.
     * @param {String} p0 The source string
     * @param {Number} pos The starting position
     * @param {Number=} length The length of the resulted string
     * @returns {string}
     */
    $substr(p0, pos, length) {
        if (length) {
            return `SUBSTR(${this.escape(p0)},${pos + 1},${length})`;
        }
        return `SUBSTR(${this.escape(p0)},${pos + 1})`;
    }

    /**
     * Implements length(a) expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $length(p0) {
        return `LENGTH(${this.escape(p0)})`;
    }

    $ceiling(p0) {
        return `CEIL(${this.escape(p0)})`;
    }

    $startswith(p0, p1) {
        return `LIKE('${this.escape(p1, true)}%',${this.escape(p0)})`;
    }

    $contains(p0, p1) {
        return `LIKE('%${this.escape(p1, true)}%',${this.escape(p0)})`;
    }

    $endswith(p0, p1) {
        return `LIKE('%${this.escape(p1, true)}',${this.escape(p0)})`;
    }

    $day(p0) {
        return `CAST(strftime('%d', ${this.escape(p0)}) AS INTEGER)`;
    }

    $dayOfMonth(p0) {
        return `CAST(strftime('%d', ${this.escape(p0)}) AS INTEGER)`;
    }

    $month(p0) {
        return `CAST(strftime('%m', ${this.escape(p0)}) AS INTEGER)`;
    }

    $year(p0) {
        return `CAST(strftime('%Y', ${this.escape(p0)}) AS INTEGER)`;
    }

    $hour(p0) {
        return `CAST(strftime('%H', ${this.escape(p0)}) AS INTEGER)`;
    }

    $minute(p0) {
        return `CAST(strftime('%M', ${this.escape(p0)}) AS INTEGER)`;
    }

    $minutes(p0) {
        return `CAST(strftime('%M', ${this.escape(p0)}) AS INTEGER)`;
    }

    $second(p0) {
        return `CAST(strftime('%S', ${this.escape(p0)}) AS INTEGER)`;
    }

    $seconds(p0) {
        return `CAST(strftime('%S', ${this.escape(p0)}) AS INTEGER)`;
    }

    $date(p0) {
        return `date(${this.escape(p0)})`;
    }
}

