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
export class DateMethodParser extends PrototypeMethodParser {
    constructor() {
        super();
    }

    getFullYear(args) {
        return new MethodCallExpression('year', args);
    }

    getYear(args) {
        return new MethodCallExpression('year', args);
    }

    getMonth(args) {
        return new MethodCallExpression('month', args);
    }

    getDate(args) {
        return new MethodCallExpression('dayOfMonth', args);
    }

    toDate(args) {
        return new MethodCallExpression('date', args);
    }

    getHours(args) {
        return new MethodCallExpression('hour', args);
    }

    getMinutes(args) {
        return new MethodCallExpression('minute', args);
    }

    getSeconds(args) {
        return new MethodCallExpression('second', args);
    }

}