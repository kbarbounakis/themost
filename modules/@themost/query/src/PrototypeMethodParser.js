/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
 export class PrototypeMethodParser {

     test(name) {
        if (name === 'toString') {
            return;
        }
        if (typeof this[name] === 'function') {
            return this[name];
        }
    }

 }