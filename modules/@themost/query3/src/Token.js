/**
 * @class Token
 * @abstract Toke
 * @param {String} tokenType
 * @constructor
 */
export class Token {

    static TokenType = {
        Literal: 'Literal',
        Identifier: 'Identifier',
        Syntax: 'Syntax'
    };

    static Operator = {
        Not: '$not',
        // Multiplicative
        Mul: '$mul',
        Div: '$div',
        Mod: '$mod',
        // Additive
        Add: '$add',
        Sub: '$sub',
        // Relational and type testing
        Lt: '$lt',
        Gt: '$gt',
        Le: '$lte',
        Ge: '$gte',
        // Equality
        Eq: '$eq',
        Ne: '$ne',
        // In Values
        In: '$in',
        NotIn: '$nin',
        // Conditional AND
        And: '$and',
        // Conditional OR
        Or: '$or'
    };

    constructor(tokenType) {
        this.type = tokenType;
    }

    /**
     *
     * @returns {boolean}
     */
    //noinspection JSUnusedGlobalSymbols
    isParenOpen() {
        return (this.type === 'Syntax') && (this.syntax === '(');
    }

    /**
     *
     * @returns {boolean}
     */
    //noinspection JSUnusedGlobalSymbols
    isParenClose() {
        return (this.type === 'Syntax') && (this.syntax === ')');
    }

    /**
     *
     * @returns {boolean}
     */
    //noinspection JSUnusedGlobalSymbols
    isSlash() {
        return (this.type === 'Syntax') && (this.syntax === '/');
    }

    /**
     *
     * @returns {boolean}
     */
    //noinspection JSUnusedGlobalSymbols
    isComma() {
        return (this.type === 'Syntax') && (this.syntax === ',');
    }

    /**
     *
     * @returns {boolean}
     */
    //noinspection JSUnusedGlobalSymbols
    isNegative() {
        return (this.type === 'Syntax') && (this.syntax === '-');
    }
}
