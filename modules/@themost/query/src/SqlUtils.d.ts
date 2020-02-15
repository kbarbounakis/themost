/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
 /**
  * @class
  */
export declare class SqlUtils {
    /**
     *
     * @param {string} sql
     * @param values
     * @returns {string}
     */
    static format(sql: string, values: any): string

    /**
     *
     * @param val
     * @returns {string}
     */
    static escape(val: any): string
}