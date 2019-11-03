/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import _ from "lodash";
import {sprintf} from 'sprintf';

import {
    createArithmeticExpression,
    createComparisonExpression,
    createLogicalExpression,
    createMemberExpression,
    createMethodCallExpression,
    isArithmeticExpression,
    isArithmeticOperator,
    isComparisonOperator,
    isLogicalExpression,
    isLogicalOperator,
    isMemberExpression,
    isMethodCallExpression
} from './expressions';
import {LiteralToken} from "./LiteralToken";
import {Token} from "./Token";
import {IdentifierToken} from "./IdentifierToken";
import {SyntaxToken} from "./SyntaxToken";
import {TimeSpan} from "./TimeSpan";

/**
 * @class
 * @constructor
 */
export class ODataParser {

    static ArithmeticOperatorRegEx = /^(\$add|\$sub|\$mul|\$div|\$mod)$/g;
    static LogicalOperatorRegEx = /^(\$or|\$nor|\$not|\$and)$/g;

    static DurationRegex = /^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?T?(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d*)?)S)?$/g;
    static GuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/g;
    static DateTimeRegex = /^(\d{4})(?:-?W(\d+)(?:-?(\d+)D?)?|(?:-(\d+))?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/;

    static REGEXP_CHAR = /[a-zA-Z]/g;
    static REGEXP_DIGIT = /[0-9]/g;
    static CHR_WHITESPACE = ' ';
    static CHR_UNDERSCORE = '_';
    static CHR_DOLLAR_SIGN = '$';
    static CHR_POINT = '.';

    constructor() {

        /**
         * @type {number}
         * @private
         */
        this.current = 0;
        /**
         * @type {number}
         * @private
         */
        this.offset = 0;
        /**
         * @type {string}
         */
        this.source = null;
        /**
         * @type {Array}
         */
        this.tokens = [];
        /**
         * Gets current token
         * @type {Token}
         */
        this.currentToken = undefined;
        /**
         * Gets next token
         * @type {Token}
         */
        this.nextToken = undefined;
        /**
         * Gets previous token
         * @type {Token}
         */
        this.previousToken = undefined;

        const self = this;
        Object.defineProperty(this,'nextToken', {
            get:function() {
                return (self.offset < self.tokens.length - 1) ? self.tokens[self.offset+1] : null;
            },
            configurable:false, enumerable:false
        });

        Object.defineProperty(this,'previousToken', {
            get:function() {
                return ((self.offset > 0) && (self.tokens.length>0)) ? self.tokens[self.offset-1] : null;
        },
        configurable:false, enumerable:false
        });

        Object.defineProperty(this,'currentToken', {
            get:function() {
                return (self.offset < self.tokens.length) ? self.tokens[self.offset] : null;
        },
        configurable:false, enumerable:false
        });

    }

    /**
     * Creates a new instance of ODataParser class
     * @return {ODataParser}
     */
    static create() {
        return new ODataParser();
    }

    /**
     * Gets the logical or arithmetic operator of the given token
     * @param token
     */
    getOperator(token) {
        if (token.type===Token.TokenType.Identifier) {
            switch (token.identifier)
            {
                case "and": return Token.Operator.And;
                case "or": return Token.Operator.Or;
                case "eq": return Token.Operator.Eq;
                case "ne": return Token.Operator.Ne;
                case "lt": return Token.Operator.Lt;
                case "le": return Token.Operator.Le;
                case "gt": return Token.Operator.Gt;
                case "ge": return Token.Operator.Ge;
                case "in": return Token.Operator.In;
                case "nin": return Token.Operator.NotIn;
                case "add": return Token.Operator.Add;
                case "sub": return Token.Operator.Sub;
                case "mul": return Token.Operator.Mul;
                case "div": return Token.Operator.Div;
                case "mod": return Token.Operator.Mod;
                case "not": return Token.Operator.Not;
            }
        }
        return null;
    }

    /**
     * Parses an open data filter and returns the equivalent query expression
     * @param {String} str
     * @param {Function} callback
     */
    parse(str, callback) {
        const self = this;
        //ensure callback
        callback = callback || (() => {});
        if (typeof str !== 'string')
        {
            callback.call(this);
            return;
        }
        /**
         * @private
         * @type {number}
         */
        this.current = 0;
        /**
         * @private
         * @type {number}
         */
        this.offset = 0;
        /**
         * Gets or sets the source expression that is going to be parsed
         * @type {String}
         */
        this.source = str;
        //get tokens
        this.tokens = this.toList();
        //reset offset
        this.offset=0; this.current=0;
        //invoke callback
        this.parseCommon((err, result) => {
            try {
                if (result) {
                    if (typeof result.exprOf === 'function') {
                        return callback.call(self, err, result.exprOf());
                    }
                }
                callback.call(self, err, result);
            }
            catch(e) {
                callback.call(self, e);
            }
        });

    }

    moveNext() {
       this.offset++;
    }

    /**
     * @param {Token} token
     */
    expect(token) {
        const self = this;
        if (self.currentToken.valueOf()!==token.valueOf())
            throw new Error(`Expected ${token.valueOf()}`);
        this.moveNext();
    }

    expectAny() {
        if (this.atEnd())
            throw new Error('Unexpected end.');
    }

    atEnd() {
        return this.offset >= this.tokens.length;
    }

    //noinspection JSUnusedGlobalSymbols
    atStart() {
        return this.offset === 0;
    }

    /**
     * Parses OData token
     * @param {Function} callback
     */
    parseCommon(callback) {
        const self = this;
        //ensure callback
        callback = callback || (() => {});
        if (self.tokens.length===0) {
            return callback.call(self);
        }
        self.parseCommonItem((err, result) => {
            if (err) {
                callback.call(self, err);
            }
            else {
                if (self.atEnd()) {
                    callback.call(self, null, result);
                }
                //method call exception for [,] or [)] tokens e.g indexOf(Title,'...')
                else if ((self.currentToken.syntax===SyntaxToken.Comma.syntax) ||
                    (self.currentToken.syntax===SyntaxToken.ParenClose.syntax)) {
                    callback.call(self, null, result);
                }
                else {
                    const op = self.getOperator(self.currentToken);
                    if (op===null) {
                        callback.call(self, new Error('Expected operator.'));
                    }
                    else {
                        self.moveNext();
                        self.parseCommonItem((err, right) => {
                            if (err) {
                                callback.call(self, err);
                            }
                            else {
                                //create odata expression
                                const expr = self.createExpression(result, op, right);
                                if (!self.atEnd() && (isLogicalOperator(self.getOperator(self.currentToken)))) {
                                    const op2 = self.getOperator(self.currentToken);
                                    self.moveNext();
                                    return self.parseCommon((err, result) => {
                                        if (err) {
                                            return callback(err);
                                        }
                                        else {
                                            return callback.call(self, null, self.createExpression(expr, op2, result));
                                        }
                                    });
                                }
                                callback.call(self, null, expr);
                            }
                        });
                    }
                }
            }
        });
    }

    /**
     * @param {*=} left The left operand
     * @param {String=} operator The operator
     * @param {*=} right The right operand
     */
    createExpression(left, operator, right) {

        if (isLogicalOperator(operator))
        {
            let expr = null;
            if (isLogicalExpression(left))
            {
                if (left.operator===operator) {
                    expr = createLogicalExpression(operator);
                    for (let i = 0; i < left.args.length; i++) {
                        const o = left.args[i];
                        expr.args.push(o);
                    }
                    expr.args.push(right);
                }
                else {
                    expr = createLogicalExpression(operator, [left, right]);
                }
            }
            else
            {
                expr = createLogicalExpression(operator, [left, right]);
            }
            return expr;
        }
        else if (isArithmeticOperator(operator)) {
            return createArithmeticExpression(left, operator, right);
        }
        else if (isArithmeticExpression(left) || isMethodCallExpression(left) || isMemberExpression(left))  {
                return createComparisonExpression(left, operator, right);
        }
        else if (isComparisonOperator(operator)) {
            return createComparisonExpression(left,operator, right);
        }
        else {
            throw new Error('Invalid or unsupported expression arguments.');
        }
    }

    parseCommonItem(callback) {
        const self = this;
        //ensure callback
        callback = callback || (() => {});
        if (self.tokens.length===0) {
            return callback.call(self);
        }
        switch (this.currentToken.type) {
            case Token.TokenType.Identifier:
                //if next token is an open parenthesis token and the current token is not an operator. current=indexOf, next=(
                if ((self.nextToken.syntax===SyntaxToken.ParenOpen.syntax) && (_.isNil(self.getOperator(self.currentToken))))
                {
                    //then parse method call
                    self.parseMethodCall(callback);
                }
                else if (self.getOperator(self.currentToken) === Token.Operator.Not)
                {
                    callback.call(self,new Error('Not operator is not yet implemented.'));
                    return;
                }
                else
                {
                    self.parseMember((err, result) => {
                        if (err) {
                            callback.call(self,err);
                        }
                        else {
                            while (!self.atEnd() && self.currentToken.syntax===SyntaxToken.Slash.syntax) {
                                //self.moveNext();
                                //self.parseMembers(callback)
                                callback.call(self,new Error('Slash syntax is not yet implemented.'));
                            }
                        }
                        self.moveNext();
                        callback.call(self, null, result);
                    });

                }
                break;
            // eslint-disable-next-line no-case-declarations
            case Token.TokenType.Literal:
                const value = self.currentToken.value;
                self.moveNext();
                callback.call(self, null, value);
                break;
            case Token.TokenType.Syntax:
                if (self.currentToken.syntax === SyntaxToken.Negative.syntax) {
                    callback.call(self,new Error('Negative syntax is not yet implemented.'));
                    return;
                }
                if (self.currentToken.syntax === SyntaxToken.ParenOpen.syntax) {
                    self.moveNext();
                    self.parseCommon((err, result) => {
                        if (err) {
                            callback.call(self, err);
                        }
                        else {
                            self.expect(SyntaxToken.ParenClose);
                            callback.call(self, null, result);
                        }
                    });
                }
                else {
                    return callback.call(self,new Error('Expected syntax.'));
                }
                break;
            default:break;
        }

    }

    parseMethodCall(callback) {
        const self = this;
        //ensure callback
        callback = callback || (() => {});
        if (this.tokens.length===0)
            callback.call(this);
        else
        {
            //get method name
            const method = self.currentToken.identifier;
            self.moveNext();
            self.expect(SyntaxToken.ParenOpen);
            const args = [];
            self.parseMethodCallArguments(args, (err) => {
                if (err) {
                    callback.call(self, err);
                }
                else {
                    self.resolveMethod(method, args, (err, expr) => {
                       if (err) {
                           callback.call(self, err);
                       }
                       else {
                           if (_.isNil(expr))
                               callback.call(self, null, createMethodCallExpression(method, args));
                           else
                               callback.call(self, null, expr);
                       }
                    });

                }
            });
        }
    }

    parseMethodCallArguments(args, callback) {
        const self = this;
        //ensure callback
        callback = callback || (() => {});
        args = args || [];
        self.expectAny();
        if (self.currentToken.syntax===SyntaxToken.Comma.syntax) {
            self.moveNext();
            self.expectAny();
            self.parseMethodCallArguments(args, callback);
        }
        else if (self.currentToken.syntax===SyntaxToken.ParenClose.syntax) {
            self.moveNext();
            callback(null, arguments);
        }
        else {
            self.parseCommon((err, result) => {
                if (err) {
                    callback(err);
                }
                else {
                    args.push(result);
                    self.parseMethodCallArguments(args, callback);
                }
            });
        }

    }

    parseMember(callback) {
        const self = this;
        //ensure callback
        callback = callback || (() => {});
        if (this.tokens.length===0) {
            callback.call(this);
        }
        else {
            if (this.currentToken.type!=='Identifier') {
                callback.call(self, new Error('Expected identifier.'));
            }
            else {
                let identifier = this.currentToken.identifier;
                while (this.nextToken && this.nextToken.syntax===SyntaxToken.Slash.syntax) {
                    //read syntax token
                    this.moveNext();
                    //get next token
                    if (this.nextToken.type !== 'Identifier')
                        callback.call(self, new Error('Expected identifier.'));
                    //read identifier token
                    this.moveNext();
                    //format identifier
                    identifier += '/' + this.currentToken.identifier;
                }
                //support member to member comparison (with $it identifier e.g. $it/address/city or $it/category etc)
                if (/^\$it\//.test(identifier)) {
                    identifier= identifier.replace(/^\$it\//,'');
                }
                //search for multiple nested member expression (e.g. a/b/c)
                self.resolveMember(identifier, (err, member) => {
                    callback.call(self, err, createMemberExpression(member));
                });
            }
        }
    }

    /**
     * Abstract function which resolves entity based on the given member name
     * @param {string} member
     * @param {Function} callback
     */
    resolveMember(member, callback) {
        if (typeof callback !== 'function')
            //sync process
            return member;
        else
            callback.call(this, null, member);
    }

    /**
     * Resolves a custom method of the given name and arguments and returns an equivalent MethodCallExpression instance.
     * @param method
     * @param args
     * @param callback
     * @returns {MethodCallExpression}
     */
    resolveMethod(method, args, callback) {
        if (typeof callback !== 'function')
            //sync process
            return null;
        else
            callback.call(this);
    }

    ///**
    // * Resolves an equivalent expression based on the given OData token
    // * @param {Token} token
    // */
    //ODataParser.prototype.resolveVariable = function(token, callback) {
    //    return null;
    //};

    /**
     * Get a collection of tokens by parsing the current expression
     * @returns {Array}
     */
    toList() {
        if (typeof this.source !== 'string')
            return [];
        this.current = 0;
        this.offset = 0;
        const result = [];
        let token = this.getNext();
        while (token)
        {
            result.push(token);
            token = this.getNext();
        }
        return result;
    }

    /**
     * @returns Token
     */
    getNext() {
        let _current = this.current;
        const _source = this.source;
        let _offset = this.offset;

        if (_offset >= _source.length)
            return null;

        while (_offset < _source.length && ODataParser.isWhitespace(_source.charAt(_offset)))
        {
            _offset++;
        }
        if (_offset >= _source.length)
            return null;
        _current = _offset;
        this.current = _current;
        const c = _source.charAt(_current);
        switch (c)
        {
            case '-':
                return this.parseSign();

            case '\'':
                return this.parseString();

            case '(':
            case ')':
            case ',':
            case '/':
                return this.parseSyntax();
            default:
                if (ODataParser.isDigit(c))
                {
                    return this.parseNumeric();
                }
                else if (ODataParser.isIdentifierStartChar(c))
                {
                    return this.parseIdentifier(false);
                }
                else
                {
                    throw new Error(`Unexpected character ${c} at offset ${_current}.`);
                }
        }
    }

    /**
     * @returns {Token}
     */
    parseSyntax() {
        /**
         * @type {Token}
         */
        let token = null;
        switch (this.source.charAt(this.current))
        {
            case '(': token = SyntaxToken.ParenOpen; break;
            case ')': token = SyntaxToken.ParenClose; break;
            case '/': token = SyntaxToken.Slash; break;
            case ',': token = SyntaxToken.Comma; break;
            default : throw new Error('Unknown token');
        }
        this.offset = this.current + 1;

        return token;
    }

    /**
     * @returns {Token}
     */
    parseIdentifier(minus) {
        let _current = this.current;
        const _source = this.source;
        let _offset = this.offset;

        for (_current++; _current < _source.length; _current++)
        {
            const c = _source.charAt(_current);
            if (ODataParser.isIdentifierChar(c)===false)
                break;
        }

        const name = _source.substr(_offset, _current - _offset).trim();

        const lastOffset = _offset;
        _offset = _current;
        switch (name)
        {
            case "INF":
                this.current = _current;this.offset=_offset;
                return LiteralToken.PositiveInfinity;

            case "-INF":
                this.current = _current;this.offset=_offset;
                return LiteralToken.NegativeInfinity;

            case "Nan":
                this.current = _current;this.offset=_offset;
                return LiteralToken.NaN;

            case "true":
                this.current = _current;this.offset=_offset;
                return LiteralToken.True;

            case "false":
                this.current = _current;this.offset=_offset;
                return LiteralToken.False;

            case "null":
                this.current = _current;this.offset=_offset;
                return LiteralToken.Null;

            case "-":
                this.current = _current;this.offset=_offset;
                return SyntaxToken.Negative;

            default:
                if (minus) {
                    // Reset the offset.
                    _offset = lastOffset + 1;
                    this.current = _current;this.offset=_offset;
                    return SyntaxToken.Negative;
                }
                this.current = _current;this.offset=_offset;
                break;
        }
        if (_offset < _source.length && _source.charAt(_offset) === '\'')
        {
            let stringType;
            switch (name)
            {
                case "X": stringType = LiteralToken.StringType.Binary; break;
                case "binary": stringType = LiteralToken.StringType.Binary; break;
                case "datetime": stringType = LiteralToken.StringType.DateTime; break;
                case "guid": stringType = LiteralToken.StringType.Guid; break;
                case "time": stringType = LiteralToken.StringType.Time; break;
                case "datetimeoffset": stringType = LiteralToken.StringType.DateTimeOffset; break;
                default: stringType = LiteralToken.StringType.None; break;
            }

            if (stringType !== LiteralToken.StringType.None && _source.charAt(_offset) === '\'')
            {
                const content = this.parseString();
                return this.parseSpecialString(content.value, stringType);
            }
        }
        return new IdentifierToken(name);
    }

    /**
     * Parses a guid string and returns an open data token.
     * @returns Token
     */
    parseGuidString(value) {
        if (typeof value !== 'string')
            throw new Error(`Invalid argument at ${this.offset}.`);
        if (_.isNil(value.match(ODataParser.GuidRegex)))
            throw new Error(sprintf('Guid format is invalid at %s.', this.offset));
        return new LiteralToken(value, LiteralToken.LiteralType.Guid);
    }

    /**
     * Parses a time string and returns an open data token.
     * @returns Token
     */
    parseTimeString(value) {
        if (value == null)
            return null;
        const match = value.match(ODataParser.DurationRegex);
        if (match)
        {
            const negative = (match[1] === "-");
            const year = match[2].length > 0 ? parseInt(match[2]) : 0, month = match[3].length > 0 ? parseInt(match[3]) : 0, day = match[4].length > 0 ? parseInt(match[4]) : 0, hour = match[5].length > 0 ? parseInt(match[5]) : 0, minute = match[6].length > 0 ? parseInt(match[6]) : 0, second = match[7].length > 0 ? parseFloat(match[7]) : 0;
            return new LiteralToken(new TimeSpan(year, month, day, hour, minute, second), LiteralToken.LiteralType.Duration);
        }
        else
        {
            throw new Error(sprintf('Duration format is invalid at %s.', this.offset))
        }
    }

    /**
     * Parses a date time offset string and returns an open data token
     * @param value
     * @returns {LiteralToken}
     */
    // eslint-disable-next-line no-unused-vars
    parseBinaryString(value) {
        throw new Error('Not Implemented');
    }

    /**
     * Parses a date time offset string and returns an open data token
     * @param value
     * @returns {LiteralToken}
     */
    parseDateTimeOffsetString(value) {
        return this.parseDateTimeString(value);
    }

    /**
     * Parses a date time string and returns an open data token
     * @param value
     * @returns {LiteralToken}
     */
    parseDateTimeString(value) {
        if (_.isNil(value))
            return null;
        const match = value.match(ODataParser.DateTimeRegex);
        if (match)
        {
            return new LiteralToken(new Date(value), LiteralToken.LiteralType.DateTime);
        }
        else
        {
            throw new Error(sprintf('Datetime format is invalid at %s.', this.offset))
        }
    }

    /**
     * @returns Token
     */
    parseSpecialString(value, stringType) {
        switch (stringType)
        {
            case LiteralToken.StringType.Binary:
                return this.parseBinaryString(value);

            case LiteralToken.StringType.DateTime:
                return this.parseDateTimeString(value);

            case LiteralToken.StringType.DateTimeOffset:
                return this.parseDateTimeOffsetString(value);

            case LiteralToken.StringType.Guid:
                return this.parseGuidString(value);

            case LiteralToken.StringType.Time:
                return this.parseTimeString(value);

            default:
                throw new Error('Argument stringType was out of range.');
        }
    }

    /**
     * @returns {Token}
     */
    parseString() {
        let hadEnd = false;
        let _current = this.current;
        const _source = this.source;
        const _offset = this.offset;
        let sb = '';
        for (_current++; _current < _source.length; _current++)
        {
            const c = this.source.charAt(_current);

            if (c === '\'')
            {
                if ((_current < _source.length - 1) && (_source.charAt(_current+1) === '\'')) {
                    _current++;
                    sb += '\'';
                }
                else
                {
                    hadEnd = true;
                    break;
                }
            }
            else
            {
                sb +=c;
            }
        }

        if (!hadEnd)
        {
            throw new Error(sprintf('Unterminated string starting at %s', _offset));
        }
        this.current = _current;
        this.offset = _current + 1;
        return new LiteralToken(sb, LiteralToken.LiteralType.String);
    }

    skipDigits(current) {
        const _source = this.source;
        if (!ODataParser.isDigit(_source.charAt(current)))
            return null;
        current++;
        while (current < _source.length && ODataParser.isDigit(_source.charAt(current))) {
            current++;
        }
        return current;
    }

    /**
     * @returns {Token}
     */
    parseNumeric() {
        let _current = this.current;
        const _source = this.source;
        let _offset = this.offset;
        let floating = false;
        let c = null;

        for (_current++; _current < _source.length; _current++)
        {
            c = _source.charAt(_current);
            if (c === ODataParser.CHR_POINT)
            {
                if (floating)
                    break;
                floating = true;
            }
            else if (!ODataParser.isDigit(c))
            {
                break;
            }
        }
        let haveExponent = false;
        if (_current < _source.length)
        {
            c = _source.charAt(_current);
            if (c === 'E' || c === 'e')
            {
                _current++;
                if (_source.charAt(_current) === '-')
                    _current++;
                const exponentEnd = (_current === _source.length) ? null : this.skipDigits(_current);
                if (_.isNil(exponentEnd))
                    throw new Error(sprintf('Expected digits after exponent at %s.', _offset));
                _current = exponentEnd;
                haveExponent = true;

                if (_current < _source.length) {
                    c = _source.charAt(_current);
                    if (c === 'm' || c === 'M')
                        throw new Error(sprintf('Unexpected exponent for decimal literal at %s.', _offset));
                    else if (c === 'l' || c === 'L')
                        throw new Error(sprintf('Unexpected exponent for long literal at %s.', _offset));
                }
            }
        }

        const text = _source.substr(_offset, _current - _offset);
        let value = null;
        let type = null;

        if (_current < _source.length)
        {
            c = _source.charAt(_current);

            switch (c)
            {
                case 'F':
                case 'f':
                    value = parseFloat(text);
                    type = LiteralToken.LiteralType.Single;
                    _current++;
                    break;

                case 'D':
                case 'd':
                    value = parseFloat(text);
                    type = LiteralToken.LiteralType.Double;
                    _current++;
                    break;

                case 'M':
                case 'm':
                    value = parseFloat(text);
                    type = LiteralToken.LiteralType.Decimal;
                    _current++;
                    break;

                case 'L':
                case 'l':
                    value = parseInt(text);
                    type = LiteralToken.LiteralType.Long;
                    _current++;
                    break;

                default:
                    if (floating || haveExponent)
                    {
                        value = parseFloat(text);
                        type = LiteralToken.LiteralType.Double;
                    }
                    else
                    {
                        value = parseInt(text);
                        type = LiteralToken.LiteralType.Int;
                    }
                    break;
            }
        }
        else
        {
            if (floating || haveExponent)
            {
                value = parseFloat(text);
                type = LiteralToken.LiteralType.Double;
            }
            else
            {
                value = parseInt(text);
                type = LiteralToken.LiteralType.Int;
            }
        }

        _offset = _current;
        this.offset = _offset;
        this.current = _current;
        return new LiteralToken(value, type);
    }

    /**
     * @returns {Token}
     */
    parseSign() {
        this.current++;
        if (ODataParser.isDigit(this.source.charAt(this.current)))
            return this.parseNumeric();
        else
            return this.parseIdentifier(true);
    }

    /**
     * @param {String} c
     * @returns {boolean}
     */
    static isChar(c) {
        return !!c.match(ODataParser.REGEXP_CHAR);
    }

    /**
     * @param {String} c
     * @returns {boolean}
     */
    static isDigit(c) {
        return !!c.match(ODataParser.REGEXP_DIGIT);
    }

    static isIdentifierStartChar(c) {
        return (c === ODataParser.CHR_UNDERSCORE) || (c === ODataParser.CHR_DOLLAR_SIGN) || ODataParser.isChar(c);
    }

    /**
      * @param {String} c
     * @returns {boolean}
     */
    static isWhitespace(c) {
        return (c === ODataParser.CHR_WHITESPACE);
    }

    static isIdentifierChar(c) {
        return ODataParser.isIdentifierStartChar(c) || ODataParser.isDigit(c);
    }
}



