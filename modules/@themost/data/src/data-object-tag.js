/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import {LangUtils} from '@themost/common';
import {DataConfigurationStrategy} from './data-configuration';
import {QueryField} from '@themost/query';
import _ from 'lodash';
import Q from 'q';
import {DataAssociationMapping} from './types';
import {DataObjectJunction} from "./data-object-junction";
import {DataQueryable} from './data-queryable';

/**
 * @classdesc Represents a collection of values associated with a data object e.g. a collection of tags of an article, a set of skills of a person etc.
 * <p>
 *     This association may be defined in a field of a data model as follows:
 * </p>
 * <pre class="prettyprint"><code>
 {
     "name": "Person", "title": "Persons", "inherits":"Party", "version": "1.1",
     "fields": [
        ...
        {
            "@id": "https://themost.io/skills",
            "name": "skills",
            "title": "Skills",
            "description": "A collection of skills of this person.",
            "many": true,
            "type": "Text"
        }
        ...
     ]
     }
 </code></pre>
 <p>
 where model [Person] has a one-to-many association with a collection of strings in order to define the skills of a person.
 </p>
 <p>
 An instance of DataObjectTag class overrides DataQueryable methods for filtering associated values:
 </p>
 <pre class="prettyprint"><code>
 var persons = context.model('Person');
 persons.where('email').equal('veronica.fletcher@example.com')
     .getTypedItem().then(function(person) {
            person.property('skills').all().then(function(result) {
                return done(null, result);
            });
        }).catch(function(err) {
            return done(err);
        });
 </code></pre>
 <p>
 Insert item(s):
 </p>
 <pre class="prettyprint"><code>
 var persons = context.model('Person');
 persons.where('email').equal('veronica.fletcher@example.com')
     .getTypedItem().then(function(person) {
                person.property('skills').insert([
                    "node.js",
                    "C#.NET",
                    "PHP"
                ]).then(function() {
                    return done();
                });
            }).catch(function(err) {
                return done(err);
            });
 </code></pre>
 <p>
 Remove item(s):
 </p>
 <pre class="prettyprint"><code>
 var persons = context.model('Person');
 persons.where('email').equal('veronica.fletcher@example.com')
 .getTypedItem().then(function(person) {
                person.property('skills').remove([
                    "C#.NET"
                ]).then(function() {
                    return done();
                });
            }).catch(function(err) {
                return done(err);
            });
 </code></pre>
 * @class
 * @constructor
 * @augments DataQueryable
 * @param {DataObject} obj An object which represents the parent data object
 * @param {String|*} association A string that represents the name of the field which holds association mapping or the association mapping itself.
 * @property {DataModel} baseModel - The model associated with this data object junction
 * @property {DataObject} parent - Gets or sets the parent data object associated with this instance of DataObjectTag class.
 * @property {DataAssociationMapping} mapping - Gets or sets the mapping definition of this data object association.
 */
class DataObjectTag {
    constructor(obj, association) {
        /**
         * @type {DataObject}
         * @private
         */
        let parent_ = obj;
        let model;
        const DataModel = require('./data-model').DataModel;

        /**
         * Gets or sets the parent data object
         * @type DataObject
         */
        Object.defineProperty(this, 'parent', { get: function () {
            return parent_;
        }, set: function (value) {
            parent_ = value;
        }, configurable: false, enumerable: false});
        const self = this;
        if (typeof association === 'string') {
            //infer mapping from field name
            //set relation mapping
            if (self.parent!=null) {
                model = self.parent.getModel();
                if (model!=null)
                    self.mapping = model.inferMapping(association);
            }
        }
        else if (typeof association === 'object' && association !=null) {
            //get the specified mapping
            if (association instanceof DataAssociationMapping)
                self.mapping = association;
            else
                self.mapping = _.assign(new DataAssociationMapping(), association);
        }
        //validate mapping
        let baseModel_;
        Object.defineProperty(this, 'baseModel', {
            get: function() {
                if (baseModel_)
                    return baseModel_;
                //get parent context
                const context = self.parent.context;
                /**
                 * @type {DataConfigurationStrategy}
                 */
                const strategy = context.getConfiguration().getStrategy(DataConfigurationStrategy);
                let definition = strategy.getModelDefinition(self.mapping.associationAdapter);
                if (_.isNil(definition)) {
                    const associationObjectField = self.mapping.associationObjectField || DataObjectTag.DEFAULT_OBJECT_FIELD;
                    const associationValueField = self.mapping.associationValueField || DataObjectTag.DEFAULT_VALUE_FIELD;
                    const parentModel = self.parent.getModel();
                    // get value type
                    const refersTo = context.model(self.mapping.parentModel).getAttribute(self.mapping.refersTo);
                    const refersToType = (refersTo && refersTo.type) || 'Text';
                    let objectFieldType = parentModel.getAttribute(self.mapping.parentField).type;
                    if (objectFieldType === 'Counter') { objectFieldType = 'Integer'; }
                    definition = {
                        "name": self.mapping.associationAdapter,
                        "hidden": true,
                        "source": self.mapping.associationAdapter,
                        "view": self.mapping.associationAdapter,
                        "version": "1.0",
                        "fields": [
                            {
                                "name": "id",
                                "type": "Counter",
                                "nullable": false,
                                "primary": true
                            },
                            {
                                "name": associationObjectField,
                                "type": objectFieldType,
                                "nullable": false,
                                "many": false,
                                "indexed": true
                            },
                            {
                                "name": associationValueField,
                                "type": refersToType,
                                "nullable": false,
                                "many": false,
                                "indexed": true
                            }
                        ],
                        "constraints": [
                            { "type":"unique", "fields": [ associationObjectField, associationValueField ] }
                        ],
                        "privileges": self.mapping.privileges || [
                            {
                                "mask": 15,
                                "type": "global"
                            },
                            {
                                "mask": 15,
                                "type": "global",
                                "account": "Administrators"
                            }
                        ]
                    };
                    strategy.setModelDefinition(definition);
                }
                baseModel_ = new DataModel(definition);
                baseModel_.context = self.parent.context;
                return baseModel_;
            },configurable:false, enumerable:false
        });

        /**
         * Gets an instance of DataModel class which represents the data adapter of this association
         * @returns {DataModel}
         */
        this.getBaseModel = function() {
            return this.baseModel;
        };

        // call super class constructor
        DataObjectTag.super_.call(this, self.getBaseModel());
        // add select
        this.select(this.getValueField()).asArray();

        // modify query (add join parent model)
        const left = {};

        const right = {};
        // get parent adapter
        const parentAdapter = self.parent.getModel().viewAdapter;
        // set left operand of native join expression
        left[ parentAdapter ] = [ this.mapping.parentField ];
        // set right operand of native join expression
        right[this.mapping.associationAdapter] = [ QueryField.select(this.getObjectField()).from(this.mapping.associationAdapter).$name ];
        const field1 = QueryField.select(this.getObjectField()).from(this.mapping.associationAdapter).$name;
        // apply join expression
        this.query.join(parentAdapter, []).with([left, right]).where(field1).equal(obj[this.mapping.parentField]).prepare(false);
    }

    /**
     * @returns {string=}
     */
    getObjectField() {
        return DataObjectJunction.prototype.getObjectField.bind(this)();
    }

    /**
     * @returns {string=}
     */
    getValueField() {
        return DataObjectJunction.prototype.getValueField.bind(this)();
    }

    /**
     * Migrates the underlying data association adapter.
     * @param callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     */
    migrate(callback) {
        this.getBaseModel().migrate(callback);
    }

    /**
     * Overrides DataQueryable.count() method
     * @param callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @ignore
     */
    count(callback) {
        const self = this;
        if (typeof callback === 'undefined') {
            return Q.Promise((resolve, reject) => {
                return self.migrate(err => {
                    if (err) {
                        return reject(err);
                    }
                    // noinspection JSPotentiallyInvalidConstructorUsage
                    const superCount = DataObjectTag.super_.prototype.count.bind(self);
                    return superCount().then(result => {
                        return resolve(result);
                    }).catch(err => {
                        return reject(err);
                    });
                });
            });
        }
        return self.migrate(err => {
            if (err) {
                return callback(err);
            }
            // noinspection JSPotentiallyInvalidConstructorUsage
            const superCount = DataObjectTag.super_.prototype.count.bind(self);
            return superCount(callback);
        });
    }

    /**
     * Overrides DataQueryable.execute() method
     * @param callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @ignore
     */
    execute(callback) {
        const self = this;
        self.migrate(err => {
            if (err) { return callback(err); }
            // noinspection JSPotentiallyInvalidConstructorUsage
            DataObjectTag.super_.prototype.execute.bind(self)(callback);
        });
    }

    /**
     * Inserts an array of values
     * @param {*} item
     * @param {Function=} callback
     * @example
     context.model('Person').where('email').equal('veronica.fletcher@example.com')
     .getTypedItem().then(function(person) {
            person.property('skills').insert([
                "node.js",
                "C#.NET"
            ]).then(function() {
                return done();
            });
        }).catch(function(err) {
            return done(err);
        });
     *
     */
    insert(item, callback) {
        const self = this;
        if (typeof callback === 'undefined') {
            return Q.Promise((resolve, reject) => {
                return insert_.bind(self)(item, err => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            });
        }
        return insert_.call(self, item, callback);
    }

    /**
     * Removes all values
     * @param {Function=} callback
     * @returns Promise<T>|*
     * @example
     context.model('Person').where('email').equal('veronica.fletcher@example.com')
     .getTypedItem().then(function(person) {
            person.property('skills').removeAll().then(function() {
                return done();
            });
        }).catch(function(err) {
            return done(err);
        });
     *
     */
    removeAll(callback) {
        const self = this;
        if (typeof callback !== 'function') {
            return Q.Promise((resolve, reject) => {
                return clear_.bind(self)(err => {
                    if (err) { return reject(err); }
                    return resolve();
                });
            });
        }
        else {
            return clear_.call(self, callback);
        }
    }

    /**
     * Removes a value or an array of values
     * @param {Array|*} item
     * @param {Function=} callback
     * @returns Promise<T>|*
     * @example
     context.model('Person').where('email').equal('veronica.fletcher@example.com')
     .getTypedItem().then(function(person) {
            person.property('skills').remove([
                "node.js"
            ]).then(function() {
                return done();
            });
        }).catch(function(err) {
            return done(err);
        });
     *
     */
    remove(item, callback) {
        const self = this;
        if (typeof callback !== 'function') {
            return Q.Promise((resolve, reject) => {
                return remove_.bind(self)(item, err => {
                    if (err) { return reject(err); }
                    return resolve();
                });
            });
        }
        return remove_.call(self, item, callback);
    }
}

LangUtils.inherits(DataObjectTag, DataQueryable);

DataObjectTag.DEFAULT_OBJECT_FIELD = "object";
DataObjectTag.DEFAULT_VALUE_FIELD = "value";

/**
 * @this DataObjectTag
 * @param obj
 * @param callback
 * @private
 */
function insert_(obj, callback) {
    const self = this;
    let values = [];
    if (_.isArray(obj)) {
        values = obj;
    }
    else {
        values.push(obj);
    }
    self.migrate(err => {
        if (err)
            return callback(err);
        // get object field name
        const objectField = self.getObjectField();
        // get value field name
        const valueField = self.getValueField();
        // map the given items
        const items = _.map(_.filter(values, x => {
            return !_.isNil(x);
        }), x => {
            const res = {};
            res[objectField] = self.parent[self.mapping.parentField];
            res[valueField] = x;
            return res;
        });
        // and finally save items
        return self.getBaseModel().silent(self.$silent).save(items).then(() => {
            return callback();
        }).catch(err => {
            return callback(err);
        });
    });
}

/**
 * @this DataObjectTag
 * @param callback
 * @private
 */
function clear_(callback) {
    const self = this;
    self.migrate(err => {
        if (err) {
            return callback(err);
        }
        self.getBaseModel().silent(self.$silent).where(self.getObjectField()).equal(self.parent[self.mapping.parentField]).select("id").getAllItems().then(result => {
            if (result.length===0) { return callback(); }
            return self.getBaseModel().remove(result).then(() => {
               return callback();
            });
        }).catch(err => {
           return callback(err);
        });
    });
}

/**
 * @this DataObjectTag
 * @param {*} obj
 * @param {Function} callback
 * @private
 */
function remove_(obj, callback) {
    const self = this;
    let values = [];
    if (_.isArray(obj))
        values = obj;
    else {
        values.push(obj);
    }
    self.migrate(err => {
        if (err) {
            return callback(err);
        }
        // get object field name
        const objectField = self.getObjectField();
        // get value field name
        const valueField = self.getValueField();
        const items = _.map(_.filter(values, x => {
            return !_.isNil(x);
        }), x => {
            const res = {};
            res[objectField] = self.parent[self.mapping.parentField];
            res[valueField] = x;
            return res;
        });
        return self.getBaseModel().silent(self.$silent).remove(items, callback);
    });
}
export {DataObjectTag};