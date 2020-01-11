/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
/**
 * Gets the first property name of an object.
 * @param any - The object to search
 * @returns {string} - A string which represents the name of the first property of the specified object
 */
export declare function getOwnPropertyName(any?: any): string;

/**
 * Checks if the given string is a method or name reference e.g. $dateCreated or $and etc.
 * @param {string} str - A string expression to validate
 * @returns {boolean}
 */
export declare function isMethodOrNameReference(str: string): boolean;
