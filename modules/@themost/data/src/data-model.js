/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import _ from 'lodash';
import {sprintf} from 'sprintf';
import path from 'path';
import pluralize from 'pluralize';
import async from 'async';
import {QueryUtils} from '@themost/query';
import {OpenDataParser} from '@themost/query';
import {parsers, DataModelMigration, DataAssociationMapping} from './types';
import {CalculatedValueListener, 
    DefaultValueListener,
    DataCachingListener,
    DataModelCreateViewListener,
    DataModelSeedListener,
    NotNullConstraintListener,
    UniqueConstraintListener} from './data-listeners';
import {
    DataValidatorListener,
    RequiredValidator,
    MaxLengthValidator,
    DataTypeValidator
} from './data-validator';
import {DataObjectAssociationListener} from './data-associations';
import {DataNestedObjectListener} from './data-nested-object-listener';
import {DataReferencedObjectListener} from './data-ref-object-listener';
import {DataQueryable} from './data-queryable';
import {DataAttributeResolver} from './data-queryable';
import {DataModelView} from './data-model-view';
import {DataFilterResolver} from './data-filter-resolver';
import Q from 'q';
import {SequentialEventEmitter} from '@themost/common';
import {LangUtils} from '@themost/common';
import {TraceUtils} from '@themost/common';
import {DataError} from '@themost/common';
import {DataConfigurationStrategy} from './data-configuration';
import {ModelClassLoaderStrategy} from './data-configuration';
import {ModuleLoaderStrategy as ModuleLoader} from '@themost/common';
const mappingsProperty = Symbol('mappings');
import {DataPermissionEventListener} from './data-permission';
import {DataField} from './types';


/**
 * @this DataModel
 * @param {DataField} field
 * @private
 */
function inferTagMapping_(field) {
    /**
     * @type {DataModel|*}
     */
    const self = this;
    //validate field argument
    if (_.isNil(field)) {
        return;
    }
    //validate DataField.many attribute
    if (!(field.hasOwnProperty('many') && field.many === true)) {
        return;
    }
    //check if the type of the given field is a primitive data type
    //(a data type that is defined in the collection of data types)
    const dataType = self.context.getConfiguration().getStrategy(DataConfigurationStrategy).dataTypes[field.type];
    if (_.isNil(dataType)) {
        return;
    }
    //get associated model name
    const name = self.name.concat(_.upperFirst(field.name));
    const primaryKey = self.key();
    return new DataAssociationMapping({
        'associationType': 'junction',
        'associationAdapter': name,
        'cascade': 'delete',
        'parentModel': self.name,
        'parentField': primaryKey.name,
        'refersTo': field.name,
        'privileges': field.mapping && field.mapping.privileges
    });
}

/**
 * @this DataModel
 * @returns {*}
 */
function getImplementedModel() {
    if (_.isNil(this['implements'])) {
        return null;
    }
    if (typeof this.context === 'undefined' || this.context === null)
        throw new Error('The underlying data context cannot be empty.');
    return this.context.model(this['implements']);
}

/**
 * @ignore
 * @class
 * @constructor
 * @augments QueryExpression
 */
function EmptyQueryExpression() {
    //
}

/**
 * @classdesc DataModel class extends a JSON data model and performs all data operations (select, insert, update and delete) in MOST Data Applications.
 <p>
     These JSON schemas are in config/models folder:
 </p>
 <pre class="prettyprint"><code>
 /
 + config
   + models
     - User.json
     - Group.json
     - Account.json
     ...
 </code></pre>
 <p class="pln">
 The following JSON schema presents a typical User model with fields, views, privileges, constraints, listeners, and seeding:
 </p>
 <pre class="prettyprint"><code>
 {
     "name": "User", "id": 90, "title": "Application Users", "inherits": "Account", "hidden": false, "sealed": false, "abstract": false, "version": "1.4",
     "fields": [
         {
             "name": "id", "title": "Id", "description": "The identifier of the item.",
             "type": "Integer",
             "nullable": false,
             "primary": true
         },
         {
             "name": "accountType",  "title": "Account Type", "description": "Contains a set of flags that define the type and scope of an account object.",
             "type": "Integer",
             "readonly":true,
             "value":"javascript:return 0;"
         },
         {
             "name": "lockoutTime", "title": "Lockout Time", "description": "The date and time that this account was locked out.",
             "type": "DateTime",
             "readonly": true
         },
         {
             "name": "logonCount", "title": "Logon Count", "description": "The number of times the account has successfully logged on.",
             "type": "Integer",
             "value": "javascript:return 0;",
             "readonly": true
         },
         {
             "name": "enabled", "title": "Enabled", "description": "Indicates whether a user is enabled or not.",
             "type": "Boolean",
             "nullable": false,
             "value": "javascript:return true;"
         },
         {
             "name": "lastLogon", "title": "Last Logon", "description": "The last time and date the user logged on.",
             "type": "DateTime",
             "readonly": true
         },
         {
             "name": "groups", "title": "User Groups", "description": "A collection of groups where user belongs.",
             "type": "Group",
             "expandable": true,
             "mapping": {
                 "associationAdapter": "GroupMembers", "parentModel": "Group",
                 "parentField": "id", "childModel": "User", "childField": "id",
                 "associationType": "junction", "cascade": "delete",
                 "select": [
                     "id",
                     "name",
                     "alternateName"
                 ]
             }
         },
         {
             "name": "additionalType",
             "value":"javascript:return this.model.name;",
             "readonly":true
         },
         {
             "name": "accountType",
             "value": "javascript:return 0;"
         }
     ], "privileges":[
         { "mask":1, "type":"self", "filter":"id eq me()" },
         { "mask":15, "type":"global", "account":"*" }
     ],
     "constraints":[
         {
             "description": "User name must be unique across different records.",
             "type":"unique",
             "fields": [ "name" ]
         }
     ],
     "views": [
         {
             "name":"list", "title":"Users", "fields":[
                 { "name":"id", "hidden":true },
                 { "name":"description" },
                 { "name":"name" },
                 { "name":"enabled" , "format":"yesno" },
                 { "name":"dateCreated", "format":"moment : 'LLL'" },
                 { "name":"dateModified", "format":"moment : 'LLL'" }
             ], "order":"dateModified desc"
         }
     ],
     "eventListeners": [
         { "name":"New User Credentials Provider", "type":"/app/controllers/user-credentials-listener" }
     ],
     "seed":[
         {
             "name":"anonymous",
             "description":"Anonymous User",
             "groups":[
                 { "name":"Guests" }
             ]
         },
         {
             "name":"admin@example.com",
             "description":"Site Administrator",
             "groups":[
                 { "name":"Administrators" }
             ]
         }
     ]
 }
 </code></pre>
 *
 * @class
 * @property {string} classPath - Gets or sets a string which represents the path of the DataObject subclass associated with this model.
 * @property {string} name - Gets or sets a string that represents the name of the model.
 * @property {number} id - Gets or sets an integer that represents the internal identifier of the model.
 * @property {boolean} hidden - Gets or sets a boolean that indicates whether the current model is hidden or not. The default value is false.
 * @property {string} title - Gets or sets a title for this data model.
 * @property {boolean} sealed - Gets or sets a boolean that indicates whether current model is sealed or not. A sealed model cannot be migrated.
 * @property {boolean} abstract - Gets or sets a boolean that indicates whether current model is an abstract model or not.
 * @property {string} version - Gets or sets the version of this data model.
 * @property {string} type - Gets or sets an internal type for this model.
 * @property {DataCachingType|string} caching - Gets or sets a string that indicates the caching type for this model. The default value is none.
 * @property {string} inherits - Gets or sets a string that contains the model that is inherited by the current model.
 * @property {string} implements - Gets or sets a string that contains the model that is implemented by the current model.
 * @property {DataField[]} fields - Gets or sets an array that represents the collection of model fields.
 * @property {DataModelEventListener[]} eventListeners - Gets or sets an array that represents the collection of model listeners.
 * @property {Array} constraints - Gets or sets the array of constraints which are defined for this model
 * @property {DataModelView[]} views - Gets or sets the array of views which are defined for this model
 * @property {DataModelPrivilege[]} privileges - Gets or sets the array of privileges which are defined for this model
 * @property {string} source - Gets or sets a string which represents the source database object for this model.
 * @property {string} view - Gets or sets a string which represents the view database object for this model.
  * @property {Array} seed - An array of objects which represents a collection of items to be seeded when the model is being generated for the first time
 * @constructor
 * @augments SequentialEventEmitter
 * @param {*=} obj An object instance that holds data model attributes. This parameter is optional.
 */
class DataModel {
    constructor(obj) {

        this.hidden = false;
        this.sealed = false;
        this.abstract = false;
        this.version = '0.1';
        //this.type = 'data';
        this.caching = 'none';
        this.fields = [];
        this.eventListeners = [];
        this.constraints = [];
        this.views = [];
        this.privileges = [];
        //extend model if obj parameter is defined
        if (obj)
        {
            if (typeof obj === 'object')
                _.assign(this, obj);
        }

        /**
         * Gets or sets the underlying data adapter
         * @type {DataContext}
         * @private
         */
        let context_ = null;
        const self = this;

        /**
         * @name DataModel#context
         * @type {DataContext|*}
         */

        Object.defineProperty(this, 'context', { get: function() {
            return context_;
        }, set: function(value) {
            context_ = value;
            if (_.isNil(context_)) {
                unregisterContextListeners.bind(this)();
            }
            else {
                registerContextListeners.bind(this)();
            }
        }, enumerable: false, configurable: false});

        /**
         * @description Gets the database object associated with this data model
         * @name DataModel#sourceAdapter
         * @type {string}
         */

        Object.defineProperty(this, 'sourceAdapter', { get: function() {
            return _.isString(self.source) ? self.source :  self.name.concat('Base');
        }, enumerable: false, configurable: false});

        /**
         * @description Gets the database object associated with this data model view
         * @name DataModel#viewAdapter
         * @type {string}
         */

        Object.defineProperty(this, 'viewAdapter', { get: function() {
            return _.isString(self.view) ? self.view :  self.name.concat('Data');
        }, enumerable: false, configurable: false});

        let silent_ = false;
        /**
         * Prepares a silent data operation (for query, update, insert, delete etc).
         * In a silent execution, permission check will be omitted.
         * Any other listeners which are prepared for using silent execution will use this parameter.
         * @param {Boolean=} value
         * @returns DataModel
         */
        this.silent = function(value) {
            if (typeof value === 'undefined')
                silent_ = true;
            else
                silent_ = !!value;
            return this;
        };

        Object.defineProperty(this, '$silent', { get: function() {
            return silent_;
        }, enumerable: false, configurable: false});

        /**
         * @type {Array}
         */
        let attributes;

        /**
         * @description Gets an array of DataField objects which represents the collection of model fields (including fields which are inherited from the base model).
         * @name DataModel#attributes
         * @type {Array.<DataField>}
         */

        Object.defineProperty(this, 'attributes', { get: function() {
            //validate self field collection
            if (typeof attributes !== 'undefined' && attributes !== null)
                return attributes;
            //init attributes collection
            attributes = [];

            //get base model (if any)
            const baseModel = self.base();

            let field;
            const implementedModel = getImplementedModel.bind(self)();
            //enumerate fields
            const strategy = self.context.getConfiguration().getStrategy(DataConfigurationStrategy);
            self.fields.forEach(x => {
                if (typeof x.many === 'undefined') {
                    if (typeof strategy.dataTypes[x.type] === 'undefined')
                        //set one-to-many attribute (based on a naming convention)
                        x.many = pluralize.isPlural(x.name) || (x.mapping && x.mapping.associationType === 'junction');
                    else
                        //otherwise set one-to-many attribute to false
                        x.many = false;
                }
                // define virtual attribute
                if (x.many) {
                    // set multiplicity property EdmMultiplicity.Many
                    x.multiplicity = 'Many';
                }
                if (x.nested) {
                    // try to find if current field defines one-to-one association
                    const mapping = x.mapping;
                    if (mapping &&
                        mapping.associationType === 'association' &&
                        mapping.parentModel === self.name) {
                        /**
                         * get child model
                         * @type {DataModel}
                         */
                        const childModel = (mapping.childModel === self.name) ? self : self.context.model(mapping.childModel);
                        // check child model constraints for one-to-one parent to child association
                        if (childModel &&
                            childModel.constraints &&
                            childModel.constraints.length &&
                            childModel.find(constraint => {
                                return constraint.fields && constraint.fields.length === 1 && constraint.fields.indeOf(x.name) === 0;
                            })) {
                            // backward compatibility  issue
                            // set [many] attribute to true because is being used by query processing
                            x.many = true;
                            // set multiplicity property EdmMultiplicity.ZeroOrOne or EdmMultiplicity.One
                            if (typeof x.nullable === 'boolean') {
                                x.multiplicity = x.nullable ? 'ZeroOrOne' : 'One';
                            }
                            else {
                                x.multiplicity = 'ZeroOrOne';
                            }

                        }
                    }
                }

                //re-define field model attribute
                if (typeof x.model === 'undefined')
                    x.model = self.name;
                let clone = x;
                //if base model exists and current field is not primary key field
                if (baseModel && !x.primary) {
                    //get base field
                    field = baseModel.field(x.name);
                    if (field) {
                        //clone field
                        clone = { };
                        //get all inherited properties
                        _.assign(clone, field);
                        //get all overridden properties
                        _.assign(clone, x);
                        //set field model
                        clone.model = field.model;
                        //set cloned attribute
                        clone.cloned = true;
                    }
                }
                //finally push field
                attributes.push(clone);
            });
            if (baseModel) {
                baseModel.attributes.forEach(x => {
                    if (!x.primary) {
                        //check if member is overridden by the current model
                        field = self.fields.find(y => { return y.name === x.name; });
                        if (typeof field === 'undefined')
                            attributes.push(x);
                    }
                    else {
                        //try to find primary key in fields collection
                        let primaryKey = _.find(self.fields, y => {
                            return y.name === x.name;
                        });
                        if (typeof primaryKey === 'undefined') {
                            //add primary key field
                            primaryKey = _.assign({}, x, {
                                'type': x.type === 'Counter' ? 'Integer' : x.type,
                                'model': self.name,
                                'indexed': true,
                                'value': null,
                                'calculation': null
                            });
                            delete primaryKey.value;
                            delete primaryKey.calculation;
                            attributes.push(primaryKey);
                        }
                    }
                });
            }
            if (implementedModel) {
                implementedModel.attributes.forEach(x => {
                    field = _.find(self.fields, y => {
                        return y.name === x.name;
                    });
                    if (_.isNil(field)) {
                        attributes.push(_.assign({}, x, {
                            model:self.name
                        }));
                    }
                });
            }

            return attributes;
        }, enumerable: false, configurable: false});
        /**
         * Gets the primary key name
         * @type String
        */
        this.primaryKey = undefined;
        //local variable for DateModel.primaryKey
        let primaryKey_;
        Object.defineProperty(this, 'primaryKey' , { get: function() {
            return self.getPrimaryKey();
        }, enumerable: false, configurable: false});

        this.getPrimaryKey = () => {
            if (typeof primaryKey_ !== 'undefined') { return primaryKey_; }
            const p = self.attributes.find(x => { return x.primary===true; });
            if (p) {
                primaryKey_ = p.name;
                return primaryKey_;
            }
        };

        /**
         * Gets an array that contains model attribute names
         * @type Array
        */
        this.attributeNames = undefined;
        Object.defineProperty(this, 'attributeNames' , { get: function() {
            return self.attributes.map(x => {
                return x.name;
            });
        }, enumerable: false, configurable: false});
        Object.defineProperty(this, 'constraintCollection' , { get: function() {
            const arr = [];
            if (_.isArray(self.constraints)) {
                //append constraints to collection
                self.constraints.forEach(x => {
                    arr.push(x);
                });
            }
            //get base model
            const baseModel = self.base();
            if (baseModel) {
                //get base model constraints
                const baseArr = baseModel.constraintCollection;
                if (_.isArray(baseArr)) {
                    //append to collection
                    baseArr.forEach(x => {
                        arr.push(x);
                    });
                }
            }
            return arr;
        }, enumerable: false, configurable: false});

        //call initialize method
        if (typeof this.initialize === 'function')
            this.initialize();
    }

    /**
     * Gets a boolean which indicates whether data model is in silent mode or not
     */
    isSilent() {
        return this.$silent;
    }

    /**
     * @returns {Function}
     */
    getDataObjectType() {
        return this.context.getConfiguration().getStrategy(ModelClassLoaderStrategy).resolve(this);
    }

    /**
     * Initializes the current data model. This method is used for extending the behaviour of an install of DataModel class.
     */
    initialize() {
        //
    }

    /**
     * Clones the current data model
     * @param {DataContext=} context - An instance of DataContext class which represents the current data context.
     * @returns {DataModel} Returns a new DataModel instance
     */
    clone(context) {
        const result = new DataModel(this);
        if (context)
            result.context = context;
        return result;
    }

    join(model) {
        const result = new DataQueryable(this);
        return result.join(model);
    }

    /**
     * Initializes a where statement and returns an instance of DataQueryable class.
     * @param {String|*} attr - A string that represents the name of a field
     * @returns DataQueryable
    */
    where(attr) {
        const result = new DataQueryable(this);
        return result.where(attr);
    }

    /**
     * Initializes a full-text search statement and returns an instance of DataQueryable class.
     * @param {String} text - A string that represents the text to search for
     * @returns DataQueryable
     */
    search(text) {
        const result = new DataQueryable(this);
        return result.search(text);
    }

    /**
     * Returns a DataQueryable instance of the current model
     * @returns {DataQueryable}
     */
    asQueryable() {
        return new DataQueryable(this);
    }

    /**
     * Applies open data filter, ordering, grouping and paging params and returns a data queryable object
     * @param {String|{$filter:string=, $skip:number=, $levels:number=, $top:number=, $take:number=, $order:string=, $inlinecount:string=, $expand:string=,$select:string=, $orderby:string=, $group:string=, $groupby:string=}} params - A string that represents an open data filter or an object with open data parameters
     * @param {Function=} callback -  A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain an instance of DataQueryable class.
     * @returns Promise<DataQueryable>|*
     * @example
     context.model('Order').filter(context.params, function(err,q) {
        if (err) { return callback(err); }
        q.take(10, function(err, result) {
            if (err) { return callback(err); }
            callback(null, result);
        });
     });
     */
    filter(params, callback) {
        if (typeof callback === 'function') {
            return filterInternal.bind(this)(params, callback);
        }
        else {
            return Q.nbind(filterInternal, this)(params);
        }
    }

    /**
     * Prepares a data query with the given object as parameters and returns the equivalent DataQueryable instance
     * @param {*} obj - An object which represents the query parameters
     * @returns DataQueryable - An instance of DataQueryable class that represents a data query based on the given parameters.
     * @example
     context.model('Order').find({ "paymentMethod":1 }).orderBy('dateCreated').take(10, function(err,result) {
        if (err) { return callback(err); }
        return callback(null, result);
     });
     */
    find(obj) {
        const self = this;
        let result;
        if (_.isNil(obj))
        {
            result = new DataQueryable(this);
            result.where(self.primaryKey).equal(null);
            return result;
        }
        const find = { };
        let findSet = false;
        if (_.isObject(obj)) {
            if (obj.hasOwnProperty(self.primaryKey)) {
                find[self.primaryKey] = obj[self.primaryKey];
                findSet = true;
            }
            else {
                //get unique constraint
                const constraint = _.find(self.constraints, x => {
                    return x.type === 'unique';
                });
                //find by constraint
                if (_.isObject(constraint) && _.isArray(constraint.fields)) {
                    //search for all constrained fields
                    const findAttrs = {};

                    let constrained = true;
                    _.forEach(constraint.fields, x => {
                       if (obj.hasOwnProperty(x)) {
                           findAttrs[x] = obj[x];
                       }
                       else {
                           constrained = false;
                       }
                    });
                    if (constrained) {
                        _.assign(find, findAttrs);
                        findSet = true;
                    }
                }
            }
        }
        else {
            find[self.primaryKey] = obj;
            findSet = true;
        }
        if (!findSet) {
            _.forEach(self.attributeNames, x => {
                if (obj.hasOwnProperty(x)) {
                    find[x] = obj[x];
                }
            });
        }
        result = new DataQueryable(this);
        findSet = false;
        //enumerate properties and build query
        for(const key in find) {
            if (find.hasOwnProperty(key)) {
                if (!findSet) {
                    result.where(key).equal(find[key]);
                    findSet = true;
                }
                else
                    result.and(key).equal(find[key]);
            }
        }
        if (!findSet) {
            //there is no query defined a dummy one (e.g. primary key is null)
            result.where(self.primaryKey).equal(null);
        }
        return result;
    }

    /**
     * Selects the given attribute or attributes and return an instance of DataQueryable class
     * @param {...string} attr - An array of fields, a field or a view name
     * @returns {DataQueryable}
     */
    // eslint-disable-next-line no-unused-vars
    select(attr) {
        const result = new DataQueryable(this);
        return result.select.apply(result, Array.prototype.slice.call(arguments));
    }

    /**
     * Prepares an ascending order by expression and returns an instance of DataQueryable class.
     * @param {string|*} attr - A string that is going to be used in this expression.
     * @returns DataQueryable
     * @example
     context.model('Person').orderBy('givenName').list().then(function(result) {
        done(null, result);
     }).catch(function(err) {
        done(err);
     });
    */
    orderBy(attr) {
        const result = new DataQueryable(this);
        return result.orderBy(attr);
    }

    /**
     * Takes an array of maximum [n] items.
     * @param {Number} n - The maximum number of items that is going to be retrieved
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @returns DataQueryable|undefined If callback parameter is missing then returns a DataQueryable object.
     */
    take(n, callback) {
        n = n || 25;
        const result = new DataQueryable(this);
        if (typeof callback === 'undefined')
            return result.take(n);
        result.take(n, callback);
    }

    /**
     * Returns an instance of DataResultSet of the current model.
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @returns {Promise<T>|*} If callback parameter is missing then returns a Promise object.
     * @deprecated Use DataModel.asQueryable().list().
     * @example
     context.model('User').list(function(err, result) {
        if (err) { return done(err); }
        return done(null, result);
     });
     */
    list(callback) {
        const result = new DataQueryable(this);
        return result.list(callback);
    }

    /**
     * @returns {Promise|*}
     */
    getList() {
        const result = new DataQueryable(this);
        return result.list();
    }

    /**
     * Returns the first item of the current model.
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @returns {Promise<T>|*} If callback parameter is missing then returns a Promise object.
     * @deprecated Use DataModel.asQueryable().first().
     * @example
     context.model('User').first(function(err, result) {
        if (err) { return done(err); }
        return done(null, result);
     });
    */
    first(callback) {
        const result = new DataQueryable(this);
        return result.select.apply(result,this.attributeNames).first(callback);
    }

    /**
     * A helper function for getting an object based on the given primary key value
     * @param {String|*} key - The primary key value to search for.
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result, if any.
     * @returns {Deferred|*} If callback parameter is missing then returns a Deferred object.
     * @example
     context.model('User').get(1).then(function(result) {
        return done(null, result);
    }).catch(function(err) {
        return done(err);
    });
     */
    get(key, callback) {
        const result = new DataQueryable(this);
        return result.where(this.primaryKey).equal(key).first(callback);
    }

    /**
     * Returns the last item of the current model based.
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @returns {Promise<T>|*} If callback parameter is missing then returns a Promise object.
     * @example
     context.model('User').last(function(err, result) {
        if (err) { return done(err); }
        return done(null, result);
     });
     */
    last(callback) {
        const result = new DataQueryable(this);
        return result.orderByDescending(this.primaryKey).select.apply(result,this.attributeNames).first(callback);
    }

    /**
     * Returns all data items.
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result, if any.
    */
    all(callback) {
        const result = new DataQueryable(this);
        return result.select.apply(result, this.attributeNames).all(callback);
    }

    /**
     * Bypasses a number of items based on the given parameter. This method is used in data paging operations.
     * @param {Number} n - The number of items to skip.
     * @returns DataQueryable
    */
    skip(n) {
        const result = new DataQueryable(this);
        return result.skip(n);
    }

    /**
     * Prepares an descending order by expression and returns an instance of DataQueryable class.
     * @param {string|*} attr - A string that is going to be used in this expression.
     * @returns DataQueryable
     * @example
     context.model('Person').orderByDescending('givenName').list().then(function(result) {
        done(null, result);
     }).catch(function(err) {
        done(err);
     });
     */
    orderByDescending(attr) {
        const result = new DataQueryable(this);
        return result.orderBy(attr);
    }

    /**
     * Returns the maximum value for a field.
     * @param {string} attr - A string that represents the name of the field.
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @returns {Promise<T>|*} If callback parameter is missing then returns a Promise object.
     */
    max(attr, callback) {
        const result = new DataQueryable(this);
        return result.max(attr, callback);
    }

    /**
     * Returns the minimum value for a field.
     * @param {string} attr - A string that represents the name of the field.
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @returns {Promise<T>|*} If callback parameter is missing then returns a Promise object.
     */
    min(attr, callback) {
        const result = new DataQueryable(this);
        return result.min(attr, callback);
    }

    /**
     * Gets a DataModel instance which represents the inherited data model of this item, if any.
     * @returns {DataModel}
     */
    base() {
        if (_.isNil(this.inherits))
            return null;
        if (typeof this.context === 'undefined' || this.context === null)
            throw new Error('The underlying data context cannot be empty.');
        return this.context.model(this.inherits);
    }

    /**
     * Converts an object or a collection of objects to the corresponding data object instance
     * @param {Array|*} obj
     * @param {boolean=} typeConvert - Forces property value conversion for each property based on field type.
     * @returns {DataObject|Array|*} - Returns an instance of DataObject (or an array of DataObject instances)
     *<p>
     This conversion of an anonymous object through DataModel.convert() may be overriden by subclassing DataObject
     and place this class in app/models folder of a MOST Data Appllication:
     </p>
     <pre class="prettyprint"><code>
     /
     + app
       + models
         + user-model.js
     </code></pre>
     <p>
     An example of user model subclassing (user-model.js):
     </p>
     <pre class="prettyprint"><code>
     var util = require('util'),
     md = require('most-data'),
     web = require('most-web');

     function UserModel(obj) {
        UserModel.super_.call(this, 'User', obj);
    }
     util.inherits(UserModel, md.classes.DataObject);

     UserModel.prototype.person = function (callback) {
        var self = this, context = self.context;
        try {
            //search person by user name
            return context.model('Person').where('user/name').equal(self.name).first(callback);
        }
        catch (err) {
            callback(err);
        }
    };
     if (typeof module !== 'undefined') module.exports = UserModel;
     </code></pre>
     @example
     //get User model
     var users = context.model('User');
     users.where('name').equal(context.user.name).first().then(function(result) {
        if (typeof result === 'undefined') {
            return done(new Error('User cannot be found'));
        }
        //convert result
        var user = users.convert(result);
        //get user's person
        user.person(function(err, result) {
            if (err) { return done(err); }
            if (typeof result === 'undefined') {
                return done(new Error('Person cannot be found'));
            }
            console.log('Person: ' + JSON.stringify(result));
            done(null, result);
        });
    }).catch(function(err) {
       done(err);
    });
     */
    convert(obj, typeConvert) {
        const self = this;
        if (_.isNil(obj))
            return obj;
        /**
         * @constructor
         * @augments DataObject
         * @ignore
         */
        const DataObjectTypeCtor = self.getDataObjectType();

        if (_.isArray(obj)) {
            const arr = [];
            let src;
            obj.forEach(x => {
                if (typeof x !== 'undefined' && x!=null) {
                    const o = new DataObjectTypeCtor();
                    if (typeof x === 'object') {
                        _.assign(o, x);
                    }
                    else {
                        src = {}; src[self.primaryKey] = x;
                        _.assign(o, src);
                    }
                    if (typeConvert)
                        convertInternal_.call(self, o);
                    o.context = self.context;
                    o.$$type = self.name;
                    arr.push(o);
                }
            });
            return arr;
        }
        else {
            const result = new DataObjectTypeCtor();
            if (typeof obj === 'object') {
                _.assign(result, obj);
            }
            else {
                src = {}; src[self.primaryKey] = obj;
                _.assign(result, src);
            }
            if (typeConvert)
                convertInternal_.call(self, result);
            result.context = self.context;
            result.$$type = self.name;
            return result;
        }
    }

    /**
     * Extracts an identifier from the given parameter.
     * If the parameter is an object then gets the identifier property, otherwise tries to convert the given parameter to an identifier
     * suitable for this model.
     * @param {*} obj
     * @returns {*|undefined}
     * @example
     var id = context.model('User').idOf({ id:1, "name":"anonymous"});
     */
    idOf(obj) {
        if (typeof obj === 'undefined')
            return;
        if (obj===null)
            return;
        if (typeof this.primaryKey === 'undefined' || this.primaryKey === null)
            return;
        if (typeof obj === 'object')
            return obj[this.primaryKey];
        return obj;
    }

    /**
     * Casts the given object and returns an object that is going to be used against the underlying database.
     * @param {*} obj - The source object which is going to be cast
     * @param {number=} state - The state of the source object.
     * @returns {*} - Returns an object which is going to be against the underlying database.
     */
    cast(obj, state) {
       return cast_.call(this, obj, state);
    }

    /**
     * Casts the given source object and returns a data object based on the current model.
     * @param {*} dest - The destination object
     * @param {*} src - The source object
     * @param {function(Error=)} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     */
    recast(dest, src, callback) {
        callback = callback || (() => {});
        const self = this;
        if (_.isNil(src)) {
            callback();
            return;
        }
        if (_.isNil(dest)) {
            dest = { };
        }
        async.eachSeries(self.fields, (field, cb) => {
            try {
                if (src.hasOwnProperty(field.name)) {
                    //ensure db property removal
                    if (field.property && field.property!==field.name)
                        delete dest[field.name];
                    const mapping = self.inferMapping(field.name);
                    const name = field.property || field.name;
                    if (_.isNil(mapping)) {
                        //set destination property
                        dest[name] = src[field.name];
                        cb(null);
                    }
                    else if (mapping.associationType==='association') {

                        if (typeof dest[name] === 'object' && dest[name] ) {
                            //check associated object
                            if (dest[name][mapping.parentField]===src[field.name]) {
                                //return
                                cb(null);
                            }
                            else {
                                //load associated item
                                const associatedModel = self.context.model(mapping.parentModel);
                                associatedModel.where(mapping.parentField).equal(src[field.name]).silent().first((err, result) => {
                                    if (err) {
                                        cb(err);
                                    }
                                    else {
                                        dest[name] = result;
                                        //return
                                        cb(null);
                                    }
                                });
                            }
                        }
                        else {
                            //set destination property
                            dest[name] = src[field.name];
                            cb(null);
                        }
                    }
                }
                else {
                    cb(null);
                }
            }
            catch (e) {
                cb(e);
            }
        }, err => {
            callback(err);
        });
    }

    /**
     * Casts the given object and returns an object that was prepared for insert.
     * @param obj {*} - The object to be cast
     * @returns {*}
     */
    new(obj) {
        return this.cast(obj);
    }

    /**
     * Saves the given object or array of objects
     * @param obj {*|Array}
     * @param callback {Function=} - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @returns {Promise<T>|*} - If callback parameter is missing then returns a Promise object.
     * @example
     //save a new group (Sales)
     var group = { "description":"Sales Users", "name":"Sales" };
     context.model("Group").save(group).then(function() {
            console.log('A new group was created with ID ' + group.id);
            done();
        }).catch(function(err) {
            done(err);
        });
     */
    save(obj, callback) {
        const self = this;
        if (typeof callback === 'undefined') {
            return Q.Promise((resolve, reject) => {
                return save_.bind(self)( obj, err => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(obj);
                });
            });
        }
        return save_.bind(self)(obj, callback);
    }

    /**
     * Infers the state of the given object.
     * @param {DataObject|*} obj - The source object
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @see DataObjectState
     */
    inferState(obj, callback) {
        const self = this;
        const DataStateValidatorListener = require('./data-state-validator').DataStateValidatorListener;
        const e = { model:self, target:obj };
        DataStateValidatorListener.prototype.beforeSave(e, err => {
            //if error return error
            if (err) { return callback(err); }
            //otherwise return the calucated state
            callback(null, e.state);
        });
    }

    /**
     * Gets an array of strings which contains the super types of this model e.g. User model may have ['Account','Thing'] as super types
     * @returns {Array}
     */
    getSuperTypes() {
        const result=[];
        let baseModel = this.base();
        while(baseModel!=null) {
            result.unshift(baseModel.name);
            baseModel = baseModel.base();
        }
        return result;
    }

    /**
     * Updates an item or an array of items
     * @param obj {*|Array} - The item or the array of items to update
     * @param callback {Function=} - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @returns {Promise<T>|*} - If callback parameter is missing then returns a Promise object.
     */
    update(obj, callback) {
        if (typeof callback !== 'function') {
            const d = Q.defer();
            update_.call(this, obj, (err, result) => {
                if (err) { return d.reject(err); }
                d.resolve(result);
            });
            return d.promise;
        }
        else {
            return update_.call(this, obj, callback);
        }
    }

    /**
     * Inserts an item or an array of items
     * @param obj {*|Array} - The item or the array of items to update
     * @param callback {Function=} - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @returns {Promise<T>|*} - If callback parameter is missing then returns a Promise object.
     */
    insert(obj, callback) {
        if (typeof callback !== 'function') {
            const d = Q.defer();
            insert_.call(this, obj, (err, result) => {
                if (err) { return d.reject(err); }
                d.resolve(result);
            });
            return d.promise;
        }
        else {
            return insert_.call(this, obj, callback);
        }
    }

    /**
     * Deletes the given object or array of objects
     * @param obj {*|Array} The item or the array of items to delete
     * @param callback {Function=} - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @returns {Promise<T>|*} - If callback parameter is missing then returns a Promise object.
     * @example
     //remove group (Sales)
     var group = { "name":"Sales" };
     context.model("Group").remove(group).then(function() {
            done();
        }).catch(function(err) {
            done(err);
        });
     */
    remove(obj, callback) {
        if (typeof callback !== 'function') {
            const d = Q.defer();
            remove_.call(this, obj, (err, result) => {
                if (err) { return d.reject(err); }
                d.resolve(result);
            });
            return d.promise;
        }
        else {
            return remove_.call(this, obj, callback);
        }
    }

    /**
     * Performing an automatic migration of current data model based on the current model's definition.
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     */
    migrate(callback) {
        const self = this;
        //cache: data model migration
        //prepare migration cache
        const configuration = self.context.getConfiguration();
        configuration.cache = configuration.cache || { };
        if (configuration.cache.hasOwnProperty(self.name) === false) {
            // set cache
            configuration.cache[self.name] = { };
        }
        if (configuration.cache[self.name].version===self.version) {
            //model has already been migrated, so do nothing
            return callback();
        }
        if (self.abstract) {
            return new callback(new DataError('EABSTRACT','An abstract model cannot be instantiated.',null,self.name));
        }
        //do not migrate sealed models
        if (self.sealed) {
            return callback();
        }
        const context = self.context;
        //do migration
        const fields = self.attributes.filter(x => {
            return (self.name === x.model) && (!x.many);
        });

        if ((fields===null) || (fields.length===0))
            throw new Error('Migration is not valid for this model. The model has no fields.');
        const migration = new DataModelMigration();
        migration.add = _.map(fields, x => {
            return _.assign({ }, x);
        });
        migration.version = _.isNil(self.version) ? '0.0' : self.version;
        migration.appliesTo = self.sourceAdapter;
        migration.model = self.name;
        migration.description = sprintf('%s migration (version %s)', this.title, migration.version);
        if (context===null)
            throw new Error('The underlying data context cannot be empty.');

        //get all related models
        const models = [];
        // self.fields.filter(function(x) {
        //     return (!conf.dataTypes[x.type] && (self.name!=x.type));
        // }).forEach(function(x) {
        //     var m = context.model(x.type);
        //     if (m) {
        //         var m1 = models.find(function(y) {
        //             return y.name === m.name;
        //         });
        //     }
        // });
        const db = context.db;
        const baseModel = self.base();
        if (baseModel!==null) {
            models.push(baseModel);
        }
        //validate associated models
        migration.add.forEach(x => {
            //validate mapping
            const mapping = self.inferMapping(x.name);
            if (mapping && mapping.associationType === 'association') {
                if (mapping.childModel === self.name) {
                    //get parent model
                    const parentModel = self.context.model(mapping.parentModel);

                    const attr = parentModel.getAttribute(mapping.parentField);
                    if (attr) {
                            if (attr.type === 'Counter') {
                                x.type = 'Integer';
                            }
                            else {
                                x.type = attr.type;
                            }

                    }
                }
                migration.indexes.push({
                    name: 'INDEX_' + migration.appliesTo.toUpperCase() + '_' + x.name.toUpperCase(),
                    columns: [ x.name ]
                });
            }
            else if (x.indexed === true) {
                migration.indexes.push({
                    name: 'INDEX_' + migration.appliesTo.toUpperCase() + '_' + x.name.toUpperCase(),
                    columns: [ x.name ]
                });
            }
        });

        //execute transaction
        db.executeInTransaction(tr => {
            if (models.length===0) {
                self.emit('before.upgrade', { model:self }, err => {
                    if (err) { return tr(err); }
                    db.migrate(migration, err => {
                        if (err) { return tr(err); }
                        if (migration['updated']) {
                            return tr();
                        }
                        //execute after migrate events
                        self.emit('after.upgrade', { model:self }, err => {
                            return tr(err);
                        });
                    });
                });
            }
            else {
                async.eachSeries(models,(m, cb) => {
                    if (m) {
                        m.migrate(cb);
                    }
                    else {
                        return cb();
                    }
                }, err => {
                    if (err) { return tr(err); }
                    self.emit('before.upgrade', { model:self }, err => {
                        if (err) { return tr(err); }
                        db.migrate(migration, err => {
                            if (err) { return tr(err);  }
                            if (migration['updated']) {
                                return tr();
                            }
                            //execute after migrate events
                            self.emit('after.upgrade', { model:self }, err => {
                                return tr(err);
                            });
                        });
                    });
                });
            }
        }, err => {
            if (!err) {
                //set migration info to configuration cache (conf.cache.model.version=[current version])
                //cache: data model migration
                configuration.cache[self.name].version = self.version;
            }
            callback(err);
        });
    }

    /**
     * Gets an instance of DataField class which represents the primary key of this model.
     * @returns {DataField|*}
     */
    key() {
        return this.attributes.find(x => { return x.primary===true; });
    }

    /**
     * Gets an instance of DataField class based on the given name.
     * @param {String} name - The name of the field.
     * @return {DataField|*} - Returns a data field if exists. Otherwise returns null.
     */
    field(name) {
        if (typeof name !== 'string')
            return null;
        return this.attributes.find(x => { return (x.name===name) || (x.property===name); });
    }

    /**
     *
     * @param {string|*} attr
     * @param {string=} alias
     * @returns {DataQueryable|QueryField|*}
     */
    fieldOf(attr, alias) {
        const q = new DataQueryable(this);
        return q.fieldOf(attr, alias);
    }

    /**
     * Gets an instance of DataModelView class which represents a model view with the given name.
     * @param {string} name - A string that represents the name of the view.
     * @returns {DataModelView|undefined}
     *@example
     var view = context.model('Person').dataviews('summary');
     *
     */
    dataviews(name) {
        const self = this;
        const re = new RegExp('^' + name.replace('*','\\*').replace('$','\\$') + '$', 'ig');
        const view = self.views.filter(x => { return re.test(x.name);})[0];
        if (_.isNil(view))
            return;
        return _.assign(new DataModelView(self), view);
    }

    /**
     * Gets an instance of DataModelView class which represents a model view with the given name.
     * @param {string} name - A string that represents the name of the view.
     * @returns {DataModelView|undefined}
     *@example
     var view = context.model('Person').getDataView('summary');
     *
     */
    getDataView(name) {
        const self = this;
        const re = new RegExp('^' + name.replace('$','\\$') + '$', 'ig');
        const view = self.views.filter(x => { return re.test(x.name);})[0];
        if (_.isNil(view))
        {
            return _.assign(new DataModelView(self), {
                'name':'default',
                'title':'Default View',
                'fields': self.attributes.map(x => {
                    return { 'name':x.name }
                })
            });
        }
        return _.assign(new DataModelView(self), view);
    }

    /**
     * Gets a field association mapping based on field attributes, if any. Otherwise returns null.
     * @param {string} name - The name of the field
     * @returns {DataAssociationMapping|*}
     */
    inferMapping(name) {

        const self = this;
        //ensure model cached mappings
        const conf = self.context.model(self.name);
        if (typeof conf === 'undefined' || conf === null) {
            return;
        }
        if (_.isNil(conf[mappingsProperty])) {
            conf[mappingsProperty] = { };
        }

        if (_.isObject(conf[mappingsProperty][name])) {
            if (conf[mappingsProperty][name] instanceof DataAssociationMapping)
                return conf[mappingsProperty][name];
            else
                return  new DataAssociationMapping(conf[mappingsProperty][name]);
        }

        const field = self.field(name);
        let result;
        if (_.isNil(field))
            return null;
        //get default mapping
        const defaultMapping = inferDefaultMapping.bind(this)(conf, name);
        if (_.isNil(defaultMapping)) {
            //set mapping to null
            conf[mappingsProperty][name] = defaultMapping;
            return defaultMapping;
        }
        //extend default mapping attributes
        const mapping = _.assign(defaultMapping, field.mapping);

        let associationAdapter;
        if (mapping.associationType === 'junction' && mapping.associationAdapter && typeof mapping.associationObjectField === 'undefined') {
            // validate association adapter
            associationAdapter = self.context.model(mapping.associationAdapter);
            if (associationAdapter) {
                // try to find association adapter parent field
                const associationParentAttr = _.find(associationAdapter.attributes, x => {
                    return (x.primary === 'undefined' || x.primary === false) && x.type === mapping.parentModel;
                });
                if (associationParentAttr) {
                    mapping.associationObjectField = associationParentAttr.name;
                }
            }
        }
        if (mapping.associationType === 'junction' && typeof mapping.associationObjectField === 'undefined') {
            // todo: remove this rule and use always "object" as association object field (solve backward compatibility issues)
            // set default object field
            mapping.associationObjectField = 'parentId';
            if (mapping.refersTo && mapping.parentModel === self.name) {
                // get type
                const refersTo = self.getAttribute(mapping.refersTo);
                // validate data object tag association
                if (refersTo && self.context.getConfiguration().getStrategy(DataConfigurationStrategy).hasDataType(refersTo.type)) {
                    mapping.associationObjectField = 'object';
                }
            }
        }
        if (mapping.associationType === 'junction' && mapping.associationAdapter && typeof mapping.associationValueField === 'undefined') {
            // validate association adapter
            associationAdapter = self.context.model(mapping.associationAdapter);
            if (associationAdapter) {
                // try to find association adapter parent field
                const associationChildAttr = _.find(associationAdapter.attributes, x => {
                    return typeof (x.primary === 'undefined' || x.primary === false) &&  x.type === mapping.childModel;
                });
                if (associationChildAttr) {
                    mapping.associationValueField = associationChildAttr.name;
                }
            }
        }
        if (mapping.associationType === 'junction' && typeof mapping.associationValueField === 'undefined') {
            // todo: remove this rule and use always "value" as association value field (solve backward compatibility issues)
            // set default object field
            mapping.associationValueField = 'valueId';
            if (mapping.refersTo && mapping.parentModel === self.name) {
                // get type
                const refersToAttr = self.getAttribute(mapping.refersTo);
                // validate data object tag association
                if (refersToAttr && self.context.getConfiguration().getStrategy(DataConfigurationStrategy).hasDataType(refersToAttr.type)) {
                    mapping.associationValueField = 'value';
                }
            }
        }

        //if field model is different than the current model
        if (field.model !== self.name) {
            //if field mapping is already associated with the current model
            // (child or parent model is equal to the current model)
            if ((mapping.childModel===self.name) || (mapping.parentModel===self.name)) {
                //cache mapping
                conf[mappingsProperty][name] = new DataAssociationMapping(mapping);
                //do nothing and return field mapping
                return conf[mappingsProperty][name];
            }
            //get super types
            const superTypes = self.getSuperTypes();
            //map an inherited association
            //1. super model has a foreign key association with another model
            //(where super model is the child or the parent model)
            if (mapping.associationType === 'association') {
                //create a new cloned association
                result = new DataAssociationMapping(mapping);
                //check super types
                if (superTypes.indexOf(mapping.childModel)>=0) {
                    //set child model equal to current model
                    result.childModel = self.name;
                }
                else if (superTypes.indexOf(mapping.parentModel)>=0) {
                    //set child model equal to current model
                    result.parentModel = self.name;
                }
                else {
                    //this is an exception
                    throw new DataError('EMAP','An inherited data association cannot be mapped.');
                }
                //cache mapping
                conf[mappingsProperty][name] = result;
                //and finally return the newly created DataAssociationMapping object
                return result;
            }
            //2. super model has a junction (many-to-many association) with another model
            //(where super model is the child or the parent model)
            else if (mapping.associationType === 'junction') {
                //create a new cloned association
                result = new DataAssociationMapping(mapping);
                if (superTypes.indexOf(mapping.childModel)>=0) {
                    //set child model equal to current model
                    result.childModel = self.name;
                }
                else if (superTypes.indexOf(mapping.parentModel)>=0) {
                    //set parent model equal to current model
                    result.parentModel = self.name;
                }
                else {
                    //this is an exception
                    throw new DataError('EMAP','An inherited data association cannot be mapped.');
                }
                //cache mapping
                conf[mappingsProperty][name] = result;
                //and finally return the newly created DataAssociationMapping object
                return result;
            }
        }
        //in any other case return the association mapping object
        if (mapping instanceof DataAssociationMapping) {
            //cache mapping
            conf[mappingsProperty][name] = mapping;
            //and return
            return mapping;
        }
        result = _.assign(new DataAssociationMapping(), mapping);
        //cache mapping
        conf[mappingsProperty][name] = result;
        //and return
        return result;

    }

    /**
     * Validates the given object against validation rules which are defined either by the data type or the definition of each attribute
     <p>Read more about data validation <a href="DataValidatorListener.html">here</a>.</p>
     * @param {*} obj - The data object which is going to be validated
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @returns {Promise|*} - If callback parameter is missing then returns a Promise object.
     */
    validateForUpdate(obj, callback) {
        if (typeof callback !== 'function') {
            const d = Q.defer();
            validate_.call(this, obj, 2, (err, result) => {
                if (err) { return d.reject(err); }
                d.resolve(result);
            });
            return d.promise;
        }
        else {
            return validate_.call(this, obj, callback);
        }
    }

    /**
     * Validates the given object against validation rules which are defined either by the data type or the definition of each attribute
     <p>Read more about data validation <a href="DataValidatorListener.html">here</a>.</p>
     * @param {*} obj - The data object which is going to be validated
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @returns {Promise|*} - If callback parameter is missing then returns a Promise object.
     <p>Read more about data validation <a href="DataValidationListener.html">here</a></p>
     */
    validateForInsert(obj, callback) {
        if (typeof callback !== 'function') {
            const d = Q.defer();
            validate_.call(this, obj, 1, (err, result) => {
                if (err) { return d.reject(err); }
                d.resolve(result);
            });
            return d.promise;
        }
        else {
            return validate_.call(this, obj, callback);
        }
    }

    /**
     * Sets the number of levels of the expandable attributes.
     * The default value is 1 which means that any expandable attribute will be flat (without any other nested attribute).
     * If the value is greater than 1 then the nested objects may contain other nested objects and so on.
     * @param {Number=} value - A number which represents the number of levels which are going to be used in expandable attributes.
     * @returns {DataQueryable}
     * @example
     //get orders, expand customer and get customer's nested objects if any.
     context.model('Order')
     .levels(2)
     .orderByDescending('dateCreated)
     .expand('customer')
     .getItems().then(function(result) {
            done(null, result);
        }).catch(function(err) {
            done(err);
        });
     */
    levels(value) {
        const result = new DataQueryable(this);
        return result.levels(value);
    }

    /**
     * Gets an array of active models which are derived from this model.
     * @returns {Promise|*}
     * @example
     * context.model("Thing").getSubTypes().then(function(result) {
            console.log(JSON.stringify(result,null,4));
            return done();
        }).catch(function(err) {
            return done(err);
        });
     */
    getSubTypes() {
        const self = this;
        const d = Q.defer();
        process.nextTick(() => {
            const migrations = self.context.model('Migration');
            if (_.isNil(migrations)) {
                return d.resolve([]);
            }
            migrations.silent()
                .select('model')
                .groupBy('model')
                .all().then(result => {
                const conf = self.context.getConfiguration().getStrategy(DataConfigurationStrategy);
                const arr = [];
                result.forEach(x => {
                    const m = conf.getModelDefinition(x.model);
                    if (m && m.inherits === self.name) {
                        arr.push(m.name);
                    }
                });
                return d.resolve(arr);
            }).catch(err => {
                return d.reject(err)
            });
        });
        return d.promise;
    }

    /**
     * @param {boolean=} deep
     * @returns {Promise}
     */
    getReferenceMappings(deep) {
        const self = this;
        const context = self.context;
        deep = (typeof deep === 'undefined') ? true : parsers.parseBoolean(deep);
        const d = Q.defer();
        process.nextTick(() => {
            const referenceMappings = [];
            const name = self.name;
            let attributes;
            const migrations = self.context.model('Migration');
            if (_.isNil(migrations)) {
                return d.resolve([]);
            }
            migrations.silent()
                .select('model')
                .groupBy('model')
                .all().then(result => {
                _.forEach(result, x => {
                    const m = context.model(x.model);
                    if (_.isNil(m)) {
                        return;
                    }
                    if (deep) {
                        attributes = m.attributes;
                    } else {
                        attributes = _.filter(m.attributes, a => {
                            return a.model === m.name;
                        });
                    }
                    _.forEach(attributes, y => {
                        const mapping = m.inferMapping(y.name);
                        if (mapping && ((mapping.parentModel === name) || (mapping.childModel === name && mapping.associationType === 'junction'))) {
                            referenceMappings.push(_.assign(mapping, { refersTo:y.name }));
                        }
                    });
                });
                return d.resolve(referenceMappings);
            }).catch(err => {
                return d.reject(err)
            });
        });
        return d.promise;
    }

    /**
     * Gets an attribute of this data model.
     * @param {string} name
     */
    getAttribute(name) {
        if (_.isNil(name)) { return; }
        if (typeof name !== 'string') { return; }
        return this.attributes.find(x => { return x.name === name; });
    }

    /**
     * Gets a collection of DataObject instances by executing the defined query.
     * @returns {Promise|*}
     */
    getTypedItems() {
        const self = this;
        const d = Q.defer();
        process.nextTick(() => {
            const q = new DataQueryable(self);
            q.getTypedItems().then(result => {
                return d.resolve(result);
            }).catch(err => {
                return d.reject(err);
            });
        });
        return d.promise;
    }

    /**
     * Gets a collection of DataObject instances by executing the defined query.
     * @returns {Promise|*}
     */
    getItems() {
        const self = this;
        const d = Q.defer();
        process.nextTick(() => {
            const q = new DataQueryable(self);
            q.getItems().then(result => {
                return d.resolve(result);
            }).catch(err => {
                return d.reject(err);
            });
        });
        return d.promise;
    }

    /**
     * Gets a result set that contains a collection of DataObject instances by executing the defined query.
     * @returns {Promise|*}
     */
    getTypedList() {
        const self = this;
        const d = Q.defer();
        process.nextTick(() => {
            const q = new DataQueryable(self);
            q.getTypedList().then(result => {
                return d.resolve(result);
            }).catch(err => {
                return d.reject(err);
            });
        });
        return d.promise;
    }

    /**
     * Gets a result set that contains a collection of DataObject instances by executing the defined query.
     * @returns {Promise|*}
     */
    getList() {
        const self = this;
        const d = Q.defer();
        process.nextTick(() => {
            const q = new DataQueryable(self);
            q.list().then(result => {
                return d.resolve(result);
            }).catch(err => {
                return d.reject(err);
            });
        });
        return d.promise;
    }
}

LangUtils.inherits(DataModel, SequentialEventEmitter);

/**
 * @this DataModel
 * @private
 */
function unregisterContextListeners() {
    //unregister event listeners
    this.removeAllListeners('before.save');
    this.removeAllListeners('after.save');
    this.removeAllListeners('before.remove');
    this.removeAllListeners('after.remove');
    this.removeAllListeners('before.execute');
    this.removeAllListeners('after.execute');
    this.removeAllListeners('after.upgrade');
}
/**
 * @this DataModel
 * @private
 */
function registerContextListeners() {

   //description: change default max listeners (10) to 64 in order to avoid node.js message
   // for reaching the maximum number of listeners
   //author: k.barbounakis@gmail.com
   if (typeof this.setMaxListeners === 'function') {
       this.setMaxListeners(64);
   }
   const DataStateValidatorListener = require('./data-state-validator').DataStateValidatorListener;

   //1. State validator listener
   this.on('before.save', DataStateValidatorListener.prototype.beforeSave);
   this.on('before.remove', DataStateValidatorListener.prototype.beforeRemove);
   //2. Default values Listener
   this.on('before.save', DefaultValueListener.prototype.beforeSave);
   //3. Calculated values listener
   this.on('before.save', CalculatedValueListener.prototype.beforeSave);

   //register before execute caching
   if (this.caching==='always' || this.caching==='conditional') {
       this.on('before.execute', DataCachingListener.prototype.beforeExecute);
   }
   //register after execute caching
   if (this.caching==='always' || this.caching==='conditional') {
       this.on('after.execute', DataCachingListener.prototype.afterExecute);
   }

   //migration listeners
   this.on('after.upgrade',DataModelCreateViewListener.prototype.afterUpgrade);
   this.on('after.upgrade',DataModelSeedListener.prototype.afterUpgrade);

   //get module loader
   /**
    * @type {ModuleLoader|*}
    */
   const moduleLoader = this.context.getConfiguration().getStrategy(ModuleLoader);
   //register configuration listeners
   if (this.eventListeners) {
       for (let i = 0; i < this.eventListeners.length; i++) {
           const listener = this.eventListeners[i];
           //get listener type (e.g. type: require('./custom-listener.js'))
           if (listener.type && !listener.disabled)
           {
               /**
                * @type DataEventListener
                */
               let dataEventListener;
               if (/^@themost\/data\//i.test(listener.type)) {
                   dataEventListener = moduleLoader.require(listener.type);
                   //dataEventListener = require(listener.type.replace(/^@themost\/data\//,'./'));
               }
               else {
                   dataEventListener = moduleLoader.require(listener.type);
               }

               //if listener exports beforeSave function then register this as before.save event listener
               if (typeof dataEventListener.beforeSave === 'function')
                   this.on('before.save', dataEventListener.beforeSave);
               //if listener exports afterSave then register this as after.save event listener
               if (typeof dataEventListener.afterSave === 'function')
                   this.on('after.save', dataEventListener.afterSave);
               //if listener exports beforeRemove then register this as before.remove event listener
               if (typeof dataEventListener.beforeRemove === 'function')
                   this.on('before.remove', dataEventListener.beforeRemove);
               //if listener exports afterRemove then register this as after.remove event listener
               if (typeof dataEventListener.afterRemove === 'function')
                   this.on('after.remove', dataEventListener.afterRemove);
               //if listener exports beforeExecute then register this as before.execute event listener
               if (typeof dataEventListener.beforeExecute === 'function')
                   this.on('before.execute', dataEventListener.beforeExecute);
               //if listener exports afterExecute then register this as after.execute event listener
               if (typeof dataEventListener.afterExecute === 'function')
                   this.on('after.execute', dataEventListener.afterExecute);
               //if listener exports afterUpgrade then register this as after.upgrade event listener
               if (typeof dataEventListener.afterUpgrade === 'function')
                   this.on('after.upgrade', dataEventListener.afterUpgrade);
           }
       }
   }
   //before execute
   this.on('before.execute', DataPermissionEventListener.prototype.beforeExecute);

}

/**
 * @private
 * @this DataModel
 * @param {*} params
 * @param {Function} callback
 * @returns {*}
 */
function filterInternal(params, callback) {
    const self = this;
    const parser = OpenDataParser.create();
    const $joinExpressions = [];
    let view;
    if (typeof params !== 'undefined' && params !== null && typeof params.$select === 'string') {
        //split select
        const arr = params.$select.split(',');
        if (arr.length===1) {
            //try to get data view
            view = self.dataviews(arr[0]);
        }
    }
    parser.resolveMember = (member, cb) => {
        if (view) {
            const field = view.fields.find(x => { return x.property === member });
            if (field) { member = field.name; }
        }
        const attr = self.field(member);
        if (attr)
            member = attr.name;
        if (DataAttributeResolver.prototype.testNestedAttribute.call(self,member)) {
            try {
                const member1 = member.split('/');
                const mapping = self.inferMapping(member1[0]);
                let expr;
                if (mapping && mapping.associationType === 'junction') {
                    const expr1 = DataAttributeResolver.prototype.resolveJunctionAttributeJoin.call(self, member);
                    expr = expr1.$expand;
                    //replace member expression
                    member = expr1.$select.$name.replace(/\./g,'/');
                }
                else {
                    expr = DataAttributeResolver.prototype.resolveNestedAttributeJoin.call(self, member);
                }
                if (expr) {
                    const arrExpr = [];
                    if (_.isArray(expr))
                        arrExpr.push.apply(arrExpr, expr);
                    else
                        arrExpr.push(expr);
                    arrExpr.forEach(y => {
                        const joinExpr = $joinExpressions.find(x => {
                            if (x.$entity && x.$entity.$as) {
                                return (x.$entity.$as === y.$entity.$as);
                            }
                            return false;
                        });
                        if (_.isNil(joinExpr))
                            $joinExpressions.push(y);
                    });
                }
            }
            catch (err) {
                cb(err);
                return;
            }
        }
        if (typeof self.resolveMember === 'function')
            self.resolveMember.call(self, member, cb);
        else
            DataFilterResolver.prototype.resolveMember.call(self, member, cb);
    };
    parser.resolveMethod = (name, args, cb) => {
        if (typeof self.resolveMethod === 'function')
            self.resolveMethod.call(self, name, args, cb);
        else
            DataFilterResolver.prototype.resolveMethod.call(self, name, args, cb);
    };
    let filter;

    if ((params instanceof DataQueryable) && (self.name === params.model.name)) {
        const q = new DataQueryable(self);
        _.assign(q, params);
        _.assign(q.query, params.query);
        return callback(null, q);
    }

    if (typeof params === 'string') {
        filter = params;
    }
    else if (typeof params === 'object') {
        filter = params.$filter;
    }

    try {
        parser.parse(filter, (err, query) => {
            if (err) {
                callback(err);
            }
            else {
                //create a DataQueryable instance
                const q = new DataQueryable(self);
                q.query.$where = query;
                if ($joinExpressions.length>0)
                    q.query.$expand = $joinExpressions;
                //prepare
                q.query.prepare();

                if (typeof params === 'object') {
                    //apply query parameters
                    const select = params.$select;

                    const skip = params.$skip || 0;
                    const orderBy = params.$orderby || params.$order;
                    const groupBy = params.$groupby || params.$group;
                    const expand = params.$expand;
                    const levels = parseInt(params.$levels);
                    const top = params.$top || params.$take;
                    //select fields
                    if (typeof select === 'string') {
                        q.select.apply(q, select.split(',').map(x => {
                            return x.replace(/^\s+|\s+$/g, '');
                        }));
                    }
                    //apply group by fields
                    if (typeof groupBy === 'string') {
                        q.groupBy.apply(q, groupBy.split(',').map(x => {
                            return x.replace(/^\s+|\s+$/g, '');
                        }));
                    }
                    if ((typeof levels === 'number') && !isNaN(levels)) {
                        //set expand levels
                        q.levels(levels);
                    }
                    //set $skip
                    q.skip(skip);
                    if (top)
                        q.query.take(top);
                    //set caching
                    if (params.$cache && self.caching === 'conditional') {
                        q.cache(true);
                    }
                    //set $orderby
                    if (orderBy) {
                        orderBy.split(',').map(x => {
                            return x.replace(/^\s+|\s+$/g, '');
                        }).forEach(x => {
                            if (/\s+desc$/i.test(x)) {
                                q.orderByDescending(x.replace(/\s+desc$/i, ''));
                            }
                            else if (/\s+asc/i.test(x)) {
                                q.orderBy(x.replace(/\s+asc/i, ''));
                            }
                            else {
                                q.orderBy(x);
                            }
                        });
                    }
                    if (expand) {

                        const resolver = require('./data-expand-resolver');
                        const matches = resolver.testExpandExpression(expand);
                        if (matches && matches.length>0) {
                            q.expand.apply(q, matches);
                        }
                    }
                    //return
                    callback(null, q);
                }
                else {
                    //and finally return DataQueryable instance
                    callback(null, q);
                }

            }
        });
    }
    catch(e) {
        return callback(e);
    }
}

/**
 * @this DataModel
 * @private
 * @param {*} obj
 */
function convertInternal_(obj) {
    const self = this;

    //get type parsers (or default type parsers)
    const localParsers = self.parsers || parsers;

    let parser;
    let value;
    self.attributes.forEach(x => {
        value = obj[x.name];
        if (value) {
            //get parser for this type
            parser = localParsers['parse'.concat(x.type)];
            //if a parser exists
            if (typeof parser === 'function')
            //parse value
                obj[x.name] = parser(value);
            else {
                //get mapping
                const mapping = self.inferMapping(x.name);
                if (mapping) {
                    if ((mapping.associationType==='association') && (mapping.childModel===self.name)) {
                        const associatedModel = self.context.model(mapping.parentModel);
                        if (associatedModel) {
                            if (typeof value === 'object') {
                                //set associated key value (e.g. primary key value)
                                convertInternal_.call(associatedModel, value);
                            }
                            else {
                                const field = associatedModel.field(mapping.parentField);
                                if (field) {
                                    //parse raw value
                                    parser = localParsers['parse'.concat(field.type)];
                                    if (typeof parser === 'function')
                                        obj[x.name] = parser(value);
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

function dasherize(data) {
    if (typeof data === 'string')
    {
        return data.replace(/(^\s*|\s*$)/g, '').replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').replace(/^-/,'').toLowerCase();
    }
}

/**
 * @this DataModel
 * @returns {*}
 * @constructor
 * @private
 */
function getDataObjectClass_() {
    const self = this;
    let DataObjectClass = self['DataObjectClass'];
    if (typeof DataObjectClass === 'undefined')
    {
        if (typeof self.classPath === 'string') {
            DataObjectClass = require(self.classPath);
        }
        else {
            //try to find class file with data model's name in lower case
            // e.g. OrderDetail -> orderdetail-model.js (backward compatibility naming convention)
            let classPath = path.join(process.cwd(),'app','models',self.name.toLowerCase().concat('-model.js'));
            try {
                DataObjectClass = require(classPath);
            }
            catch(e) {
                if (e.code === 'MODULE_NOT_FOUND') {
                    try {
                        //if the specified class file was not found try to dasherize model name
                        // e.g. OrderDetail -> order-detail-model.js
                        classPath = path.join(process.cwd(),'app','models',dasherize(self.name).concat('-model.js'));
                        DataObjectClass = require(classPath);
                    }
                    catch(e) {
                        if (e.code === 'MODULE_NOT_FOUND') {
                            if (_.isNil(self.inherits)) {
                                //if , finally, we are unable to find class file, load default DataObject class
                                DataObjectClass = require('./data-object').DataObject;
                            }
                            else {
                                DataObjectClass = getDataObjectClass_.call(self.base());
                            }
                        }
                        else {
                            throw e;
                        }
                    }
                }
                else {
                    throw e;
                }
            }
        }
        //cache DataObject class property
        /**
         * @type {DataConfigurationStrategy}
         */
        const strategy = self.context.getConfiguration().getStrategy(DataConfigurationStrategy);
        const modelDefinition = strategy.getModelDefinition(self.name);
        modelDefinition['DataObjectClass'] = self['DataObjectClass'] = DataObjectClass;
    }
    return DataObjectClass;
}

/**
 * @this DataModel
 * @param {*} obj
 * @param {number=} state
 * @returns {*}
 * @private
 */
function cast_(obj, state) {
    const self = this;
    if (obj==null)
        return {};
    if (typeof obj === 'object' && obj instanceof Array)
    {
        return obj.map(x => {
            return cast_.call(self, x, state);
        });
    }
    else
    {
        //ensure state (set default state to Insert=1)
        state = _.isNil(state) ? (_.isNil(obj.$state) ? 1 : obj.$state) : state;
        const result = {};
        let name;
        let superModel;
        if (typeof obj.getSuperModel === 'function') {
            superModel = obj.getSuperModel();
        }
        self.attributes.filter(x => {
            return x.hasOwnProperty('many') ? !x.many : true;
        }).filter(x => {
            if (x.model!==self.name) { return false; }
            return (!x.readonly) ||
                (x.readonly && (typeof x.calculation!=='undefined') && state===2) ||
                (x.readonly && (typeof x.value!=='undefined') && state===1) ||
                (x.readonly && (typeof x.calculation!=='undefined') && state===1);
        }).filter(y => {
            /*
            change: 2016-02-27
            author:k.barbounakis@gmail.com
            description:exclude non editable attributes on update operation
             */
            return (state===2) ? (y.hasOwnProperty('editable') ? y.editable : true) : true;
        }).forEach(x => {
            name = obj.hasOwnProperty(x.property) ? x.property : x.name;
            if (obj.hasOwnProperty(name))
            {
                let mapping = self.inferMapping(name);
                //if mapping is empty and a super model is defined
                if (_.isNil(mapping)) {
                    if (superModel && x.type === 'Object') {
                        //try to find if superModel has a mapping for this attribute
                        mapping = superModel.inferMapping(name);
                    }
                }
                if (_.isNil(mapping)) {
                    result[x.name] = obj[name];
                }
                else if (mapping.associationType==='association') {
                    if (typeof obj[name] === 'object' && obj[name] !== null)
                    //set associated key value (e.g. primary key value)
                        result[x.name] = obj[name][mapping.parentField];
                    else
                    //set raw value
                        result[x.name] = obj[name];
                }
            }
        });
        return result;
    }
}


/**
 * @this DataModel
 * @param {*} obj
 * @param {number=} state
 * @returns {*}
 * @private
 */
function castForValidation_(obj, state) {
    const self = this;
    if (obj==null)
        return {};
    if (typeof obj === 'object' && obj instanceof Array)
    {
        return obj.map(x => {
            return castForValidation_.call(self, x, state);
        });
    }
    else
    {
        //ensure state (set default state to Insert=1)
        state = _.isNil(state) ? (_.isNil(obj.$state) ? 1 : obj.$state) : state;
        const result = {};
        let name;
        self.attributes.filter(x => {
            if (x.model!==self.name) {
                if (parsers.parseBoolean(x.cloned) === false)
                        return false;
            }
            return (!x.readonly) ||
                (x.readonly && (typeof x.calculation!=='undefined') && state===2) ||
                (x.readonly && (typeof x.value!=='undefined') && state===1) ||
                (x.readonly && (typeof x.calculation!=='undefined') && state===1);
        }).filter(y => {
            /*
             change: 2016-02-27
             author:k.barbounakis@gmail.com
             description:exclude non editable attributes on update operation
             */
            return (state===2) ? (y.hasOwnProperty('editable') ? y.editable : true) : true;
        }).forEach(x => {
            name = obj.hasOwnProperty(x.property) ? x.property : x.name;
            if (obj.hasOwnProperty(name))
            {
                const mapping = self.inferMapping(name);
                if (_.isNil(mapping))
                    result[x.name] = obj[name];
                else if ((mapping.associationType==='association') && (mapping.childModel===self.name)) {
                    if ((typeof obj[name] === 'object') && (obj[name] !== null))
                    //set associated key value (e.g. primary key value)
                        result[x.name] = obj[name][mapping.parentField];
                    else
                    //set raw value
                        result[x.name] = obj[name];
                }
            }
        });
        return result;
    }
}

/**
 * @this DataModel
 * @param {*|Array} obj
 * @param {Function} callback
 * @private
 */
function save_(obj, callback) {
    const self = this;
    if (_.isNil(obj)) {
        callback.call(self, null);
        return;
    }
    //ensure migration
    self.migrate(err => {
        if (err) { callback(err); return; }
        //do save
        const arr = [];
        if (_.isArray(obj)) {
            for (let i = 0; i < obj.length; i++)
                arr.push(obj[i]);
        }
        else
            arr.push(obj);
        const db = self.context.db;
        let res = [];
        db.executeInTransaction(cb => {
            async.eachSeries(arr, (item, saveCallback) => {
                saveSingleObject_.call(self, item, (err, result) => {
                    if (err) {
                        saveCallback.call(self, err);
                        return;
                    }
                    res.push(result.insertedId);
                    saveCallback.call(self, null);
                });
            }, err => {
                if (err) {
                    res = null;
                    cb(err);
                    return;
                }
                cb(null);
            });
        }, err => {
            callback.call(self, err, res);
        });
    });
}

/**
 * @this DataModel
 * @param {*} obj
 * @param {Function} callback
 * @private
 */
function saveBaseObject_(obj, callback) {
    //ensure callback
    callback = callback || (() => {});
    const self = this;
    const base = self.base();
    //if obj is an array of objects throw exception (invoke callback with error)
    if (_.isArray(obj)) {
        callback.call(self, new Error('Invalid argument. Base object cannot be an array.'));
        return 0;
    }
    //if current model does not have a base model
    if (base===null) {
        //exit operation
        callback.call(self, null);
    }
    else {
        base.silent();
        //perform operation
        saveSingleObject_.call(base, obj, (err, result) => {
            callback.call(self, err, result);
        });
    }
}
/**
 * @this DataModel
 * @param {*} obj
 * @param {Function} callback
 * @private
 */
function saveSingleObject_(obj, callback) {
    const self = this;
    callback = callback || (() => {});
    if (obj==null) {
        callback.call(self);
        return;
    }
    if (_.isArray(obj)) {
        callback.call(self, new Error('Invalid argument. Source object cannot be an array.'));
        return 0;
    }
    //set super model (for further processing)
    if (typeof obj.getSuperModel !== 'function') {
        obj.getSuperModel = () => {
            return self;
        }
    }
    if (obj.$state === 4) {
        return removeSingleObject_.call(self, obj, callback);
    }
    //get object state before any other operation
    const state = obj.$state ? obj.$state : (obj[self.primaryKey]!=null ? 2 : 1);
    const e = {
        model: self,
        target: obj,
        state:state
    };
    //register nested objects listener (before save)
    self.once('before.save', DataNestedObjectListener.prototype.beforeSave);
    //register data association listener (after save)
    self.once('after.save', DataNestedObjectListener.prototype.afterSave);
    //register data association listener (before save)
    self.once('before.save', DataObjectAssociationListener.prototype.beforeSave);
    //register data association listener
    self.once('after.save', DataObjectAssociationListener.prototype.afterSave);
    //register unique constraint listener at the end of listeners collection (before emit)
    self.once('before.save', UniqueConstraintListener.prototype.beforeSave);
    //register data validators at the end of listeners collection (before emit)
    self.once('before.save', DataValidatorListener.prototype.beforeSave);
    //register not null listener at the end of listeners collection (before emit)
    self.once('before.save', NotNullConstraintListener.prototype.beforeSave);
    //before save (validate permissions)
    self.once('before.save', DataPermissionEventListener.prototype.beforeSave);
    //execute before update events
    self.emit('before.save', e, err => {
        //if an error occurred
        self.removeListener('before.save', DataPermissionEventListener.prototype.beforeSave);
        self.removeListener('before.save', NotNullConstraintListener.prototype.beforeSave);
        self.removeListener('before.save', DataValidatorListener.prototype.beforeSave);
        self.removeListener('before.save', UniqueConstraintListener.prototype.beforeSave);
        self.removeListener('before.save', DataObjectAssociationListener.prototype.beforeSave);
        self.removeListener('before.save', DataNestedObjectListener.prototype.beforeSave);
        if (err) {
            //invoke callback with error
            callback.call(self, err);
        }
        //otherwise execute save operation
        else {
            //save base object if any
            saveBaseObject_.call(self, e.target, (err, result) => {
                if (err) {
                    callback.call(self, err);
                    return;
                }
                //if result is defined
                if (result!==undefined)
                //sync original object
                    _.assign(e.target, result);
                //get db context
                const db = self.context.db;
                //create insert query
                const target = self.cast(e.target, e.state);
                let q = null;
                const key = target[self.primaryKey];
                if (e.state===1)
                    //create insert statement
                    q = QueryUtils.insert(target).into(self.sourceAdapter);
                else
                {
                    //create update statement
                    if (key)
                        delete target[self.primaryKey];
                    if (Object.keys(target).length>0)
                        q = QueryUtils.update(self.sourceAdapter).set(target).where(self.primaryKey).equal(e.target[self.primaryKey]);
                    else
                        //object does not have any properties other than primary key. do nothing
                        q = new EmptyQueryExpression();
                }
                if (q instanceof EmptyQueryExpression) {
                    if (key)
                        target[self.primaryKey] = key;
                    //get updated object
                    self.recast(e.target, target, err => {
                        if (err) {
                            //and return error
                            callback.call(self, err);
                        }
                        else {
                            //execute after update events
                            self.emit('after.save',e, err => {
                                //and return
                                return callback.call(self, err, e.target);
                            });
                        }
                    });
                }
                else {
                    const pm = e.model.field(self.primaryKey);
                    let nextIdentity;
                    const adapter = e.model.sourceAdapter;
                    if (_.isNil(pm)) {
                        return callback(new DataError('EMODEL','The primary key of the specified cannot be found',null, e.model.name))
                    }
                    //search if adapter has a nextIdentity function (also primary key must be a counter and state equal to insert)
                    if (pm.type === 'Counter' && typeof db.nextIdentity === 'function' && e.state===1) {
                        nextIdentity = db.nextIdentity;
                    }
                    else {
                        //otherwise use a dummy nextIdentity function
                        nextIdentity = (a, b, callback) => { return callback(); }
                    }
                    nextIdentity.call(db, adapter, pm.name, (err, insertedId) => {
                        if (err) { return callback.call(self, err); }
                        if (insertedId) {
                            //get object to insert
                            if (q.$insert) {
                                const o = q.$insert[adapter];
                                if (o) {
                                    //set the generated primary key
                                    o[pm.name] = insertedId;
                                }
                            }
                        }
                        db.execute(q, null, (err, result) => {
                            if (err) {
                                callback.call(self, err);
                            }
                            else {
                                if (key)
                                    target[self.primaryKey] = key;
                                //get updated object
                                self.recast(e.target, target, err => {
                                    if (err) {
                                        callback.call(self, err);
                                    }
                                    else {
                                        if (pm.type==='Counter' && typeof db.nextIdentity !== 'function' && e.state===1) {
                                            //if data adapter contains lastIdentity function
                                            const lastIdentity = db.lastIdentity || (lastCallback => {
                                                    if (_.isNil(result))
                                                        lastCallback(null, { insertId: null});
                                                    lastCallback(null, result);
                                                });
                                            lastIdentity.call(db, (err, lastResult) => {
                                                if (lastResult)
                                                    if (lastResult.insertId)
                                                        e.target[self.primaryKey] = lastResult.insertId;
                                                //raise after save listeners
                                                self.emit('after.save',e, err => {
                                                    //invoke callback
                                                    callback.call(self, err, e.target);
                                                });
                                            });
                                        }
                                        else {
                                            //raise after save listeners
                                            self.emit('after.save',e, err => {
                                                self.removeListener('after.save', DataObjectAssociationListener.prototype.afterSave);
                                                self.removeListener('after.save', DataNestedObjectListener.prototype.afterSave);
                                                //invoke callback
                                                callback.call(self, err, e.target);
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    });
}

/**
 * @this DataModel
 * @param {*|Array} obj
 * @param {Function} callback
 * @private
 */
function update_(obj, callback) {
    const self = this;
    //ensure callback
    callback = callback || (() => {});
    if (obj == null) {
        callback.call(self, null);
    }
    //set state
    if (_.isArray(obj)) {
        obj.forEach(x => {x['$state'] = 2; })
    }
    else {
        obj['$state'] = 2;
    }
    self.save(obj, callback);
}

/**
 * @this DataModel
 * @param {*|Array} obj
 * @param {Function} callback
 * @private
 */
function insert_(obj, callback) {
    const self = this;
    //ensure callback
    callback = callback || (() => {});
    if ((obj===null) || obj === undefined) {
        callback.call(self, null);
    }
    //set state
    if (_.isArray(obj)) {
        obj.forEach(x => {x['$state'] = 1; })
    }
    else {
        obj['$state'] = 1;
    }
    self.save(obj, callback);
}

/**
 * @this DataModel
 * @param {*|Array} obj
 * @param {Function} callback
 * @private
 */
function remove_(obj, callback) {
    const self = this;
    if (obj==null)
    {
        callback.call(self, null);
        return;
    }

    self.migrate(err => {
        if (err) { callback(err); return; }
        const arr = [];
        if (_.isArray(obj)) {
            for (let i = 0; i < obj.length; i++)
                arr.push(obj[i]);
        }
        else
            arr.push(obj);
        //delete objects
        const db = self.context.db;
        db.executeInTransaction(cb => {
            async.eachSeries(arr, (item, removeCallback) => {
                removeSingleObject_.call(self, item, err => {
                    if (err) {
                        removeCallback.call(self, err);
                        return;
                    }
                    removeCallback.call(self, null);
                });
            }, err => {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null);
            });
        }, err => {
            callback.call(self, err);
        });
    });
}

/**
 * @this DataModel
 * @param {Object} obj
 * @param {Function} callback
 * @private
 */
function removeSingleObject_(obj, callback) {
   const self = this;
   callback = callback || (() => {});
   if (obj==null) {
       callback.call(self);
       return;
   }
   if (_.isArray(obj)) {
       callback.call(self, new Error('Invalid argument. Object cannot be an array.'));
       return 0;
   }
   const e = {
       model: self,
       target: obj,
       state: 4
   };
   //register nested objects listener
   self.once('before.remove', DataNestedObjectListener.prototype.beforeRemove);
   //register data referenced object listener
   self.once('before.remove', DataReferencedObjectListener.prototype.beforeRemove);
   //before remove (validate permissions)
   self.once('before.remove', DataPermissionEventListener.prototype.beforeRemove);
   //execute before update events
   self.emit('before.remove', e, err => {
       //if an error occurred
       self.removeListener('before.remove', DataPermissionEventListener.prototype.beforeRemove);
       self.removeListener('before.remove', DataReferencedObjectListener.prototype.beforeRemove);
       self.removeListener('before.remove', DataNestedObjectListener.prototype.beforeRemove);
       if (err) {
           //invoke callback with error
           return callback(err);
       }
       //get db context
       const db = self.context.db;
       //create delete query
       const q = QueryUtils.delete(self.sourceAdapter).where(self.primaryKey).equal(obj[self.primaryKey]);
       //execute delete query
       db.execute(q, null, err => {
           if (err) {
               return callback(err);
           }
           //remove base object
           removeBaseObject_.call(self, e.target, (err, result) => {
               if (err) {
                   return callback(err);
               }
               if (typeof result !== 'undefined' && result !== null) {
                   _.assign(e.target, result);
               }
               //execute after remove events
               self.emit('after.remove',e, err => {
                   //invoke callback
                   return callback(err, e.target);
               });
           });
       });
   });

}

/**
 * @this DataModel
 * @param {*} obj
 * @param {Function} callback
 * @private
 */
function removeBaseObject_(obj, callback) {
    //ensure callback
    callback = callback || (() => {});
    const self = this;
    const base = self.base();
    //if obj is an array of objects throw exception (invoke callback with error)
    if (_.isArray(obj)) {
        callback.call(self, new Error('Invalid argument. Object cannot be an array.'));
        return 0;
    }
    //if current model does not have a base model
    if (_.isNil(base)) {
        //exit operation
        callback.call(self, null);
    }
    else {
        base.silent();
        //perform operation
        removeSingleObject_.call(base, obj, (err, result) => {
            callback.call(self, err, result);
        });
    }
}

/**
 * Validates that the given string is plural or not.
 * @param s {string}
 * @returns {boolean}
 * @private
 */
DataModel.PluralExpression = /([a-zA-Z]+?)([e']s|[^aiou]s)$/;


/**
 * @this DataModel
 * @param conf
 * @param name
 * @returns {*}
 * @private
 */
function inferDefaultMapping(conf, name) {
    const self = this;
    const field = self.field(name);
    //get field model type
    const associatedModel = self.context.model(field.type);
    if ((typeof associatedModel === 'undefined') || (associatedModel === null))
    {
        if (typeof field.many === 'boolean' && field.many) {
            //validate primitive type mapping
            const tagMapping = inferTagMapping_.call(self, field);
            if (tagMapping) {
                //apply data association mapping to definition
                const definitionField = conf.fields.find(x => {
                    return x.name === field.name;
                });
                definitionField.mapping = field.mapping = tagMapping;
                return new DataAssociationMapping(definitionField.mapping);
            }
        }
        return null;
    }
    let associatedField;
    //in this case we have two possible associations. Junction or Foreign Key association
    //try to find a field that belongs to the associated model and holds the foreign key of this model.

    //get all associated model fields with type equal to this model
    const testFields = _.filter(associatedModel.attributes, x => {
       return x.type === self.name;
    });
    if (field.many === true) {
        //if associated model has only one field with type equal to this model
        if (testFields.length === 1) {
            //create a regular expression that is going to be used to test
            // if field name is equal to the pluralized string of associated model name
            // e.g. orders -> Order
            const reTestFieldName = new RegExp('^' + pluralize.plural(associatedModel.name)  + '$', 'ig');
            //create a regular expression to test
            // if the name of the associated field is equal to this model name
            // e.g. Person model has a field named user with type User
            const reTestName = new RegExp('^' + self.name + '$','ig');
            if (reTestName.test(testFields[0].name) && reTestFieldName.test(field.name)) {
                //then we have a default one-to-many association
                associatedField = testFields[0];
            }
        }
    }
    else {
        /*
        associatedField = associatedModel.attributes.find(function (x) {
            return x.type === self.name;
        });
        */
    }
    if (associatedField)
    {
        if (associatedField.many)
        {
            //return a data relation (parent model is the associated model)
            return new DataAssociationMapping({
                parentModel:associatedModel.name,
                parentField:associatedModel.primaryKey,
                childModel:self.name,
                childField:field.name,
                associationType:'association',
                cascade:'none'
            });
        }
        else
        {
            //return a data relation (parent model is the current model)
            return new DataAssociationMapping({
                parentModel:self.name,
                parentField:self.primaryKey,
                childModel:associatedModel.name,
                childField:associatedField.name,
                associationType:'association',
                cascade:'none',
                refersTo:field.property || field.name
            });
        }
    }
    else {
        const many = _.isBoolean(field.many) ? field.many : pluralize.isPlural(field.name);
        if (many) {
            //return a data junction
            return new DataAssociationMapping({
                associationAdapter: field.model.concat(_.upperFirst(field.name)),
                parentModel: self.name, parentField: self.primaryKey,
                childModel: associatedModel.name,
                childField: associatedModel.primaryKey,
                associationType: 'junction',
                cascade: 'none'
            });
        }
        else {
            return new DataAssociationMapping({
                parentModel: associatedModel.name,
                parentField: associatedModel.primaryKey,
                childModel: self.name,
                childField: field.name,
                associationType: 'association',
                cascade: 'none'
            });
        }
    }
}


/**
 * @this DataModel
 * @param {*} obj
 * @param {number} state
 * @param {Function} callback
 * @private
 */
function validate_(obj, state, callback) {
    /**
     * @type {DataModel|*}
     */
    const self = this;
    if (_.isNil(obj)) {
        return callback();
    }
    //get object copy (based on the defined state)
    const objCopy = castForValidation_.call (self, obj, state);

    const attributes = self.attributes.filter(x => {
        if (x.model!==self.name) {
            if (!x.cloned)
                return false;
        }
        return (!x.readonly) ||
            (x.readonly && (typeof x.calculation!=='undefined') && state===2) ||
            (x.readonly && (typeof x.value!=='undefined') && state===1) ||
            (x.readonly && (typeof x.calculation!=='undefined') && state===1);
    }).filter(y => {
        return (state===2) ? (y.hasOwnProperty('editable') ? y.editable : true) : true;
    });

    /**
     * @type {ModuleLoader|*}
     */
    const moduleLoader = this.context.getConfiguration().getStrategy(ModuleLoader);

    async.eachSeries(attributes, (attr, cb) => {
        let validationResult;
        //get value
        const value = objCopy[attr.name];
        //build validators array
        const arrValidators=[];
        //-- RequiredValidator
        if (attr.hasOwnProperty('nullable') && !attr.nullable)
        {
            if (state===1 && !attr.primary) {
                arrValidators.push(new RequiredValidator());
            }
            else if (state===2 && !attr.primary && objCopy.hasOwnProperty(attr.name)) {
                arrValidators.push(new RequiredValidator());
            }
        }
        //-- MaxLengthValidator
        if (attr.hasOwnProperty('size') && objCopy.hasOwnProperty(attr.name)) {
            if (!(attr.validation && attr.validation.maxLength))
                arrValidators.push(new MaxLengthValidator(attr.size));
        }
        //-- CustomValidator
        if (attr.validation && attr.validation['validator'] && objCopy.hasOwnProperty(attr.name)) {
            let validatorModule;
            try {
                validatorModule = moduleLoader.require(attr.validation['validator']);
            }
            catch (err) {
                TraceUtils.debug(sprintf('Data validator module (%s) cannot be loaded', attr.validation['validator']));
                TraceUtils.debug(err);
                return cb(err);
            }
            if (typeof validatorModule.createInstance !== 'function') {
                TraceUtils.debug(sprintf('Data validator module (%s) does not export createInstance() method.', attr.validation.type));
                return cb(new Error('Invalid data validator type.'));
            }
            arrValidators.push(validatorModule.createInstance(attr));
        }
        //-- DataTypeValidator #1
        if (attr.validation && objCopy.hasOwnProperty(attr.name)) {
            if (typeof attr.validation.type === 'string') {
                arrValidators.push(new DataTypeValidator(attr.validation.type));
            }
            else {
                //convert validation data to pseudo type declaration
                const validationProperties = {
                    properties:attr.validation
                };
                arrValidators.push(new DataTypeValidator(validationProperties));
            }
        }
        //-- DataTypeValidator #2
        if (attr.type && objCopy.hasOwnProperty(attr.name)) {
            arrValidators.push(new DataTypeValidator(attr.type));
        }

        if (arrValidators.length === 0) {
            return cb();
        }
        //do validation
        async.eachSeries(arrValidators, (validator, cb) => {

            try {
                //set context
                if (typeof validator.setContext === 'function') {
                    validator.setContext(self.context);
                }
                //set target
                validator.target = obj;
                if (typeof validator.validateSync === 'function') {
                    validationResult = validator.validateSync(value);
                    if (validationResult) {
                        return cb(new DataError(validationResult.code || 'EVALIDATE',validationResult.message, validationResult.innerMessage, self.name, attr.name));
                    }
                    else {
                        return cb();
                    }
                }
                else if (typeof validator.validate === 'function') {
                    return validator.validate(value, (err, validationResult) => {
                        if (err) {
                            return cb(err);
                        }
                        if (validationResult) {
                            return cb(new DataError(validationResult.code || 'EVALIDATE',validationResult.message, validationResult.innerMessage, self.name, attr.name));
                        }
                        return cb();
                    });
                }
                else {
                    TraceUtils.debug(sprintf('Data validator (%s) does not have either validate() or validateSync() methods.', attr.validation.type));
                    return cb(new Error('Invalid data validator type.'));
                }
            }
            catch(err) {
                return cb(err);
            }
        }, err => {
            return cb(err);
        });

    }, err => {
        return callback(err);
    });
}

export {DataModel};


