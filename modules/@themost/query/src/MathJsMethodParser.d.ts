/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {MethodCallExpression} from "./expressions";

export declare class MathJsMethodParser {
    static round(args): MethodCallExpression
    static ceil(args): MethodCallExpression
    static floor(args): MethodCallExpression
    static add(args): MethodCallExpression
    static subtract(args): MethodCallExpression
    static multiply(args): MethodCallExpression
    static divide(args): MethodCallExpression
    static bitAnd(args): MethodCallExpression
}
