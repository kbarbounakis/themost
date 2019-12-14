/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export type SelectClosure = (x: any) => any;
export type FilterClosure = (x: any) => any;

/**
 * @class
 */
export declare class ClosureParser {
    static binaryToExpressionOperator(binaryOperator: string): string;
    parseSelect(func: SelectClosure): any;
    parseFilter(func: FilterClosure): any;
    parseCommon(expr: any): any;
    parseLogical(expr: any): any;
    parseBinary(expr: any): any;
    parseMember(expr: any): any;
    parseMethodCall(expr: any): any;
    parseMethod(expr: any): any;
    parseIdentifier(expr: any): any;
    parseLiteral(expr: any): any;
    resolveMember(member: any): any;
    resolveMethod(method: any): any;
}
