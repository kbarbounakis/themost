/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {createLogicalExpression,
        isArithmeticOperator, createArithmeticExpression,
        createComparisonExpression,
        createLiteralExpression, isLiteralExpression,
        createMethodCallExpression, isComparisonOperator,
        createMemberExpression, Operators} from './expressions';
import esprima from 'esprima';
import async from 'async';
import _ from 'lodash';

const ExpressionTypes = {
    LogicalExpression : 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    MemberExpression: 'MemberExpression',
    MethodExpression: 'MethodExpression',
    Identifier: 'Identifier',
    Literal: 'Literal',
    Program: 'Program',
    ExpressionStatement : 'ExpressionStatement',
    UnaryExpression:'UnaryExpression',
    FunctionExpression:'FunctionExpression',
    BlockStatement:'BlockStatement',
    ReturnStatement:'ReturnStatement',
    CallExpression:'CallExpression'
};

/**
 * @class ClosureParser
 * @constructor
 */
export class ClosureParser {
    constructor() {
        /**
         * @type Array
         */
        this.namedParams = [];
        /**
         * @type {*}
         */
        this.parsers = { };

    }

    /**
     * Parses a javascript expression and returns the equivalent QueryExpression instance.
     * @param {Function} fn The closure expression to parse
     * @param {Function} callback
     */
    parseFilter(fn, callback) {
        const self = this;
        if (typeof fn === 'undefined' || fn === null ) {
            callback();
            return;
        }
        try {
            //convert the given function to javascript expression
            const expr = esprima.parse('void(' + fn.toString() + ')');
            //get FunctionExpression
            const fnExpr = expr.body[0].expression.argument;
            if (_.isNil(fnExpr)) {
                callback(new Error('Invalid closure statement. Closure expression cannot be found.'));
                return;
            }
            //get named parameters
            self.namedParams = fnExpr.params;
            //validate expression e.g. return [EXPRESSION];
            if (fnExpr.body.body[0].type!==ExpressionTypes.ReturnStatement) {
                callback(new Error('Invalid closure syntax. A closure expression must return a value.'));
                return;
            }
            const closureExpr =  fnExpr.body.body[0].argument;
            //parse this expression
            this.parseCommon(closureExpr, (err, result) => {
                //and finally return the equivalent query expression
                if (result) {
                    if (typeof result.exprOf === 'function') {
                        callback.call(self, err, result.exprOf());
                        return;
                    }
                }
                callback.call(self, err, result);
            });
        }
        catch(e) {
            callback(e);
        }

    }

    parseCommon(expr, callback) {
        if (expr.type === ExpressionTypes.LogicalExpression) {
            this.parseLogical(expr, callback);
        }
        else if (expr.type === ExpressionTypes.BinaryExpression) {
            this.parseBinary(expr, callback);
        }
        else if (expr.type === ExpressionTypes.Literal) {
            this.parseLiteral(expr, callback);
        }
        else if (expr.type === ExpressionTypes.MemberExpression) {
            this.parseMember(expr, callback);
        }
        else if (expr.type === ExpressionTypes.CallExpression) {
            this.parseMethod(expr, callback);
        }
        else if (expr.type === ExpressionTypes.Identifier) {
            this.parseIdentifier(expr, callback);
        }
        else {
            callback(new Error('The given expression is not yet implemented (' + expr.type + ').'));
        }
    }

    parseLogical(expr, callback) {
        const self = this;
        const op = (expr.operator === '||') ? Operators.Or : Operators.And;
        //validate operands
        if (_.isNil(expr.left) || _.isNil(expr.right)) {
            callback(new Error('Invalid logical expression. Left or right operand is missing or undefined.'));
        }
        else {
            self.parseCommon(expr.left, (err, left) => {
                if (err) {
                    callback(err);
                }
                else {
                    self.parseCommon(expr.right, (err, right) => {
                        if (err) {
                            callback(err);
                        }
                        else {
                            //create expression
                            callback(null, createLogicalExpression(op, [left, right]));
                        }
                    });
                }
            });
        }

    }

    /**
     * @static
     * @param {string} op
     * @returns {*}
     */
    static BinaryToExpressionOperator(op) {
      switch (op) {
          case '===':
          case '==':
              return Operators.Eq;
          case '!=':
              return Operators.Ne;
          case '>':
              return Operators.Gt;
          case '>=':
              return Operators.Ge;
          case '<':
              return Operators.Lt;
          case '<=':
              return Operators.Le;
          case '-':
              return Operators.Sub;
          case '+':
              return Operators.Add;
          case '*':
              return Operators.Mul;
          case '/':
              return Operators.Div;
          case '%':
              return Operators.Mod;
          default:
              return;
      }
    }

    parseBinary(expr, callback) {
        const self = this;
        const op = ClosureParser.BinaryToExpressionOperator(expr.operator);
        if (_.isNil(op)) {
            callback(new Error('Invalid binary operator.'));
        }
        else {
            self.parseCommon(expr.left, (err, left) => {
                if (err) {
                    callback(err);
                }
                else {
                    self.parseCommon(expr.right, (err, right) => {
                        if (err) {
                            callback(err);
                        }
                        else {
                            if (isArithmeticOperator(op)) {
                                //validate arithmetic arguments
                                if (isLiteralExpression(left) && isLiteralExpression(right)) {
                                    //evaluate expression
                                    switch (op) {
                                        case Operators.Add:
                                            callback(null, left.value + right.value);
                                            break;
                                        case Operators.Sub:
                                            callback(null, left.value - right.value);
                                            break;
                                        case Operators.Div:
                                            callback(null, left.value / right.value);
                                            break;
                                        case Operators.Mul:
                                            callback(null, left.value * right.value);
                                            break;
                                        case Operators.Mod:
                                            callback(null, left.value % right.value);
                                            break;
                                        default:
                                            callback(new Error('Invalid arithmetic operator'));
                                    }
                                }
                                else {
                                    callback(null, createArithmeticExpression(left, op, right));
                                }

                            }
                            else if (isComparisonOperator(op)) {
                                callback(null, createComparisonExpression(left, op, right));
                            }
                            else {
                                callback(new Error('Unsupported binary expression'));
                            }
                        }
                    });
                }
            });
        }

    }

    parseMember(expr, callback) {
        try {
            const self = this;
            if (expr.property) {
                const namedParam = self.namedParams[0];
                if (_.isNil(namedParam)) {
                    callback('Invalid or missing closure parameter');
                    return;
                }
                if (expr.object.name===namedParam.name) {
                    self.resolveMember(expr.property.name, (err, member) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(null, createMemberExpression(member));
                    });
                }
                else {
                    let value;
                    if (_.isNil(expr.object.object)) {
                        //evaluate object member value e.g. item.title or item.status.id
                        value = self.eval(memberExpressionToString(expr));
                        callback(null, createLiteralExpression(value));
                        return;
                    }
                    if (expr.object.object.name===namedParam.name) {
                        //get closure parameter expression e.g. x.title.length
                        const property = expr.property.name;
                        self.parseMember(expr.object, (err, result) => {
                            if (err) { callback(err); return; }
                            callback(null, createMethodCallExpression(property, [result]));
                        });
                    }
                    else {
                        //evaluate object member value e.g. item.title or item.status.id
                        value = self.eval(memberExpressionToString(expr));
                        callback(null, createLiteralExpression(value));
                    }

                }
            }
            else
                callback(new Error('Invalid member expression.'));
        }
        catch(e) {
            callback(e);
        }
    }

    /**
     * @private
     * @param {*} expr
     * @param {function(Error=,*=)} callback
     */
    parseMethodCall(expr, callback) {
        const self = this;
        if (_.isNil(expr.callee.object)) {
            callback(new Error('Invalid or unsupported method expression.'));
            return;
        }
        let method = expr.callee.property.name;
        self.parseMember(expr.callee.object, function(err, result) {
            if (err) { callback(err); return; }
            const args = [result];
            async.eachSeries(expr.arguments, (arg, cb) => {
                self.parseCommon(arg, (err, result) => {
                    if (err) { cb(err); return; }
                    args.push(result);
                    cb();
                });
            }, err => {
                if (err) {
                    callback(err);
                    return;
                }
                try {
                    if (typeof self.parsers[method] === 'function') {
                        self.parsers[method](method, args, callback);
                    }
                    else {
                        switch (method) {
                            case 'getDate': method='day';break;
                            case 'getMonth': method='month';break;
                            case 'getYear':
                            case 'getFullYear':
                                method='date';break;
                            case 'getMinutes': method='minute';break;
                            case 'getSeconds': method='second';break;
                            case 'getHours': method='hour';break;
                            case 'startsWith': method='startswith';break;
                            case 'endsWith': method='endswith';break;
                            case 'trim': method='trim';break;
                            case 'toUpperCase': method='toupper';break;
                            case 'toLowerCase': method='tolower';break;
                            case 'floor': method='floor';break;
                            case 'ceiling': method='ceiling';break;
                            case 'indexOf': method='indexof';break;
                            case 'substring':
                            case 'substr':
                                method='substring';break;
                            default:
                                callback(new Error('The specified method ('+ method +') is unsupported or is not yet implemented.'));
                                return;
                        }
                        callback(null, createMethodCallExpression(method, args));
                    }

                }
                catch(e) {
                    callback(e);
                }

            })

        });

    }

    parseMethod(expr, callback) {

        const self = this;
        try {
            //get method name
            let name = expr.callee.name;

            const args = [];
            let needsEvaluation = true;
            let thisName;
            if (_.isNil(name)) {
                if (!_.isNil(expr.callee.object)) {
                    if (!_.isNil(expr.callee.object.object)) {
                        if (expr.callee.object.object.name===self.namedParams[0].name) {
                            self.parseMethodCall(expr, callback);
                            return;
                        }
                    }
                }
                name = memberExpressionToString(expr.callee);
                thisName = parentMemberExpressionToString(expr.callee);
            }
            //get arguments
            async.eachSeries(expr.arguments, (arg, cb) => {
                self.parseCommon(arg, (err, result) => {
                    if (err) {
                        cb(err);
                    }
                    else {
                        args.push(result);
                        if (!isLiteralExpression(result))
                            needsEvaluation = false;
                        cb();
                    }
                });
            }, err => {
                try {
                    if (err) { callback(err); return; }
                    if (needsEvaluation) {
                        const fn = self.eval(name);
                        let thisArg;
                        if (thisName)
                            thisArg = self.eval(thisName);
                        callback(null, createLiteralExpression(fn.apply(thisArg, args.map(x => { return x.value; }))));
                    }
                    else {
                        callback(null, createMethodCallExpression(name, args));
                    }
                }
                catch(e) {
                    callback(e);
                }
            });
        }
        catch(e) {
            callback(e);
        }
    }

    parseIdentifier(expr, callback) {
        try {
            const value = this.eval(expr.name);
            callback(null, createLiteralExpression(value));
        }
        catch (e) {
            callback(e);
        }

    }

    parseLiteral(expr, callback) {
        callback(null, createLiteralExpression(expr.value));
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
}

function memberExpressionToString(expr) {
    if (_.isNil(expr.object.object)) {
        return expr.object.name + '.' + expr.property.name
    }
    else {
        return memberExpressionToString(expr.object) + '.' + expr.property.name;
    }
}

function parentMemberExpressionToString(expr) {
    if (_.isNil(expr.object.object)) {
        return expr.object.name;
    }
    else {
        return memberExpressionToString(expr.object);
    }
}
