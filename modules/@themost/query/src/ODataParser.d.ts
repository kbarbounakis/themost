/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {MemberExpression, MethodCallExpression} from "./expressions";
import {SyntaxToken} from "./SyntaxToken";
import {Token} from "./Token";
import {LiteralToken} from "./LiteralToken";

export declare class ODataParser {
    constructor();
    static create(): ODataParser;
    static isChar(c: any): boolean;
    static isDigit(c: any): boolean;
    static isIdentifierStartChar(c: any): boolean;
    static isWhitespace(c: any): boolean;
    static isIdentifierChar(c: any): boolean;
    static isDigit(c: any): boolean;

    parse(str: string, callback: (err?: Error, res?: any) => void): void;
    getOperator(token: string): string;
    moveNext(): void;
    expect(): void;
    expectAny(): void;
    atEnd(): void;
    atStart(): void;
    parseCommon(callback: (err?: Error, res?: any) => void): void;
    parseCommonItem(callback: (err?: Error, res?: any) => void): void;
    createExpression(left: any,operator: string, right: any): any;
    parseMethodCall(callback: (err?: Error, res?: MethodCallExpression) => void): void;
    parseMethodCallArguments(args: any[], callback: (err?: Error, res?: any) => void): void;
    parseMember(callback: (err?: Error, res?: MemberExpression) => void): void;
    resolveMember(member: any, callback: (err?: Error, res?: any) => void): void;
    resolveMethod(method: any, args: any[], callback: (err?: Error, res?: any) => void): void;
    toList():Token[];
    getNext(): Token;
    parseSyntax(): SyntaxToken;
    parseIdentifier(minus?: boolean): Token;
    parseGuidString(value: string): LiteralToken;
    parseTimeString(value: string): LiteralToken;
    parseBinaryString(value: string): LiteralToken;
    parseDateTimeString(value: string): LiteralToken;
    parseDateTimeOffsetString(value: string): LiteralToken;
    parseSpecialString(value: string, stringType: string): any;
    parseString(): LiteralToken;
    skipDigits(current: any): void;
    parseNumeric(): LiteralToken;
    parseSign(): Token;


}
