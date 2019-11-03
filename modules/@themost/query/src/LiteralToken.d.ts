/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {Token} from "./Token";

/**
 * @interface
 */
export declare interface LiteralType {
    Null: string;
    String: string;
    Boolean: string;
    Single: string;
    Double: string;
    Decimal: string;
    Int: string;
    Long: string;
    Binary: string;
    DateTime: string;
    Guid: string;
    Duration: string;
}

/**
 * @interface
 */
export declare interface StringType {
    None: string;
    Binary: string;
    DateTime: string;
    Guid: string;
    Time: string;
    DateTimeOffset: string;
}

/**
 *
 */
export declare class LiteralToken extends Token {
    static LiteralType: LiteralType;
    static StringType: StringType;
    constructor(value: string, literalType: string);
    static PositiveInfinity : LiteralToken;
    static NegativeInfinity : LiteralToken;
    static NaN : LiteralToken;
    static True : LiteralToken;
    static False : LiteralToken;
    static Null : LiteralToken;

}
