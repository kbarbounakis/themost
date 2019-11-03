/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {Token} from "./Token";

/**
 *
 */
export declare class SyntaxToken extends Token {
    constructor(chr: string);
    syntax: string;
    static ParenOpen : SyntaxToken;
    static ParenClose : SyntaxToken;
    static Slash : SyntaxToken;
    static Comma : SyntaxToken;
    static Negative : SyntaxToken;
}
