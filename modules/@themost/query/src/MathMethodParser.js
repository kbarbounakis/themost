/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {MethodCallExpression} from './expressions';

/**
 * @class
 */
export class MathMethodParser {

    constructor() {
        this.prefix = [ new RegExp('^Math\\.(\\w+)', 'g') ];
    }

    test(name) {
        const findPrefix = this.prefix.find( prefix => {
            return prefix.test(name);
        });
        if (findPrefix) {
            const method = name.replace(findPrefix, '$1');
            if (typeof MathMethodParser[method] === 'function') {
                return MathMethodParser[method];
            }
        }
    }

    static floor(args) {
        return new MethodCallExpression('floor', args);
    }
    static ceil(args) {
        return new MethodCallExpression('ceil', args);
    }
    static round(args) {
        return new MethodCallExpression('round', args);
    }
    static min(args) {
        return new MethodCallExpression('min', args);
    }
    static max(args) {
        return new MethodCallExpression('max', args);
    }
}
