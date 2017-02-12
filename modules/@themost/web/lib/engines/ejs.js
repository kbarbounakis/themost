/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com
 *                     Anthi Oikonomou anthioikonomou@gmail.com
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mvc = require('./../mvc');

var HttpViewContext = _mvc.HttpViewContext;

var _errors = require('@themost/common/errors');

var HttpNotFoundError = _errors.HttpNotFoundError;

var _utils = require('@themost/common/utils');

var LangUtils = _utils.LangUtils;

var _lodash = require('lodash');

var _ = _lodash._;

var _ejs = require('ejs');

var ejs = _interopRequireDefault(_ejs).default;

var _path = require('path');

var path = _interopRequireDefault(_path).default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class
 * @param {HttpContext=} context
 * @constructor
 * @property {HttpContext} context Gets or sets an instance of HttpContext that represents the current HTTP context.
 */
var EjsEngine = function () {
    /**
     *
     * @param {HttpContext} context
     */
    function EjsEngine(context) {
        _classCallCheck(this, EjsEngine);

        /**
         * @type {HttpContext}
         */
        var ctx = context;
        Object.defineProperty(this, 'context', {
            get: function get() {
                return ctx;
            },
            set: function set(value) {
                ctx = value;
            },
            configurable: false,
            enumerable: false
        });
    }

    /**
     * Adds a EJS filter to filters collection.
     * @param {string} name
     * @param {Function} fn
     */


    _createClass(EjsEngine, [{
        key: 'filter',
        value: function filter(name, fn) {
            ejs.filters[name] = fn;
        }

        /**
         *
         * @param {string} filename
         * @param {*=} data
         * @param {Function} callback
         */

    }, {
        key: 'render',
        value: function render(filename, data, callback) {
            var self = this;
            try {
                (function () {
                    var fs = require('fs'),
                        common = require('@themost/common');
                    fs.readFile(filename, 'utf-8', function (err, str) {
                        try {
                            if (err) {
                                if (err.code === 'ENOENT') {
                                    //throw not found exception
                                    return callback(new HttpNotFoundError('View layout cannot be found.'));
                                }
                                return callback(err);
                            } else {
                                (function () {
                                    //get view header (if any)
                                    var matcher = /^(\s*)<%#(.*?)%>/;
                                    var properties = { layout: null };
                                    if (matcher.test(str)) {
                                        var matches = matcher.exec(str);
                                        properties = JSON.parse(matches[2]);
                                        //remove match
                                        str = str.replace(matcher, '');
                                    }
                                    //create view context
                                    var viewContext = new HttpViewContext(self.context);
                                    //extend view context with page properties
                                    _.assign(viewContext, properties || {});
                                    //set view context data
                                    viewContext.data = data;
                                    var partial = false;
                                    if (self.context && self.context.request.route) partial = LangUtils.parseBoolean(self.context.request.route['partial']);
                                    if (properties.layout && !partial) {
                                        var layout = void 0;
                                        if (/^\//.test(properties.layout)) {
                                            //relative to application folder e.g. /views/shared/master.html.ejs
                                            layout = self.context.application.mapPath(properties.layout);
                                        } else {
                                            //relative to view file path e.g. ./../master.html.html.ejs
                                            layout = path.resolve(filename, properties.layout);
                                        }
                                        //set current view buffer (after rendering)
                                        viewContext.body = ejs.render(str, viewContext);
                                        //render master layout
                                        fs.readFile(layout, 'utf-8', function (err, layoutData) {
                                            try {
                                                if (err) {
                                                    if (err.code === 'ENOENT') {
                                                        return callback(new HttpNotFoundError('Master view layout cannot be found'));
                                                    }
                                                    return callback(err);
                                                }
                                                var result = ejs.render(layoutData, viewContext);
                                                callback(null, result);
                                            } catch (e) {
                                                callback(e);
                                            }
                                        });
                                    } else {
                                        var result = ejs.render(str, viewContext);
                                        callback(null, result);
                                    }
                                })();
                            }
                        } catch (e) {
                            callback(e);
                        }
                    });
                })();
            } catch (e) {
                callback.call(self, e);
            }
        }
    }]);

    return EjsEngine;
}();

exports.default = EjsEngine;
module.exports = exports['default'];
//# sourceMappingURL=ejs.js.map