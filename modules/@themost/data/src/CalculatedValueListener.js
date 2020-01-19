import async from 'async';
import _ from 'lodash';
import { FunctionContext } from './FunctionContext';
/**
 * @class
 * @constructor
 * @classdesc Represents an event listener which calculates field values. This listener is being registered for all data models.
 <p>
 A data field may have a calculation attribute.
 An instance of <a href="FunctionContext.html">FunctionContext</a> class will calculate this value by evaluating the expression provided.
 <pre class="prettyprint"><code>
 {
        "name": "modifiedBy",
        "title": "Modified By",
        "description": "Modified by user.",
        "type": "User",
        "calculation":"javascript:return this.user();"
    }
 </code></pre>
 <p>In the previous example modifiedBy field has a calculation for setting the user which performs the update operation.</p>
<p><strong>Note:</strong>FunctionContext class may be extended in order to allow applications to perform value calculations.</p>
 <pre class="prettyprint"><code>
    FunctionContext.prototype.myColor = function() {
        var deferred = Q.defer(),
            self = this;
        process.nextTick(function() {
            return self.context.model("UserColor")
                .where("user/name").equal(self.context.user.name)
                .select("color")
                .value().then(function(value) {
                    deferred.resolve(value);
                }).catch(function(err) {
                    deferred.reject(err);
                });
        });
        return deferred.promise;
    }
 </code></pre>
 <pre class="prettyprint"><code>
 {
        "name": "color",
        "title": "Color",
        "type": "Text",
        "calculation":"javascript:return this.myColor();"
    }
 </code></pre>
 <p>In this example a custom method of FunctionContext class gets the user's favourite color.</p>
 <p>This calculation may also be performed by setting the following promise expression:</p>
 <pre class="prettyprint"><code>
 {
        "name": "color",
        "title": "Color",
        "type": "Text",
        "calculation":"javascript:return this.context.model('UserColor').where('user/name').equal(this.context.user.name).select('color').value();"
    }
 </code></pre>
 </p>
 */
class CalculatedValueListener {
    /**
     * Occurs before creating or updating a data object and calculates field values with the defined calculation expression.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeSave(event, callback) {
        //get function context
        const functionContext = new FunctionContext();
        _.assign(functionContext, event);
        functionContext.context = event.model.context;
        //find all attributes that have a default value
        const attrs = event.model.attributes.filter(x => { return (x.calculation !== undefined); });
        async.eachSeries(attrs, (attr, cb) => {
            const expr = attr.calculation;
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
                    if (typeof value1 !== 'undefined' && value1 !== null && typeof value1.then === 'function') {
                        //we have a promise, so we need to wait for answer
                        value1.then(result => {
                            //otherwise set result
                            event.target[attr.name] = result;
                            return cb();
                        }).catch(err => {
                            cb(err);
                        });
                    }
                    else {
                        event.target[attr.name] = value1;
                        return cb();
                    }
                }
                else if (typeof value !== 'undefined' && value !== null && typeof value.then === 'function') {
                    //we have a promise, so we need to wait for answer
                    value.then(result => {
                        //otherwise set result
                        event.target[attr.name] = result;
                        return cb();
                    }).catch(err => {
                        cb(err);
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
                        cb(err);
                    }
                    else {
                        event.target[attr.name] = result;
                        cb(null);
                    }
                });
            }
        }, err => {
            callback(err);
        });
    }
}
export {CalculatedValueListener};
