/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {MethodCallExpression} from './expressions';
import {PrototypeMethodParser} from './PrototypeMethodParser';
/**
 * @class
 */
export class StringMethodParser extends PrototypeMethodParser {
    constructor() {
        super();
    }

    startsWith(args) {
        return new MethodCallExpression('startswith', args);
    }

    endsWith(args) {
        return new MethodCallExpression('endswith', args);
    }

    toLowerCase(args) {
        return new MethodCallExpression('toLower', args);
    }

    toLocaleLowerCase(args) {
        return new MethodCallExpression('toLower', args);
    }

    toUpperCase(args) {
        return new MethodCallExpression('toUpper', args);
    }

    toLocaleUpperCase(args) {
        return new MethodCallExpression('toUpper', args);
    }

    indexOf(args) {
        return new MethodCallExpression('indexOfBytes', args);
    }

    substr(args) {
        return new MethodCallExpression('substr', args);
    }

    substring(args) {
        return new MethodCallExpression('substr', args);
    }

    trim(args) {
        return new MethodCallExpression('trim', args);
    }

    concat(args) {
        return new MethodCallExpression('concat', args);
    }

    includes(args) {
        return new MethodCallExpression('contains', args);
    }
}
