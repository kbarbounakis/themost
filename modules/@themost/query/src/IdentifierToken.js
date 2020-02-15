import {Token} from "./Token";
/**
 * @class IdentifierToken
 * @param {string} name The identifier's name
 * @constructor
 */
export class IdentifierToken extends Token {
    constructor(name) {
        super(Token.TokenType.Identifier);
        this.identifier = name;
    }

    valueOf() {
        return this.identifier;
    }
}
