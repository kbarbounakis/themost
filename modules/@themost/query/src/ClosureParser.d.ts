/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

type SelectClosure = (x: any) => any;
type FilterClosure = (x: any) => any;

/**
 * @class
 */
export declare class ClosureParser {
    static binaryToExpressionOperator(binaryOperator: string): string;
    parseSelect(func: SelectClosure, callback: (err: Error, result: any) => void): void;
    parseSelectAsync(func: SelectClosure): Promise<any>;
    parseFilter(func: FilterClosure): void;
    parseFilterAsync(func: FilterClosure): Promise<any>;
    parseCommon(expr: any, callback: (err: Error, result: any) => void): void;
    parseLogical(expr: any, callback: (err: Error, result: any) => void): void;
    parseBinary(expr: any, callback: (err: Error, result: any) => void): void;
    parseMember(expr: any, callback: (err: Error, result: any) => void): void;
    parseMethodCall(expr: any, callback: (err: Error, result: any) => void): void;
    parseMethod(expr: any, callback: (err: Error, result: any) => void): void;
    parseIdentifier(expr: any, callback: (err: Error, result: any) => void): void;
    parseLiteral(expr: any, callback: (err: Error, result: any) => void): void;
    resolveMember(member: any, callback: (err: Error, result: any) => void): void;
    resolveMethod(method: any, callback: (err: Error, result: any) => void): void;
}
