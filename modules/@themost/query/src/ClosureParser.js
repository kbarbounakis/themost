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
import {parse} from 'esprima';
import async from 'async';
import {Args} from '@themost/common';

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
    CallExpression:'CallExpression',
    ObjectExpression:'ObjectExpression'
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

    parseSelect(func, callback) {
        if (func == null) {
            return callback();
        }
        Args.check(typeof func === 'function', new Error('Select closure must a function.'));
        //convert the given function to javascript expression
        const expr = parse('void(' + func.toString() + ')');
        //validate expression e.g. return [EXPRESSION];
        const funcExpr = expr.body[0].expression.argument;
        //get named parameters
        this.namedParams = funcExpr.params;
        return this.parseCommon(funcExpr.body, (err, result) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, result);
            });
    }

    async parseSelectAsync(func) {
        return await new Promise((resolve, reject) => {
            return this.parseSelect(func, (err, result) => {
                if (err) {
                    return reject(err);
                } 
                return resolve(result);
            });
        });
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
            const expr = parse('void(' + fn.toString() + ')');
            //get FunctionExpression
            const fnExpr = expr.body[0].expression.argument;
            if (fnExpr == null) {
                callback(new Error('Invalid closure statement. Closure expression cannot be found.'));
                return;
            }
            //get named parameters
            self.namedParams = fnExpr.params;
            //validate expression e.g. return [EXPRESSION];
            if (fnExpr.body.type === ExpressionTypes.MemberExpression) {
                return this.parseMember(fnExpr.body, (err, result) => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, result);
                });
            }
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
        else if (expr.type === ExpressionTypes.BlockStatement) {
            this.parseBlock(expr, callback);
        }
        else {
            callback(new Error('The given expression is not yet implemented (' + expr.type + ').'));
        }
    }

    parseBlock(expr, callback) {
        const self = this;
        // get expression statement
        const bodyExpression = expr.body[0];
        let finalResult = [];
        if (bodyExpression.type === ExpressionTypes.ExpressionStatement) {
            if (bodyExpression.expression && bodyExpression.expression.type === 'SequenceExpression') {
                // enumerate and parse sequence expression
                const expressions = bodyExpression.expression.expressions;
                if (Array.isArray(expressions)) {
                    return async.eachSeries(expressions, (expression, cb) => {
                        return self.parseCommon(expression, (err, res) => {
                            if (err) {
                                return cb(err);
                            }
                            // add expression
                            finalResult.push(res);
                            return cb();
                        })
                    }, (err, result) => {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, finalResult);
                    });
                }
            }
        }
        else if (bodyExpression.type === ExpressionTypes.ReturnStatement) {
            // get return statement
            const objectExpression = bodyExpression.argument;
            if (objectExpression && objectExpression.type === ExpressionTypes.ObjectExpression) {
                return async.eachSeries(objectExpression.properties, (property, cb) => {
                    self.parseCommon(property.value, (err, value) => {
                        if (err) {
                            return cb(err);
                        }
                        // add expression
                        finalResult.push(value);
                        return cb();
                    });
                }, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, finalResult);
                });
            }
        }
        return callback(new Error('The given expression is not yet implemented (' + expr.type + ').'));
    }

    parseLogical(expr, callback) {
        const self = this;
        const op = (expr.operator === '||') ? Operators.Or : Operators.And;
        //validate operands
        if (expr.left == null || expr.right == null) {
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
     * @param {string} binaryOperator
     * @returns {*}
     */
    static binaryToExpressionOperator(binaryOperator) {
      switch (binaryOperator) {
          case '===':
          case '==':
              return Operators.Eq;
          case '!=':
          case '!==':
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
        const op = ClosureParser.binaryToExpressionOperator(expr.operator);
        if (op == null) {
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
                if (namedParam == null) {
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
                    if (expr.object.object == null) {
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
        if (expr.callee.object == null) {
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
            if (name == null) {
                if (expr.callee.object != null) {
                    if (expr.callee.object.object != null) {
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
    if (expr.object.object == null) {
        return expr.object.name + '.' + expr.property.name
    }
    else {
        return memberExpressionToString(expr.object) + '.' + expr.property.name;
    }
}

function parentMemberExpressionToString(expr) {
    if (expr.object.object == null) {
        return expr.object.name;
    }
    else {
        return memberExpressionToString(expr.object);
    }
}
