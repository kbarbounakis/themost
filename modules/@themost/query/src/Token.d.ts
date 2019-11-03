/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
/**
 * @interface
 */
export declare interface TokenType {
    Literal : string;
    Identifier: string;
    Syntax: string;
}

/**
 * @interface
 */
export declare interface OperatorType {
    Not: string;
    Mul: string;
    Div: string;
    Mod: string;
    Add: string;
    Sub: string;
    Lt: string;
    Gt: string;
    Le: string;
    Ge: string;
    Eq: string;
    Ne: string;
    In: string;
    NotIn: string;
    And: string;
    Or: string;
}

/**
 *
 */
export declare class Token {
    constructor(tokenType: string);

    static TokenType: TokenType;
    static Operator: OperatorType;

    isParenOpen(): boolean;
    isParenClose(): boolean;
    isSlash(): boolean;
    isComma(): boolean;
    isNegative(): boolean;

}
