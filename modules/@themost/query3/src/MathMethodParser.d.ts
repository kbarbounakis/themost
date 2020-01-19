/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {MethodCallExpression} from "./expressions";

export declare class MathMethodParser {
    static round(args): MethodCallExpression;
    static ceil(args): MethodCallExpression;
    static floor(args): MethodCallExpression;
    static min(args): MethodCallExpression;
    static max(args): MethodCallExpression;
}