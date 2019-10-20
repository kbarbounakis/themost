/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

// eslint-disable-next-line no-unused-vars
//noinspection JSUnusedLocalSymbols

export const REFERENCE_REGEXP = /^\$/;

/**
 * Returns a string which represents the name of the first property of an object
 * @param {*} any
 * @returns {*}
 */
export function getOwnPropertyName(any) {
    if (any) {
        for(let key in any) {
            return key;
        }
    }
}

/**
 * Returns true if the specified string is a method (e.g. $concat) or name reference (e.g. $dateCreated)
 * @param {string} str
 * @returns {*}
 */
export function isMethodOrNameReference(str) {
    return REFERENCE_REGEXP.test(str)
}

/**
 * Returns a string which indicates that the given string is following name reference format.  
 * @param {string} str
 * @returns {string}
 */
export function hasNameRerence(str) {
    if (str) {
        if (REFERENCE_REGEXP.test(str)) {
            return str.substr(1);
        }
    }
}

/**
 * Returns a string which indicates that the given object has a property with a name reference
 * e.g. $UserTable, $name etc.
 * @param {*} any
 * @returns {string|*}
 */
export function getOwnPropertyWithNameRef(any) {
    if (any) {
        for(let key in any) {
            if (REFERENCE_REGEXP.test(key)) {
                return key;
            }
            break;
        }
    }
}
