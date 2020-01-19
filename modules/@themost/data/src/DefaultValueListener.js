import async from 'async';
import _ from 'lodash';
import { FunctionContext } from './FunctionContext';
/**
 * @class
 * @constructor
 * @classdesc Represents an event listener for calculating default values.
 * DefaultValueListener is one of the default listeners which are being registered for all data models.
 <p>
 A data field may have a default value attribute.
 An instance of <a href="FunctionContext.html">FunctionContext</a> class will calculate this value by evaluating the expression provided.
 The default value listener will process all fields of an inserted data object which have a default value expression and does not have a defined value.
 <pre class="prettyprint"><code>
 {
        "name": "createdBy",
        "title": "Created By",
        "type": "User",
        "value":"javascript:return this.user();",
        "readonly":true
    }
 </code></pre>
 <p></p>
 <p><strong>Note:</strong> FunctionContext class may be extended in order to allow applications to perform value calculations.</p>
 </p>
 */
class DefaultValueListener {
    /**
     * Occurs before creating or updating a data object and calculates default values with the defined value expression.
     * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeSave(event, callback) {
        const state = typeof event.state === 'number' ? event.state : 0;
        if (state !== 1) {
            return callback();
        }
        else {
            const functionContext = new FunctionContext();
            _.assign(functionContext, event);
            //find all attributes that have a default value
            const attrs = event.model.attributes.filter(x => { return (typeof x.value !== 'undefined'); });
            async.eachSeries(attrs, (attr, cb) => {
                try {
                    const expr = attr.value;
                    //if attribute is already defined
                    if (typeof event.target[attr.name] !== 'undefined') {
                        //do nothing
                        cb(null);
                        return;
                    }
                    //validate expression
                    if (typeof expr !== 'string') {
                        event.target[attr.name] = expr;
                        return cb();
                    }
                    //check javascript: keyword for code evaluation
                    if (expr.indexOf('javascript:') === 0) {
                        //get expression
                        let fnstr = expr.substring('javascript:'.length);
                        //if expression starts with function add parenthesis (fo evaluation)
                        if (fnstr.indexOf('function') === 0) {
                            fnstr = '('.concat(fnstr, ')');
                        }
                        //if expression starts with return then normalize expression (surround with function() {} keyword)
                        else if (fnstr.indexOf('return') === 0) {
                            fnstr = '(function() { '.concat(fnstr, '})');
                        }
                        const value = eval(fnstr);
                        //if value is function
                        if (typeof value === 'function') {
                            //then call function against the target object
                            const value1 = value.call(functionContext);
                            if (typeof value1 !== 'undefined' && value1 != null && typeof value1.then === 'function') {
                                //we have a promise, so we need to wait for answer
                                value1.then(result => {
                                    //otherwise set result
                                    event.target[attr.name] = result;
                                    return cb();
                                }).catch(err => {
                                    return cb(err);
                                });
                            }
                            else {
                                event.target[attr.name] = value1;
                                return cb();
                            }
                        }
                        else if (typeof value !== 'undefined' && value != null && typeof value.then === 'function') {
                            //we have a promise, so we need to wait for answer
                            value.then(result => {
                                //otherwise set result
                                event.target[attr.name] = result;
                                return cb();
                            }).catch(err => {
                                return cb(err);
                            });
                        }
                        else {
                            //otherwise get value
                            event.target[attr.name] = value;
                            return cb();
                        }
                    }
                    else if (expr.indexOf('fn:') === 0) {
                        return cb(new Error('fn: syntax is deprecated.'));
                    }
                    else {
                        functionContext.eval(expr, (err, result) => {
                            if (err) {
                                return cb(err);
                            }
                            event.target[attr.name] = result;
                            return cb();
                        });
                    }
                }
                catch (err) {
                    return cb(err);
                }
            }, err => {
                callback(err);
            });
        }
    }
}
export {DefaultValueListener};
