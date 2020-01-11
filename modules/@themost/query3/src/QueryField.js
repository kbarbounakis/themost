/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

import { Args } from '@themost/common';
import { getOwnPropertyName, isMethodOrNameReference } from './query';
/**
 * @class
 * @classdesc Represents a field expression that is going to be used in any query
 */
export class QueryField {
    constructor(name) {
        if (name) {
            Args.notString(name, 'Field name');
            // set default field selection e.g. { "name": 1 }
            this[name] = 1;
            // hold name property
        }
    }
    /**
     * @private
     * @param {string} name
     */
    _toReference(name) {
        Args.notEmpty(name, 'name');
        return name.split('.').map(key => {
            if (isMethodOrNameReference(key)) {
                return key;
            }
            return `$${key}`;
        }).join('.');
    }
    /**
     * @private
     * @param {string} method
     */
    _assignMethod(method) {
        const args = Array.from(arguments).slice(1).map(arg => {
            if (arg instanceof QueryField) {
                // get first property
                const key = getOwnPropertyName(arg);
                // if key value is only a simple reference e.g. { "firstName": 1 }
                if (arg[key] === 1) {
                    // return field reference name e.g. $firstName or $Person.$firstName
                    return this._toReference(key);
                }
                // otherwise return instance of query field
                return arg;
            }
            return arg;
        });
        let value;
        // get object first property
        const thisName = getOwnPropertyName(this);
        // if name is a method reference e.g. { $day: "$dateCreated" } => $day
        const isMethod = isMethodOrNameReference(thisName);
        if (isMethod) {
            // assign previous property value to new method e.g.
            // { $min: { $day: "$dateCreated" } }
            this[method] = { };
            // if method has arguments
            if (args.length > 0) {
                // insert field as first argument e.g.
                // validate first parameter e.g. { $multiply: [ "$price", 0.7 ] }
                if (Array.isArray(this[thisName])) {
                    // clone value
                    value = {};
                    // clone property
                    // e.g. { $multiply: [ "$price", 0.7 ] }
                    Object.defineProperty(value, thisName, { value: this[thisName], configurable: true, enumerable: true, writable: true });
                    // set this value as first argument
                    args.unshift(value);
                }
                else {
                    value = this._toReference(thisName);
                    args.unshift(value);
                }
                // finally wrap existing property
                // e.g. { $add: [ { $multiply: [ "$price", 0.7 ] }, 25 ] }
                this[method] = args;
            }
            else {
                // else use only field reference
                value = this[thisName];
                Object.defineProperty(this[method], this._toReference(thisName), { value: value, configurable: true, enumerable: true, writable: true });
            }
            // remove previous property reference
            delete this[thisName];
            // and finally return
            return this;
        }
        // validate if underlying expression a single select expression e.g. { "name": 1 }
        if (this[thisName] === 1) {
            // if method has arguments
            if (args.length > 0) {
                // insert field as first argument e.g.
                args.unshift(this._toReference(thisName));
                // set value
                value = args;
            }
            else {
                // else use only field reference
                value = `$${thisName}`;
            }
            // set property descriptor
            Object.defineProperty(this, `${method}`, { value: value, configurable: true, enumerable: true, writable: true });
            // remove previous property
            delete this[thisName];
            // and return
            return this;
        }
        throw new Error('Query object has an invalid state or its graph has not yet implemented.');
    }
    /**
     * Prepares a query by settings the alias of an expression e.g. { "createdAt": "$dateCreated" }
     * @params {string} alias
     * @returns this
     */
    as(alias) {
        Args.notString(alias, 'Query field alias');
        return this._assignMethod(alias);
    }
    /**
     * Prepares a query which returns the count of an expression
     * @returns this
     */
    count() {
        return this._assignMethod('$count');
    }
    /**
     * Prepares a query which returns the minimum value of an expression
     * @returns this
     */
    min() {
        return this._assignMethod('$min');
    }
    /**
     * Prepares a query which returns the maximum value of an expression
     * @returns this
     */
    max() {
        return this._assignMethod('$max');
    }
    /**
     * Prepares a query which returns the sum of an expression
     * @returns this
     */
    sum() {
        return this._assignMethod('$sum');
    }
    /**
     * Prepares a query which returns the average value of an expression
     * @returns this
     */
    avg() {
        return this._assignMethod('$avg');
    }
    /**
     * Prepares a query which returns the average value of an expression
     * @returns this
     */
    average() {
        return this._assignMethod('$avg');
    }
    /**
     * Prepares a query which returns the date of month of a date expression
     * @returns this
     */
    getDate() {
        return this._assignMethod('$dayOfMonth');
    }
    /**
     * Prepares a query which returns the date only value of a date expression
     * @returns this
     */
    toDate() {
        return this._assignMethod('$date');
    }
    /**
     * Prepares a query which returns the day of week of a date expression
     */
    getDay() {
        return this._assignMethod('$dayOfWeek');
    }
    /**
     * Prepares a query which returns the month of a date expression
     * @returns this
     */
    getMonth() {
        return this._assignMethod('$month');
    }
    /**
     * Prepares a query which returns the year of a date expression
     * @returns this
     */
    getYear() {
        return this._assignMethod('$year');
    }
    /**
     * Prepares a query which returns the hours of a date expression
     * @returns this
     */
    getHours() {
        return this._assignMethod('$hour');
    }
    /**
     * Prepares a query which returns the minutes of a date expression
     * @returns this
     */
    getMinutes() {
        return this._assignMethod('$minute');
    }
    /**
     * Prepares a query which returns the seconds of a date expression
     * @returns this
     */
    getSeconds() {
        return this._assignMethod('$second');
    }
    /**
     * Prepares a query which returns the length of a string expression
     * @returns this
     */
    length() {
        return this._assignMethod('$length');
    }
    /**
     * Prepares a query which removes whitespace from the beginning and the end of an expression
     * @returns this
     */
    trim() {
        return this._assignMethod('$trim');
    }
    /**
     * Prepares a query which returns the largest integer less than or equal  of an expression
     * @returns this
     */
    floor() {
        return this._assignMethod('$floor');
    }
    /**
     * Prepares a query which returns the smallest integer greater than or equal  of an expression
     * @returns this
     */
    ceil() {
        return this._assignMethod('$ceil');
    }
    /**
     * Prepares a query which returns a concatenated string of an expression
     * @returns this
     */
    concat() {
        const args = Array.from(arguments);
        args.unshift('$concat');
        return this._assignMethod.apply(this, args);
    }
    /**
     * Prepares a query which subtracts two parameters and returns the difference
     * @params {*} x
     * @returns this
     */
    subtract(x) {
        return this._assignMethod.apply(this, ['$subtract', x]);
    }
    /**
     * Prepares a query which adds two parameters and returns the result
     * @params {*} x
     * @returns this
     */
    add(x) {
        return this._assignMethod.apply(this, ['$add', x]);
    }
    /**
     * Prepares a query which multiplies parameters together and returns the result
     * @params {*} x
     * @returns this
     */
    multiply(x) {
        return this._assignMethod.apply(this, ['$multiply', x]);
    }
    /**
     * Prepares a query which divide one parameter from another and returns the result
     * @params {*} x
     * @returns this
     */
    divide(x) {
        return this._assignMethod.apply(this, ['$divide', x]);
    }
    /**
     * Prepares a query which divide one parameter from another and returns the remainder
     * @params {*} x
     */
    mod(x) {
        return this._assignMethod.apply(this, ['$mod', x]);
    }
    /**
     * Prepares a query which rounds a parameter to a specified decimal place and returns the remainder
     * @params {*=} n
     * @returns this
     */
    round(n) {
        if (n) {
            return this._assignMethod.apply(this, ['$round', n]);
        }
        return this._assignMethod.apply(this, ['$round', 0]);
    }
    /**
     * Prepares a query which returns a substring of an expression
     * @params {number} start - A number which represents the start index position
     * @params {number=} length - A number which represents the length of the including characters. If length is a negative substring  includes the rest of string
     * @returns this
     */
    substr(start, length) {
        if (length == null) {
            return this._assignMethod.apply(this, ['$substr', start, -1]);
        }
        return this._assignMethod.apply(this, ['$substr', start, length]);
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toLowerCase() {
        return this._assignMethod('$toLower');
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toLocaleLowerCase() {
        return this.toLowerCase();
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toUpperCase() {
        return this._assignMethod('$toUpper');
    }
    /**
     * Prepares a query which converts an expression to lowercase
     * @returns this
     */
    toLocaleUpperCase() {
        return this.toUpperCase();
    }
    /**
     * Prepares a query which returns the index of the first occurrence of an expression within expression
     * @params {any} x - An expression to search for e.g a string
     * @params {number=} start - The starting index position for the search.
     * @returns this
     */
    indexOf(x, start) {
        if (start == null) {
            return this._assignMethod.apply(this, ['$indexOfBytes', x]);
        }
        return this._assignMethod.apply(this, ['$indexOfBytes', x, start]);
    }
}
