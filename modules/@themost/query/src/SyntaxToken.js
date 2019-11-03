/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {Token} from "./Token";
/**
 * @class
 * @param {String} chr
 * @constructor
 */
export class SyntaxToken extends Token {

    static ParenOpen = new SyntaxToken('(');
    static ParenClose = new SyntaxToken(')');
    static Slash = new SyntaxToken('/');
    static Comma = new SyntaxToken(',');
    static Negative = new SyntaxToken('-');

    constructor(chr) {
        super(Token.TokenType.Syntax);
        this.syntax = chr;
    }

    valueOf() {
        return this.syntax;
    }
}
