/**
 * @licence
 * MOST Web Framework
 * A JavaScript Web Framework
 * http://themost.io
 *
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com, Anthi Oikonomou anthioikonomou@gmail.com
 *
 * Released under the BSD-3-Clause license
 * Date: 2017-11-10
 */
///
import Symbol from 'symbol';

import {LangUtils} from '@themost/common/utils';
import {sprintf} from 'sprintf';
import Q from 'q';
import pluralize from 'pluralize';
import _ from 'lodash';
import moment from 'moment';
const parseBoolean = require('./types').parsers.parseBoolean;
import {DataModel} from './data-model';
import {DataContext} from './types';
import {XDocument} from '@themost/xml';
// noinspection JSUnusedLocalSymbols
const entityTypesProperty = Symbol('entityTypes');
// noinspection JSUnusedLocalSymbols
const entityContainerProperty = Symbol('entityContainer');
const ignoreEntityTypesProperty = Symbol('ignoredEntityTypes');
const builderProperty = Symbol('builder');
const entityTypeProperty = Symbol('entityType');
// noinspection JSUnusedLocalSymbols
const edmProperty = Symbol('edm');
const initializeProperty = Symbol('initialize');
import {DataConfigurationStrategy} from './data-configuration';
import {SchemaLoaderStrategy} from './data-configuration';
import {DefaultSchemaLoaderStrategy} from './data-configuration';
import {instanceOf} from './instance-of';

class Args {
    /**
     * Checks the expression and throws an exception if the condition is not met.
     * @param {*} expr
     * @param {string} message
     */
    static check(expr, message) {
        Args.notNull(expr,"Expression");
        if (typeof expr === 'function') {
            expr.call()
        }
        let res;
        if (typeof expr === 'function') {
            res = !(expr.call());
        }
        else {
            res = (!expr);
        }
        if (res) {
            const err = new Error(message);
            err.code = "ECHECK";
            throw err;
        }
    }

    /**
     *
     * @param {*} arg
     * @param {string} name
     */
    static notNull(arg, name) {
        if (typeof arg === 'undefined' || arg === null) {
            const err = new Error(name + " may not be null or undefined");
            err.code = "ENULL";
            throw err;
        }
    }

    /**
     * @param {*} arg
     * @param {string} name
     */
    static notString(arg, name) {
        if (typeof arg !== 'string') {
            const err = new Error(name + " must be a string");
            err.code = "EARG";
            throw err;
        }
    }

    /**
     * @param {*} arg
     * @param {string} name
     */
    static notFunction(arg, name) {
        if (typeof arg !== 'function') {
            const err = new Error(name + " must be a function");
            err.code = "EARG";
            throw err;
        }
    }

    /**
     * @param {*} arg
     * @param {string} name
     */
    static notNumber(arg, name) {
        if (typeof arg !== 'string') {
            const err = new Error(name + " must be number");
            err.code = "EARG";
            throw err;
        }
    }

    /**
     * @param {string|*} arg
     * @param {string} name
     */
    static notEmpty(arg, name) {
        Args.notNull(arg,name);
        Args.notString(arg,name);
        if (arg.length === 0) {
            const err = new Error(name + " may not be empty");
            err.code = "EEMPTY";
            return err;
        }
    }

    /**
     * @param {number|*} arg
     * @param {string} name
     */
    static notNegative(arg, name) {
        Args.notNumber(arg,name);
        if (arg<0) {
            const err = new Error(name + " may not be negative");
            err.code = "ENEG";
            return err;
        }
    }

    /**
     * @param {number|*} arg
     * @param {string} name
     */
    static positive(arg, name) {
        Args.notNumber(arg,name);
        if (arg<=0) {
            const err = new Error(name + " may not be negative or zero");
            err.code = "EPOS";
            return err;
        }
    }
}

/**
 * @enum
 */
class EdmType {
    /**
     * @static
     * @param {*} type
     * @returns {string}
     */
    static CollectionOf(type) {
        return "Collection(" + type + ")";
    }

    /**
     * @static
     * @param {*} type
     * @returns {string}
     */
    static IsCollection(type) {
        const match = /^Collection\((.*?)\)$/.exec(type);
        if (match && match[1].length) {
            return match[1];
        }
    }
}

EdmType.EdmBinary = "Edm.Binary";
EdmType.EdmBoolean="Edm.Boolean";
EdmType.EdmByte="Edm.Byte";
EdmType.EdmDate="Edm.Date";
EdmType.EdmDateTimeOffset="Edm.DateTimeOffset";
EdmType.EdmDouble="Edm.Double";
EdmType.EdmDecimal="Edm.Decimal";
EdmType.EdmDuration="Edm.Duration";
EdmType.EdmGuid="Edm.Guid";
EdmType.EdmInt16="Edm.Int16";
EdmType.EdmInt32="Edm.Int32";
EdmType.EdmInt64="Edm.Int64";
EdmType.EdmSByte="Edm.SByte";
EdmType.EdmSingle="Edm.Single";
EdmType.EdmStream="Edm.Stream";
EdmType.EdmString="Edm.String";
EdmType.EdmTimeOfDay="Edm.TimeOfDay";

/**
 * @enum
 */
class EdmMultiplicity {
    /**
     * @param {string} value
     * @returns {string|*}
     */
    static parse(value) {
        if (typeof value === 'string') {
            const re = new RegExp('^'+value+'$','ig');
            return _.find(_.keys(EdmMultiplicity), x => {
                if (typeof EdmMultiplicity[x] === 'string') {
                    return re.test(EdmMultiplicity[x]);
                }
            });
        }
    }
}

EdmMultiplicity.Many = "Many";
EdmMultiplicity.One = "One";
EdmMultiplicity.Unknown = "Unknown";
EdmMultiplicity.ZeroOrOne = "ZeroOrOne";

/**
 * @enum
 */
function EntitySetKind() {

}
EntitySetKind.EntitySet = "EntitySet";
EntitySetKind.Singleton = "Singleton";
EntitySetKind.FunctionImport = "FunctionImport";
EntitySetKind.ActionImport = "ActionImport";

// noinspection JSUnusedGlobalSymbols
/**
 * @class
 * @param {string} name
 * @constructor
 */
class ProcedureConfiguration {
    constructor(name) {
        this.name = name;
        this.parameters = [];
        // noinspection JSUnusedGlobalSymbols
        this.isBound = false;
        this.isComposable = false;
    }

    /**
     * @param type
     * @returns {ProcedureConfiguration}
     */
    returns(type) {
        // noinspection JSUnusedGlobalSymbols
        this.returnType = type;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param type
     * @returns {ProcedureConfiguration}
     */
    returnsCollection(type) {
        // noinspection JSUnusedGlobalSymbols
        this.returnCollectionType =  type;
        return this;
    }

    /**
     * @param {string} name
     * @param {string} type
     * @param {boolean=} nullable
     * @param {boolean=} fromBody
     */
    parameter(name, type, nullable, fromBody) {
        Args.notString(name, "Action parameter name");
        Args.notString(type, "Action parameter type");
        const findRe = new RegExp("^" + name + "$" ,"ig");
        const p = _.find(this.parameters, x => {
            return findRe.test(x.name);
        });
        if (p) {
            p.type = type;
        }
        else {
            this.parameters.push({
                "name":name,
                "type":type,
                "nullable": _.isBoolean(nullable) ? nullable : false,
                "fromBody": fromBody
            });
        }
        return this;
    }
}

/**
 * @class
 * @constructor
 * @param {string} name
 * @augments ProcedureConfiguration
 * @extends ProcedureConfiguration
 */
function ActionConfiguration(name) {
    ActionConfiguration.super_.bind(this)(name);
    // noinspection JSUnusedGlobalSymbols
    this.isBound = false;
}
LangUtils.inherits(ActionConfiguration, ProcedureConfiguration);

/**
 * @class
 * @constructor
 * @param {string} name
 * @augments ProcedureConfiguration
 */
function FunctionConfiguration(name) {
    FunctionConfiguration.super_.bind(this)(name);
    // noinspection JSUnusedGlobalSymbols
    this.isBound = false;
}
LangUtils.inherits(FunctionConfiguration, ProcedureConfiguration);

/**
 * @class
 * @constructor
 * @param {EntityTypeConfiguration} entityType
 */
class EntityCollectionConfiguration {
    constructor(entityType) {
        this.actions = [];
        this.functions = [];
        this[entityTypeProperty] = entityType;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates an action that bind to this entity collection
     * @param {string} name
     * @returns ActionConfiguration
     */
    addAction(name) {
        /**
         * @type {ActionConfiguration|*}
         */
        let a = this.hasAction(name);
        if (a) {
            return a;
        }
        a = new ActionConfiguration(name);
        //add current entity as parameter
        a.parameter("bindingParameter", "Collection(" + this[entityTypeProperty].name + ")",true);
        a.isBound = true;
        this.actions.push(a);
        return a;
    }

    /**
     * Checks if entity collection has an action with the given name
     * @param {string} name
     * @returns {ActionConfiguration|*}
     */
    hasAction(name) {
        if (_.isEmpty(name)) {
            return;
        }
        const findRe = new RegExp("^" + name + "$" ,"ig");
        return _.find(this.actions, x => {
            return findRe.test(x.name);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates an action that bind to this entity collection
     * @param {string} name
     * @returns ActionConfiguration
     */
    addFunction(name) {
        let a = this.hasFunction(name);
        if (a) {
            return a;
        }
        a = new FunctionConfiguration(name);
        a.isBound = true;
        a.parameter("bindingParameter", "Collection(" + this[entityTypeProperty].name + ")",true);
        //add current entity as parameter
        this.functions.push(a);
        return a;
    }

    /**
     * Checks if entity collection has a function with the given name
     * @param {string} name
     * @returns {ActionConfiguration|*}
     */
    hasFunction(name) {
        if (_.isEmpty(name)) {
            return;
        }
        const findRe = new RegExp("^" + name + "$" ,"ig");
        return _.find(this.functions, x => {
            return findRe.test(x.name);
        });
    }
}


function getOwnPropertyNames(obj) {
    if (typeof obj === 'undefined' || obj === null) {
        return [];
    }
    let ownPropertyNames = [];
    //get object methods
    let proto = obj;
    while(proto) {
        ownPropertyNames = ownPropertyNames.concat(Object.getOwnPropertyNames(proto).filter( x => {
            return ownPropertyNames.indexOf(x)<0;
        }));
        proto = Object.getPrototypeOf(proto);
    }
    if (typeof obj === 'function') {
        //remove caller
        let index = ownPropertyNames.indexOf("caller");
        if (index>=0) {
            ownPropertyNames.splice(index,1);
        }
        index = ownPropertyNames.indexOf("arguments");
        if (index>=0) {
            ownPropertyNames.splice(index,1);
        }
    }
    return ownPropertyNames;
}


/**
 * @class
 * @param {ODataModelBuilder} builder
 * @param {string} name
 * @constructor
 * @property {string} name - Gets the name of this entity type
 */
class EntityTypeConfiguration {
    constructor(builder, name) {

        Args.notString(name, 'Entity type name');
        Object.defineProperty(this, 'name', {
            get:function() {
                return name;
            }
        });
        this[builderProperty] = builder;
        this.property = [];
        this.ignoredProperty = [];
        this.navigationProperty = [];
        this.actions = [];
        this.functions = [];
        this.collection = new EntityCollectionConfiguration(this);

    }

    /**
     * @returns {ODataModelBuilder}
     */
    getBuilder() {
        return this[builderProperty];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @returns EntityTypeConfiguration
     */
    derivesFrom(name) {
        Args.notString(name,"Enity type name");
        this.baseType = name;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates an action that bind to this entity type
     * @param {string} name
     * @returns ActionConfiguration
     */
    addAction(name) {
        /**
         * @type {ActionConfiguration|*}
         */
        let a = this.hasAction(name);
        if (a) {
            return a;
        }
        a = new ActionConfiguration(name);
        //add current entity as parameter
        a.parameter("bindingParameter", this.name);
        a.isBound = true;
        this.actions.push(a);
        return a;
    }

    /**
     * Checks if entity type has an action with the given name
     * @param {string} name
     * @returns {ActionConfiguration|*}
     */
    hasAction(name) {
        if (_.isEmpty(name)) {
            return;
        }
        const findRe = new RegExp("^" + name + "$" ,"ig");
        return _.find(this.actions, x => {
            return findRe.test(x.name);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates an action that bind to this entity type
     * @param {string} name
     * @returns ActionConfiguration
     */
    addFunction(name) {
        let a = this.hasFunction(name);
        if (a) {
            return a;
        }
        a = new FunctionConfiguration(name);
        a.isBound = true;
        a.parameter("bindingParameter", this.name);
        //add current entity as parameter
        this.functions.push(a);
        return a;
    }

    /**
     * Checks if entity type has a function with the given name
     * @param {string} name
     * @returns {ActionConfiguration|*}
     */
    hasFunction(name) {
        if (_.isEmpty(name)) {
            return;
        }
        const findRe = new RegExp("^" + name + "$" ,"ig");
        return _.find(this.functions, x => {
            return findRe.test(x.name);
        });
    }

    /**
     * Adds a new EDM primitive property to this entity type.
     * @param {string} name
     * @param {string} type
     * @param {boolean=} nullable,
     * @returns EntityTypeConfiguration
     */
    addProperty(name, type, nullable) {
        Args.notString(name,"Property name");
        const exists =_.findIndex(this.property, x => {
            return x.name === name;
        });
        if (exists<0) {
            const p = {
                "name":name,
                "type":type,
                "nullable":_.isBoolean(nullable) ? nullable : true
            };
            this.property.push(p);
        }
        else {
            _.assign(this.property[exists], {
                "type":type,
                "nullable":_.isBoolean(nullable) ? nullable : true
            });
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Adds a new EDM navigation property to this entity type.
     * @param {string} name
     * @param {string} type
     * @param {string} multiplicity
     * @returns EntityTypeConfiguration
     */
    addNavigationProperty(name, type, multiplicity) {
        Args.notString(name,"Property name");
        const exists =_.findIndex(this.navigationProperty, x => {
            return x.name === name;
        });

        const p = {
            "name":name,
            "type": (multiplicity==="Many") ? sprintf("Collection(%s)", type) : type
        };
        if ((multiplicity===EdmMultiplicity.ZeroOrOne) || (multiplicity===EdmMultiplicity.Many)) {
            p.nullable = true;
        }

        if (exists<0) {
            this.navigationProperty.push(p);
        }
        else {
            _.assign(this.navigationProperty[exists], p);
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Removes the navigation property from the entity.
     * @param {string} name
     * @returns {EntityTypeConfiguration}
     */
    removeNavigationProperty(name) {
        Args.notString(name,"Property name");
        const hasProperty =_.findIndex(this.property, x => {
            return x.name === name;
        });
        if (hasProperty>=0) {
            this.property.splice(hasProperty, 1);
        }
        return this;
    }

    /**
     * Ignores a property from the entity
     * @param name
     * @returns {EntityTypeConfiguration}
     */
    ignore(name) {
        Args.notString(name,"Property name");
        const hasProperty =_.findIndex(this.ignoredProperty, x => {
            return x.name === name;
        });
        if (hasProperty>=0) {
            return this;
        }
        this.ignoredProperty.push(name);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Removes the property from the entity.
     * @param {string} name
     * @returns {EntityTypeConfiguration}
     */
    removeProperty(name) {
        Args.notString(name,"Property name");
        const hasProperty =_.findIndex(this.property, x => {
            return x.name === name;
        });
        if (hasProperty>=0) {
            this.property.splice(hasProperty, 1);
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Removes the property from the entity keys collection.
     * @param {string} name
     * @returns {EntityTypeConfiguration}
     */
    removeKey(name) {
        Args.notString(name,"Key name");
        if (this.key && _.isArray(this.key.propertyRef)) {
            const hasKeyIndex = _.findIndex(this.key.propertyRef, x => {
                return x.name === name;
            });
            if (hasKeyIndex<0) {
                return this;
            }
            this.key.propertyRef.splice(hasKeyIndex, 1);
            return this;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Configures the key property(s) for this entity type.
     * @param {string} name
     * @param {string} type
     * @returns {EntityTypeConfiguration}
     */
    hasKey(name, type) {
        this.addProperty(name, type, false);
        this.key = {
            propertyRef: [
                {
                    "name": name
                }
            ]
        };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} context
     * @param {*} any
     */
    mapInstance(context, any) {
        if (any == null) {
            return;
        }
        if (context) {
            const contextLink = this.getBuilder().getContextLink(context);
            if (contextLink) {
                return _.assign({
                    "@odata.context":contextLink + '#' + this.name
                }, any);
            }
        }
        return any;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} context
     * @param {string} property
     * @param {*} any
     */
    mapInstanceProperty(context, property, any) {
        const builder = this.getBuilder();
        if (context && typeof builder.getContextLink === 'function') {
            let contextLink = builder.getContextLink(context);
            if (contextLink) {
                if (context.request && context.request.url) {
                    contextLink += '#';
                    contextLink += context.request.url.replace(builder.serviceRoot, '');
                }
                return {
                    "@odata.context":contextLink,
                    "value": any
                };
            }
        }
        return {
            "value": any
        };
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {*} context
     * @param {*} any
     * @returns {*}
     */
    mapInstanceSet(context, any) {
        const result = {};
        if (context) {
            const contextLink = this.getBuilder().getContextLink(context);
            if (contextLink) {
                result["@odata.context"] = contextLink + '#' + this.name;
            }
        }
        //search for total property for backward compatibility issues
        if (any.hasOwnProperty("total") && /^\+?\d+$/.test(any["total"])) {
            result["@odata.count"] = parseInt(any["total"]);
        }
        if (any.hasOwnProperty("count") && /^\+?\d+$/.test(any["count"])) {
            result["@odata.count"] = parseInt(any["count"]);
        }
        result["value"] = [];
        if (_.isArray(any)) {
            result["value"] = any;
        }
        //search for records property for backward compatibility issues
        else if (_.isArray(any.records)) {
            result["value"] = any.records;
        }
        else if (_.isArray(any.value)) {
            result["value"] = any.value;
        }
        return result;
    }
}

/**
 * @class
 * @param {ODataModelBuilder} builder
 * @param {string} entityType
 * @param {string} name
 */
class EntitySetConfiguration {
    constructor(builder, entityType, name) {
        Args.check(builder instanceof ODataModelBuilder, new TypeError('Invalid argument. Configuration builder must be an instance of ODataModelBuilder class'));
        Args.notString(entityType, 'Entity Type');
        Args.notString(name, 'EntitySet Name');
        this[builderProperty] = builder;
        this[entityTypeProperty] = entityType;
        //ensure entity type
        if (!this[builderProperty].hasEntity(this[entityTypeProperty])) {
            this[builderProperty].addEntity(this[entityTypeProperty]);
        }
        this.name = name;
        this.kind = EntitySetKind.EntitySet;
        //use the given name as entity set URL by default
        this.url = name;

        Object.defineProperty(this,'entityType', {
            get: function() {
                if (!this[builderProperty].hasEntity(this[entityTypeProperty])) {
                    return this[builderProperty].addEntity(this[entityTypeProperty]);
                }
                return this[builderProperty].getEntity(this[entityTypeProperty]);
            }
        });

        this.hasContextLink(
            /**
             * @this EntitySetConfiguration
             * @param context
             * @returns {string|*}
             */
            function(context) {
            const thisBuilder = this.getBuilder();
            if (_.isNil(thisBuilder)) {
                return;
            }
            if (typeof thisBuilder.getContextLink !== 'function') {
                return;
            }
            //get builder context link
            const builderContextLink = thisBuilder.getContextLink(context);
            if (builderContextLink) {
                //add hash for entity set
                return builderContextLink + "#" + this.name;
            }
        });

    }

    // noinspection JSUnusedGlobalSymbols
    hasUrl(url) {
            Args.notString(url, 'Entity Resource Path');
            this.url = url;
        }

    // noinspection JSUnusedGlobalSymbols
    getUrl() {
            return this.url;
        }

    /**
     * @returns {ODataModelBuilder}
     */
    getBuilder() {
        return this[builderProperty];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {*}
     */
    getEntityTypePropertyList() {
        const result = {};
        _.forEach(this.entityType.property, x => {
            result[x.name] = x;
        });
        let baseEntityType = this.getBuilder().getEntity(this.entityType.baseType);
        while (baseEntityType) {
            _.forEach(baseEntityType.property, x => {
                result[x.name] = x;
            });
            baseEntityType = this.getBuilder().getEntity(baseEntityType.baseType);
        }
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @param  {boolean=} deep
     * @returns {*}
     */
    getEntityTypeProperty(name, deep) {
        const re = new RegExp("^" + name + "$","ig");
        let p = _.find(this.entityType.property, x => {
            return re.test(x.name);
        });
        if (p) {
            return p;
        }
        const deep_ = _.isBoolean(deep) ? deep : true;
        if (deep_) {
            let baseEntityType = this.getBuilder().getEntity(this.entityType.baseType);
            while (baseEntityType) {
                p = _.find(baseEntityType.property, x => {
                    return re.test(x.name);
                });
                if (p) {
                    return p;
                }
                baseEntityType = this.getBuilder().getEntity(baseEntityType.baseType);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {*}
     */
    getEntityTypeIgnoredPropertyList() {
        const result = [].concat(this.entityType.ignoredProperty);
        let baseEntityType = this.getBuilder().getEntity(this.entityType.baseType);
        while (baseEntityType) {
            result.push.apply(result, baseEntityType.ignoredProperty);
            baseEntityType = this.getBuilder().getEntity(baseEntityType.baseType);
        }
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @param  {boolean=} deep
     * @returns {*}
     */
    getEntityTypeNavigationProperty(name, deep) {
        const re = new RegExp("^" + name + "$","ig");
        let p = _.find(this.entityType.navigationProperty, x => {
            return re.test(x.name);
        });
        if (p) {
            return p;
        }
        const deep_ = _.isBoolean(deep) ? deep : true;
        if (deep_) {
            let baseEntityType = this.getBuilder().getEntity(this.entityType.baseType);
            while (baseEntityType) {
                p = _.find(baseEntityType.navigationProperty, x => {
                    return re.test(x.name);
                });
                if (p) {
                    return p;
                }
                baseEntityType = this.getBuilder().getEntity(baseEntityType.baseType);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {*}
     */
    getEntityTypeNavigationPropertyList() {
        const result = [];
        _.forEach(this.entityType.navigationProperty, x => {
            result[x.name] = x;
        });
        let baseEntityType = this.getBuilder().getEntity(this.entityType.baseType);
        while (baseEntityType) {
            _.forEach(baseEntityType.navigationProperty, x => {
                result[x.name] = x;
            });
            baseEntityType = this.getBuilder().getEntity(baseEntityType.baseType);
        }
        return result;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param contextLinkFunc
     */
    hasContextLink(contextLinkFunc) {
// noinspection JSUnusedGlobalSymbols
        this.getContextLink = contextLinkFunc;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {Function} idLinkFunc
     */
    hasIdLink(idLinkFunc) {
// noinspection JSUnusedGlobalSymbols
        this.getIdLink = idLinkFunc;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {Function} readLinkFunc
     */
    hasReadLink(readLinkFunc) {
// noinspection JSUnusedGlobalSymbols
        this.getReadLink = readLinkFunc;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {Function} editLinkFunc
     */
    hasEditLink(editLinkFunc) {
// noinspection JSUnusedGlobalSymbols
        this.getEditLink = editLinkFunc;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} context
     * @param {*} any
     */
    mapInstance(context, any) {
        if (any == null) {
            return;
        }
        if (context) {
            const contextLink = this.getContextLink(context);
            if (contextLink) {
                return _.assign({
                    "@odata.context":contextLink + '/$entity'
                }, any);
            }
        }
        return any;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} context
     * @param {string} property
     * @param {*} any
     */
    mapInstanceProperty(context, property, any) {
        const builder = this.getBuilder();
        if (context && typeof builder.getContextLink === 'function') {
            let contextLink = builder.getContextLink(context);
            if (contextLink) {
                if (context.request && context.request.url) {
                    contextLink += '#';
                    contextLink += context.request.url.replace(builder.serviceRoot, '');
                }
                return {
                    "@odata.context":contextLink,
                    "value": any
                };
            }
        }
        return {
            "value": any
        };
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {*} context
     * @param {*} any
     * @returns {*}
     */
    mapInstanceSet(context, any) {
        const result = {};
        if (context) {
            const contextLink = this.getContextLink(context);
            if (contextLink) {
                result["@odata.context"] = contextLink;
            }
        }
        //search for total property for backward compatibility issues
        if (any.hasOwnProperty("total") && /^\+?\d+$/.test(any["total"])) {
            result["@odata.count"] = parseInt(any["total"]);
        }
        else if (any.hasOwnProperty("count") && /^\+?\d+$/.test(any["count"])) {
            result["@odata.count"] = parseInt(any["count"]);
        }
        if (any.hasOwnProperty("skip") && /^\+?\d+$/.test(any["skip"])) {
            result["@odata.skip"] = parseInt(any["skip"]);
        }
        result["value"] = [];
        if (_.isArray(any)) {
            result["value"] = any;
        }
        //search for records property for backward compatibility issues
        else if (_.isArray(any.records)) {
            result["value"] = any.records;
        }
        else if (_.isArray(any.value)) {
            result["value"] = any.value;
        }
        return result;
    }
}


/**
 * @class
 * @param {*} builder
 * @param {string} entityType
 * @param {string} name
 * @constructor
 * @augments EntitySetConfiguration
 * @extends EntitySetConfiguration
 */
function SingletonConfiguration(builder, entityType, name) {
    SingletonConfiguration.super_.bind(this)(builder, entityType, name);
    this.kind = EntitySetKind.Singleton;
}
LangUtils.inherits(SingletonConfiguration, EntitySetConfiguration);

/**
 * Converts schema configuration to an edm document
 * @private
 * @this ODataModelBuilder
 * @param {SchemaConfiguration} schema
 * @returns {XDocument}
 */
function schemaToEdmDocument(schema) {
    const doc = new XDocument();
    const rootElement = doc.createElement("edmx:Edmx");
    rootElement.setAttribute("xmlns:edmx", "http://docs.oasis-open.org/odata/ns/edmx");
    rootElement.setAttribute("Version","4.0");
    doc.appendChild(rootElement);
    const dataServicesElement = doc.createElement("edmx:DataServices");
    const schemaElement = doc.createElement("Schema");
    schemaElement.setAttribute("xmlns", "http://docs.oasis-open.org/odata/ns/edm");
    if (schema.namespace) {
        schemaElement.setAttribute("Namespace", schema.namespace);
    }
    const actionElements = [];
    const functionElements = [];
    //append edmx:DataServices > Schema
    dataServicesElement.appendChild(schemaElement);
    _.forEach(schema.entityType,
        /**
         *
         * @param {EntityTypeConfiguration} entityType
         */
        entityType => {

            //search for bound actions
            _.forEach(entityType.actions.concat(entityType.collection.actions), action => {
                const actionElement = doc.createElement("Action");
                actionElement.setAttribute("Name", action.name);
                actionElement.setAttribute("IsBound", true);
                if (action.isComposable) {
                    actionElement.setAttribute("IsComposable", action.isComposable);
                }
                _.forEach(action.parameters, parameter => {
                    const paramElement =  doc.createElement("Parameter");
                    paramElement.setAttribute("Name", parameter.name);
                    paramElement.setAttribute("Type", parameter.type);
                    const nullable = _.isBoolean(parameter.nullable) ? parameter.nullable : false;
                    if (!nullable) {
                        paramElement.setAttribute("Nullable", nullable);
                    }
                    //append Action > Parameter
                    actionElement.appendChild(paramElement)
                });
                if (action.returnType || action.returnCollectionType) {
                    const returnTypeElement =  doc.createElement("ReturnType");
                    let returnType = action.returnType;
                    if (action.returnCollectionType) {
                        returnType = action.returnCollectionType;
                        returnTypeElement.setAttribute("Type", sprintf("Collection(%s)", returnType));
                    }
                    else {
                        returnTypeElement.setAttribute("Type", returnType);
                    }
                    returnTypeElement.setAttribute("Nullable", true);
                    actionElement.appendChild(returnTypeElement);
                }
                actionElements.push(actionElement);
            });

            //search for bound functions
            _.forEach(entityType.functions.concat(entityType.collection.functions), func => {
                const functionElement = doc.createElement("Function");
                functionElement.setAttribute("Name", func.name);
                functionElement.setAttribute("IsBound", true);
                if (func.isComposable) {
                    functionElement.setAttribute("IsComposable", func.isComposable);
                }
                _.forEach(func.parameters, parameter => {
                    const paramElement =  doc.createElement("Parameter");
                    paramElement.setAttribute("Name", parameter.name);
                    paramElement.setAttribute("Type", parameter.type);
                    const nullable = _.isBoolean(parameter.nullable) ? parameter.nullable : false;
                    if (!nullable) {
                        paramElement.setAttribute("Nullable", nullable);
                    }
                    //append Function > Parameter
                    functionElement.appendChild(paramElement)
                });
                if (func.returnType || func.returnCollectionType) {
                    const returnTypeElement =  doc.createElement("ReturnType");
                    let returnType = func.returnType;
                    if (func.returnCollectionType) {
                        returnType = func.returnCollectionType;
                        returnTypeElement.setAttribute("Type", sprintf("Collection(%s)", returnType));
                    }
                    else {
                        returnTypeElement.setAttribute("Type", returnType);
                    }
                    returnTypeElement.setAttribute("Nullable", true);
                    functionElement.appendChild(returnTypeElement);
                }
                functionElements.push(functionElement);
            });

            //create element Schema > EntityType
            const entityTypeElement = doc.createElement("EntityType");
            entityTypeElement.setAttribute("Name", entityType.name);
            entityTypeElement.setAttribute("OpenType", true);
            if (entityType.baseType) {
                entityTypeElement.setAttribute("BaseType", entityType.baseType);
            }

            if (entityType.key && entityType.key.propertyRef) {
                const keyElement = doc.createElement('Key');
                _.forEach(entityType.key.propertyRef, key => {
                    const keyRefElement = doc.createElement('PropertyRef');
                    keyRefElement.setAttribute("Name",key.name);
                    keyElement.appendChild(keyRefElement);
                });
                entityTypeElement.appendChild(keyElement);
            }
            //enumerate properties
            _.forEach(entityType.property, x => {
                const propertyElement = doc.createElement('Property');
                propertyElement.setAttribute("Name",x.name);
                propertyElement.setAttribute("Type",x.type);
                if (_.isBoolean(x.nullable) && (x.nullable===false)) {
                    propertyElement.setAttribute("Nullable",false);
                }
                // add annotations
                if (x.immutable) {
                    const immutableAnnotation = doc.createElement('Annonation');
                    immutableAnnotation.setAttribute('Term', 'Org.OData.Core.V1.Immutable');
                    immutableAnnotation.setAttribute('Tag', 'true');
                    propertyElement.appendChild(immutableAnnotation);
                }
                if (x.computed) {
                    const computedAnnotation = doc.createElement('Annonation');
                    computedAnnotation.setAttribute('Term', 'Org.OData.Core.V1.Computed');
                    computedAnnotation.setAttribute('Tag', 'true');
                    propertyElement.appendChild(computedAnnotation);
                }
                entityTypeElement.appendChild(propertyElement);
            });
            //enumerate navigation properties
            _.forEach(entityType.navigationProperty, x => {
                const propertyElement = doc.createElement('NavigationProperty');
                propertyElement.setAttribute("Name",x.name);
                propertyElement.setAttribute("Type",x.type);
                if (!x.nullable) {
                    propertyElement.setAttribute("Nullable",false);
                }
                entityTypeElement.appendChild(propertyElement);
            });
            //append Schema > EntityType
            schemaElement.appendChild(entityTypeElement);
        });

    //append action elements to schema
    _.forEach(actionElements, actionElement => {
        schemaElement.appendChild(actionElement);
    });
    //append function elements to schema
    _.forEach(functionElements, functionElement => {
        schemaElement.appendChild(functionElement);
    });



    //create Schema > EntityContainer
    const entityContainerElement = doc.createElement("EntityContainer");
    entityContainerElement.setAttribute("Name", schema.entityContainer.name || "DefaultContainer");

    _.forEach(schema.entityContainer.entitySet,
        /**
         * @param {EntitySetConfiguration} child
         */
        child => {
            const childElement = doc.createElement(child.kind);
            childElement.setAttribute("Name", child.name);
            if ((child.kind === EntitySetKind.EntitySet) || (child.kind === EntitySetKind.Singleton)) {
                childElement.setAttribute("EntityType", child.entityType.name);
            }
            const childAnnotation = doc.createElement("Annotation");
            childAnnotation.setAttribute("Term", "Org.OData.Core.V1.ResourcePath");
            childAnnotation.setAttribute("String", child.getUrl());
            childElement.appendChild(childAnnotation);
            //append Schema > EntityContainer > (EntitySet, Singleton, FunctionImport)
            entityContainerElement.appendChild(childElement);
        });

    //append Schema > EntityContainer
    schemaElement.appendChild(entityContainerElement);

    //append edmx:Edmx > edmx:DataServices
    rootElement.appendChild(dataServicesElement);
    return doc;
}


/**
 * @classdesc Represents the OData model builder of an HTTP application
 * @property {string} serviceRoot - Gets or sets the service root URI
 * @param {ConfigurationBase} configuration
 * @class
 */
class ODataModelBuilder {
    constructor(configuration) {

        this[entityTypesProperty] = {};
        this[ignoreEntityTypesProperty] = [];
        this[entityContainerProperty] = [];
        /**
         * @returns {ConfigurationBase}
         */
        this.getConfiguration = () => {
            return configuration;
        };
        let serviceRoot_;
        const self = this;
        Object.defineProperty(this,'serviceRoot', {
          get:function() {
              return serviceRoot_;
          },
            set: function(value) {
                serviceRoot_ = value;
                if (typeof self.getContextLink === 'undefined') {
                    //set context link builder function
                    self.hasContextLink(context => {
                        const req = context.request;
                        const p = /\/$/g.test(serviceRoot_) ? serviceRoot_ + "$metadata" : serviceRoot_ + "/" + "$metadata";
                        if (req) {
                            return (req.protocol||"http") + "://" + req.headers.host + p;
                        }
                        return p;
                    });
                }
            }
        })
    }

    /**
     * Gets a registered entity type
     * @param {string} name
     * @returns {EntityTypeConfiguration|*}
     */
    getEntity(name) {
        if (_.isNil(name)) {
            return;
        }
        Args.notString(name, 'Entity type name');
        return this[entityTypesProperty][name];
    }

    /**
     * Registers an entity type
     * @param {string} name
     * @returns {EntityTypeConfiguration}
     */
    addEntity(name) {
        if (!this.hasEntity(name)) {
            this[entityTypesProperty][name] = new EntityTypeConfiguration(this, name);
        }
        return this.getEntity(name)
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} entityType
     * @param {string} name
     * @returns SingletonConfiguration|*
     */
    addSingleton(entityType, name) {
        if (!this.hasSingleton(name)) {
            this[entityContainerProperty].push(new SingletonConfiguration(this, entityType, name));
        }
        return this.getSingleton(name);
    }

    /**
     * Gets an entity set
     * @param name
     * @returns {SingletonConfiguration}
     */
    getSingleton(name) {
        Args.notString(name, 'Singleton Name');
        const re = new RegExp("^" + name + "$","ig");
        return _.find(this[entityContainerProperty], x => {
            return re.test(x.name) && x.kind === EntitySetKind.Singleton;
        });
    }

    /**
     * @param {string} name
     * @returns {SingletonConfiguration|*}
     */
    hasSingleton(name) {
        const findRe = new RegExp("^" + name + "$" ,"ig");
        return _.findIndex(this[entityContainerProperty], x => {
            return findRe.test(x.name) && x.kind === EntitySetKind.Singleton;
        })>=0;
    }

    /**
     * Checks if the given entity set exists in entity container
     * @param {string} name
     * @returns {boolean}
     */
    hasEntitySet(name) {
        const findRe = new RegExp("^" + name + "$" ,"ig");
        return _.findIndex(this[entityContainerProperty], x => {
            return findRe.test(x.name) && x.kind === EntitySetKind.EntitySet;
        })>=0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Registers an entity type
     * @param {string} entityType
     * @param {string} name
     * @returns {EntitySetConfiguration}
     */
    addEntitySet(entityType, name) {
        if (!this.hasEntitySet(name)) {
            this[entityContainerProperty].push(new EntitySetConfiguration(this, entityType, name));
        }
        return this.getEntitySet(name);
    }

    /**
     * Registers an entity type
     * @param {string} name
     * @returns {boolean}
     */
    removeEntitySet(name) {
        const findRe = new RegExp("^" + name + "$" ,"ig");
        const index = _.findIndex(this[entityContainerProperty], x => {
            return findRe.test(x.name) && x.kind === EntitySetKind.EntitySet;
        });
        if (index>=0) {
            this[entityContainerProperty].splice(index,1);
            return true;
        }
        return false;
    }

    /**
     * Gets an entity set
     * @param name
     * @returns {EntitySetConfiguration}
     */
    getEntitySet(name) {
        Args.notString(name, 'EntitySet Name');
        const re = new RegExp("^" + name + "$","ig");
        return _.find(this[entityContainerProperty], x => {
            return re.test(x.name) && x.kind === EntitySetKind.EntitySet;
        });
    }

    /**
     * Gets an entity set based on the given entity name
     * @param {string} entityName
     * @returns {EntitySetConfiguration}
     */
    getEntityTypeEntitySet(entityName) {
        Args.notString(entityName, 'Entity Name');
        const re = new RegExp("^" + entityName + "$","ig");
        return _.find(this[entityContainerProperty], x => {
            return x.entityType && re.test(x.entityType.name);
        });
    }

    /**
     * Ignores the entity type with the given name
     * @param {string} name
     * @returns {ODataModelBuilder}
     */
    ignore(name) {
        const hasEntity = this[ignoreEntityTypesProperty].indexOf(name);
        if (hasEntity < 0) {
            this[ignoreEntityTypesProperty].push(name);
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Checks if the given entity type exists in entity's collection
     * @param {string} name
     * @returns {boolean}
     */
    hasEntity(name) {
        return this[entityTypesProperty].hasOwnProperty(name);
    }

    /**
     * Creates and returns a structure based on the configuration performed using this builder
     * @returns {Promise}
     */
    getEdm() {
        const self = this;
        return Q.promise((resolve, reject) => {
            try{
                const schema = {
                    entityType:[],
                    entityContainer: {
                        "name":"DefaultContainer",
                        "entitySet":[]
                    }
                };
                //get entity types by excluding ignored entities
                const keys = _.filter(_.keys(self[entityTypesProperty]), x => {
                    return self[ignoreEntityTypesProperty].indexOf(x)<0;
                });
                //enumerate entity types
                _.forEach(keys, key => {
                    schema.entityType.push(self[entityTypesProperty][key]);
                });
                //apply entity sets
                schema.entityContainer.entitySet.push.apply(schema.entityContainer.entitySet, self[entityContainerProperty]);

                return resolve(schema);
            }
            catch(err) {
                return reject(err);
            }
        });
    }

    /**
     * Returns entity based on the configuration performed using this builder in
     * @returns {SchemaConfiguration}
     */
    getEdmSync() {
        const self = this;
        /**
         * @type {SchemaConfiguration}
         */
        const schema = {
            entityType:[],
            entityContainer: {
                "name":"DefaultContainer",
                "entitySet":[]
            }
        };
        //get entity types by excluding ignored entities
        const keys = _.filter(_.keys(self[entityTypesProperty]), x => {
            return self[ignoreEntityTypesProperty].indexOf(x)<0;
        });
        //enumerate entity types
        _.forEach(keys, key => {
            schema.entityType.push(self[entityTypesProperty][key]);
        });
        //apply entity sets
        schema.entityContainer.entitySet.push.apply(schema.entityContainer.entitySet, self[entityContainerProperty]);
        return schema;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {boolean=} all
     * @returns {ODataModelBuilder}
     */
    clean(all) {
        delete this[edmProperty];
        if (typeof all === 'boolean' && all === true) {
            this[entityTypesProperty] = {};
            this[ignoreEntityTypesProperty] = [];
            this[entityContainerProperty] = [];
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates and returns an XML structure based on the configuration performed using this builder
     * @returns {Promise<XDocument>}
     */
    getEdmDocument() {
        const self = this;
        return Q.promise((resolve, reject) => {
            try{
                return self.getEdm().then(schema => {
                    const doc = schemaToEdmDocument.bind(self)(schema);
                    return resolve(doc);
                }).catch(err => {
                    return reject(err);
                });
            }
            catch(err) {
                return reject(err);
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns an XML structure based on the configuration performed using this builder
     * @returns {XDocument}
     */
    getEdmDocumentSync() {

        /**
         * get schema configuration
         * @type {SchemaConfiguration}
         */
        const schema = this.getEdmSync();
        // convert schema to edm document
        return schemaToEdmDocument.bind(this)(schema);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {Function} contextLinkFunc
     */
    hasContextLink(contextLinkFunc) {
        this.getContextLink = contextLinkFunc;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param jsonFormatterFunc
     */
    hasJsonFormatter(jsonFormatterFunc) {
            this.jsonFormatter = jsonFormatterFunc;
        }

    /**
     * @param {EntitySetConfiguration} entitySet
     * @param {*} context
     * @param {*} instance
     * @param {*=} options
     * @returns *
     */
    jsonFormatter(context, entitySet, instance, options) {
        const self = this;
        const defaults = _.assign({
            addContextAttribute:true,
            addCountAttribute:false
        }, options);
        const entityProperty = entitySet.getEntityTypePropertyList();
        const entityNavigationProperty = entitySet.getEntityTypeNavigationPropertyList();
        const ignoredProperty = entitySet.getEntityTypeIgnoredPropertyList();
        const singleJsonFormatter = instance => {
            const result = {};
            _.forEach(_.keys(instance), key => {
                if (ignoredProperty.indexOf(key)<0) {
                    if (entityProperty.hasOwnProperty(key)) {
                        const p = entityProperty[key];
                        if (p.type === EdmType.EdmBoolean) {
                            result[key] = parseBoolean(instance[key]);
                        }
                        else if (p.type === EdmType.EdmDate) {
                            if (!_.isNil(instance[key])) {
                                result[key] = moment(instance[key]).format('YYYY-MM-DD');
                            }
                        }
                        else if (p.type === EdmType.EdmDateTimeOffset) {
                            if (!_.isNil(instance[key])) {
                                result[key] = moment(instance[key]).format('YYYY-MM-DDTHH:mm:ssZ');
                            }
                        }
                        else {
                            result[key] = instance[key];
                        }
                    }
                    else if (entityNavigationProperty.hasOwnProperty(key)) {
                        if (_.isObject(instance[key])) {
                            const match = /^Collection\((.*?)\)$/.exec(entityNavigationProperty[key].type);
                            const entityType = match ? match[1] : entityNavigationProperty[key].type;
                            const entitySet = self.getEntityTypeEntitySet(/\.?(\w+)$/.exec(entityType)[1]);
                            result[key] = self.jsonFormatter(context, entitySet, instance[key], {
                                addContextAttribute:false
                            });
                        }
                    }
                    else {
                        result[key] = instance[key];
                    }
                }
            });
            return result;
        };
        let value;
        const result = {};
        if (defaults.addContextAttribute) {
            _.assign(result, {
                "@odata.context":self.getContextLink(context).concat("$metadata#", entitySet.name)
            });
        }
        if (_.isArray(instance)) {
            value = _.map(instance, x => {
                return singleJsonFormatter(x);
            });
            _.assign(result, {
                "value":value
            });
        }
        else if (_.isObject(instance)) {
            value = singleJsonFormatter(instance);
            if (defaults.addContextAttribute) {
                _.assign(result, {
                    "@odata.context":self.getContextLink(context).concat("$metadata#", entitySet.name, "/$entity")
                });
            }
            _.assign(result, value);
        }
        return result;
    }
}

/**
 * @class
 * @returns {*}
 * @constructor
 * @param {ConfigurationBase} configuration
 * @augments DataContext
 * @extends DataContext
 */
class EntityDataContext {
    constructor(configuration) {
        EntityDataContext.super_.bind(this)();
        /**
         * @returns {ConfigurationBase}
         */
        this.getConfiguration = () => {
            return configuration;
        };
    }

    model(name) {
        const strategy = this.getConfiguration().getStrategy(DataConfigurationStrategy);
        if (strategy.dataTypes.hasOwnProperty(name)) {
            return;
        }
        const definition = strategy.model(name);
        if (_.isNil(definition)) {
            return;
        }
        const res = new DataModel(definition);
        res.context = this;
        return res;
    }
}

LangUtils.inherits(EntityDataContext, DataContext);

/**
 * @class
 * @param {DataConfiguration} configuration
 * @augments ODataModelBuilder
 * @extends ODataModelBuilder
 */
class ODataConventionModelBuilder {
    constructor(configuration) {

        ODataConventionModelBuilder.super_.bind(this)(configuration);

    }

    /**
     * Automatically registers an entity type from the given model
     * @param {string} entityType
     * @param {string} name
     * @returns {EntitySetConfiguration}
     */
    addEntitySet(entityType, name) {
        const self = this;
        // noinspection JSPotentiallyInvalidConstructorUsage
        const superAddEntitySet = ODataConventionModelBuilder.super_.prototype.addEntitySet;
        /**
         * @type {EntityTypeConfiguration}
         */
        if (this.hasEntitySet(name)) {
            return this.getEntitySet(name);
        }
        /**
         * @type {DataConfigurationStrategy}
         */
        const strategy = self.getConfiguration().getStrategy(DataConfigurationStrategy);
        if (strategy) {
            /**
             * @type {EntitySetConfiguration}
             */
            const modelEntitySet = superAddEntitySet.bind(self)(entityType, name);
            /**
             * @type {EntityTypeConfiguration}
             */
            const modelEntityType = modelEntitySet.entityType;
            /**
             * @type {DataModel}
             */
            const definition = strategy.model(entityType);
            if (definition) {
                /**
                 * @type {DataModel}
                 */
                const model = new DataModel(definition);
                model.context = new EntityDataContext(self.getConfiguration());
                let inheritedAttributes = [];
                const primaryKey = _.find(model.attributes, x => {
                    return x.primary;
                });
                if (model.inherits) {
                    //add base entity
                    self.addEntitySet(model.inherits, pluralize(model.inherits));
                    //set inheritance
                    modelEntityType.derivesFrom(model.inherits);
                    const baseModel = model.base();
                    if (baseModel) {
                        inheritedAttributes = baseModel.attributeNames;
                    }
                }
                _.forEach(_.filter(model.attributes, x => {
                    if (x.primary && model.inherits) {
                        return false;
                    }
                    return (x.model === model.name) && (inheritedAttributes.indexOf(x.name)<0);
                }), x => {
                    const name = x.property || x.name;
                    const mapping = model.inferMapping(x.name);
                    if (_.isNil(mapping)) {
                        //find data type
                        const dataType = strategy.dataTypes[x.type];
                        //add property
                        const edmType = _.isObject(dataType) ? (dataType.hasOwnProperty("edmtype") ? dataType["edmtype"]: "Edm." + x.type) : x.type;
                        modelEntityType.addProperty(name, edmType, x.hasOwnProperty('nullable') ? x.nullable : true);
                        if (x.primary) {
                            modelEntityType.hasKey(name, edmType);
                        }
                        const findProperty = modelEntityType.property.find( p => {
                            return p.name === name;
                        });
                        // add immutable annotation
                        if (Object.prototype.hasOwnProperty.call(x, 'editable')) {
                            if (x.editable) {
                                Object.defineProperty(findProperty, 'immutable', {
                                    configurable: true,
                                     enumerable: true,
                                    writable: true,
                                    value: true
                                });
                            }
                        }
                        // add computed annotation
                        if (Object.prototype.hasOwnProperty.call(x, 'calculation')) {
                            Object.defineProperty(findProperty, 'computed', {
                                configurable: true,
                                enumerable: true,
                                writable: true,
                                value: true
                            });
                        }
                    }
                    else {
                        const namespacedType = x.type;
                        //add navigation property
                        const isNullable = x.hasOwnProperty('nullable') ? x.nullable : true;
                        // add an exception for one-to-one association
                        if (x.multiplicity === EdmMultiplicity.ZeroOrOne || x.multiplicity === EdmMultiplicity.One) {
                            modelEntityType.addNavigationProperty(name, namespacedType, x.multiplicity);
                        }
                        else {
                            modelEntityType.addNavigationProperty(name, namespacedType, x.many ? EdmMultiplicity.Many: (isNullable ? EdmMultiplicity.ZeroOrOne : EdmMultiplicity.One));
                        }
                        //add navigation property entity (if type is not a primitive type)
                        if (!strategy.dataTypes.hasOwnProperty(x.type)) {
                            self.addEntitySet(x.type, pluralize(x.type));
                        }
                    }
                });
                //enumerate functions
                const DataObjectClass = model.getDataObjectType();
                //get static functions
                let ownFunctions = EdmMapping.getOwnFunctions(DataObjectClass);
                _.forEach(ownFunctions, x => {
                    modelEntityType.collection.addFunction(x.name);
                    _.assign(modelEntityType.collection.hasFunction(x.name), x);
                });
                //get instance functions
                ownFunctions = EdmMapping.getOwnFunctions(DataObjectClass.prototype);
                _.forEach(ownFunctions, x => {
                    modelEntityType.addFunction(x.name);
                    _.assign(modelEntityType.hasFunction(x.name), x);
                });
                //get static actions
                let ownActions = EdmMapping.getOwnActions(DataObjectClass);
                _.forEach(ownActions, x => {
                    modelEntityType.collection.addAction(x.name);
                    _.assign(modelEntityType.collection.hasAction(x.name), x);
                });
                //get instance actions
                ownActions = EdmMapping.getOwnActions(DataObjectClass.prototype);
                _.forEach(ownActions, x => {
                    modelEntityType.addAction(x.name);
                    _.assign(modelEntityType.hasAction(x.name), x);
                });
                //add link function
                if (typeof self.getContextLink === 'function') {
                    modelEntitySet.hasContextLink(context => {
                        return self.getContextLink(context).concat("$metadata#",modelEntitySet.name);
                    });
                }
                //add id link
                if (typeof self.getContextLink === 'function') {
                    if (primaryKey) {
                        modelEntitySet.hasIdLink((context, instance) => {
                            //get parent model
                            if (_.isNil(instance[primaryKey.name])) {
                                return;
                            }
                            return self.getContextLink(context).concat(modelEntitySet.name, "(", instance[primaryKey.name], ")");
                        });
                    }
                }
                //add read link
                if (typeof self.getContextLink === 'function') {
                    if (primaryKey) {
                        modelEntitySet.hasReadLink((context, instance) => {
                            //get parent model
                            if (_.isNil(instance[primaryKey.name])) {
                                return;
                            }
                            return self.getContextLink(context).concat(modelEntitySet.name, "(", instance[primaryKey.name], ")");
                        });
                    }
                }
            }
            return modelEntitySet;
        }
        return superAddEntitySet.bind(self)(entityType, name);
    }

    /**
     * @returns Promise|*
     */
    initialize() {
        const self = this;
        if (self[initializeProperty]) {
            return Q.resolve();
        }
        return Q.promise((resolve, reject) => {

            /**
             * @type {*|DataConfigurationStrategy}
             */
            const dataConfiguration = self.getConfiguration().getStrategy(DataConfigurationStrategy);
            const schemaLoader = self.getConfiguration().getStrategy(SchemaLoaderStrategy);
            if (instanceOf(schemaLoader, DefaultSchemaLoaderStrategy)) {
                const nativeFsModule = 'fs';
                const fs = require(nativeFsModule);
                const modelPath = schemaLoader.getModelPath();
                if (_.isNil(modelPath)) {
                    self[initializeProperty] = true;
                    return resolve();
                }
                return fs.readdir(modelPath, (err, files) => {
                    try {
                        if (err) {
                            return reject(err);
                        }
                        const models = _.map( _.filter(files, x => {
                            return /\.json$/.test(x);
                        }), x => {
                            return /(.*?)\.json$/.exec(x)[1];
                        });
                        _.forEach(models, x => {
                            if (!_.isNil(x)) {
                                self.addEntitySet(x, pluralize(x));
                            }
                        });
                        //remove hidden models from entity set container
                        for (let i = 0; i < self[entityContainerProperty].length; i++) {
                            const x = self[entityContainerProperty][i];
                            //get model
                            const entityTypeName = x.entityType.name;
                            const definition = dataConfiguration.model(x.entityType.name);
                            if (definition && definition.hidden) {
                                self.removeEntitySet(x.name);
                                if (!definition.abstract) {
                                    self.ignore(entityTypeName);
                                }
                                i -= 1;
                            }
                        }
                        self[initializeProperty] = true;
                        return resolve();
                    }
                    catch(err) {
                        return reject(err);
                    }
                });
            }
            self[initializeProperty] = true;
            return resolve();
        });

    }

    /**
     * @returns *
     */
    initializeSync() {
        const self = this;
        if (self[initializeProperty]) {
            return;
        }
        /**
         * @type {*|DataConfigurationStrategy}
         */
        const dataConfiguration = self.getConfiguration().getStrategy(DataConfigurationStrategy);
        const schemaLoader = self.getConfiguration().getStrategy(SchemaLoaderStrategy);
        if (instanceOf(schemaLoader, DefaultSchemaLoaderStrategy)) {
            const nativeFsModule = 'fs';
            const fs = require(nativeFsModule);
            const modelPath = schemaLoader.getModelPath();
            if (_.isNil(modelPath)) {
                self[initializeProperty] = true;
                return;
            }
            // read directory in sync mode
            let files = [];
            if (fs.existsSync(modelPath)) {
                files = fs.readdirSync(modelPath);
            }
            // enumerate models
            const models = _.map(_.filter(files, x => {
                return /\.json$/.test(x);
            }), x => {
                return /(.*?)\.json$/.exec(x)[1];
            });
            // add entity set
            _.forEach(models, x => {
                if (!_.isNil(x)) {
                    self.addEntitySet(x, pluralize(x));
                }
            });
            //remove hidden models from entity set container
            for (let i = 0; i < self[entityContainerProperty].length; i++) {
                const x = self[entityContainerProperty][i];
                //get model
                const entityTypeName = x.entityType.name;
                const definition = dataConfiguration.model(x.entityType.name);
                if (definition && definition.hidden) {
                    self.removeEntitySet(x.name);
                    if (!definition.abstract) {
                        self.ignore(entityTypeName);
                    }
                    i -= 1;
                }
            }
        }
        self[initializeProperty] = true;
    }

    /**
     * Creates and returns a structure based on the configuration performed using this builder
     * @returns {Promise|*}
     */
    getEdm() {
        // noinspection JSPotentiallyInvalidConstructorUsage
        const self = this;

        const superGetEdm = ODataConventionModelBuilder.super_.prototype.getEdm;
        try{
            if (_.isObject(self[edmProperty])) {
                return Q.resolve(self[edmProperty]);
            }
            return self.initialize().then(() => {
                return superGetEdm.bind(self)().then(result => {
                    self[edmProperty] = result;
                    return Q.resolve(self[edmProperty]);
                });
            });
        }
        catch(err) {
            return Q.reject(err);
        }
    }

    /**
     * Returns schema based on the configuration performed with this builder
     * @returns {SchemaConfiguration}
     */
    getEdmSync() {
        // noinspection JSPotentiallyInvalidConstructorUsage
        const superGetEdmSync = ODataConventionModelBuilder.super_.prototype.getEdmSync;
        if (_.isObject(this[edmProperty])) {
            return this[edmProperty];
        }
        // use sync initialization
        this.initializeSync();
        // get edm (and store schema configuration for future calls)
        this[edmProperty] = superGetEdmSync.bind(this)();
        // return schema configuration
        return this[edmProperty];
    }
}

LangUtils.inherits(ODataConventionModelBuilder, ODataModelBuilder);





/**
 *
 * @param {Object|Function} proto - The constructor function of a class or the prototype of a class
 * @param {string} key - The name of the property or method where the decorator will be included
 * @param {Function} decorator - The decorator to be included
 */
function defineDecorator(proto, key, decorator) {
    if ((typeof proto !== 'object') && (typeof proto !== 'function')) {
        throw new TypeError('Invalid prototype. Expected object or function.');
    }
    if (typeof key !== 'string') {
        throw new TypeError('Invalid property name. Expected string or function.');
    }
    if (typeof decorator !== 'function') {
        throw new TypeError('Invalid decorator. Expected function.');
    }
    decorator(proto, key, Object.getOwnPropertyDescriptor(proto, key));
}
//extend object
if (typeof Object.defineDecorator === 'undefined') {
    /**
     * @function defineDecorator
     * @param {Object|Function} proto - The constructor function of a class or the prototype of a class
     * @param {string} key - The name of the property or method where the decorator will be included
     * @param {Function} decorator - The decorator to be included
     * @memberOf Object
     * @static
     */
    Object.defineDecorator = defineDecorator;
}

/**
 * @class
 * @constructor
 */
class EdmMapping {
    /**
     * @static
     * Maps a prototype to an OData entity type
     * @param {string} name
     * @returns {Function}
     */
    static entityType(name) {
        if (typeof name !== 'string') {
            throw new TypeError('Entity type must be a string');
        }
        return (target, key, descriptor) => {
            if (typeof target === 'function') {
                target.entityTypeDecorator = name;
            }
            else {
                throw new Error('Decorator is not valid on this declaration type.');
            }
            return descriptor;
        };
    }

    /**
     * @static
     * Maps a function to an OData entity type action
     * @param {string} name
     * @param {*=} returnType
     * @returns {Function}
     */
    static action(name, returnType) {
        if (typeof name !== 'string') {
            throw new TypeError('Action name must be a string');
        }
        return (target, key, descriptor) => {
            if (typeof descriptor.value !== 'function') {
                throw new Error('Decorator is not valid on this declaration type.');
            }
            const action =  new ActionConfiguration(name);
            action.isBound = true;
            if (typeof returnType === 'string') {
                const match = /^Collection\(([a-zA-Z0-9._]+)\)$/ig.exec(returnType);
                if (match) {
                    action.returnsCollection(match[1])
                }
                else {
                    action.returns(returnType);
                }
            }
            else if (typeof returnType === 'function') {
                if (typeof returnType.entityTypeDecorator === 'string') {
                    action.returns(returnType.entityTypeDecorator);
                }
                else {
                    action.returns(returnType.name);
                }
            }
            if (typeof target === 'function') {
                //bound to collection
                action.parameter("bindingParameter",EdmType.CollectionOf(target.entityTypeDecorator || target.name));
            }
            else {
                action.parameter("bindingParameter",target.entityTypeDecorator || target.constructor.name);
            }
            descriptor.value.actionDecorator = action;
            return descriptor;
        };
    }

    /**
     * @static
     * Maps a function to an OData entity type function
     * @param {string} name
     * @param {*=} returnType
     * @returns {Function}
     */
    static func(name, returnType) {
        if (typeof name !== 'string') {
            throw new TypeError('Function name must be a string');
        }
        return (target, key, descriptor) => {
            if (typeof descriptor.value !== 'function') {
                throw new Error('Decorator is not valid on this declaration type.');
            }
            const func =  new FunctionConfiguration(name);
            func.isBound = true;
            if (typeof returnType === 'string') {
                const match = /^Collection\(([a-zA-Z0-9._]+)\)$/ig.exec(returnType);
                if (match) {
                    func.returnsCollection(match[1]);
                }
                else {
                    func.returns(returnType);
                }
            }
            else if (typeof returnType === 'function') {
                if (typeof returnType.entityTypeDecorator === 'string') {
                    func.returns(returnType.entityTypeDecorator);
                }
                else {
                    func.returns(returnType.name);
                }
            }
            if (typeof target === 'function') {
                //bound to collection
                func.parameter("bindingParameter",EdmType.CollectionOf(target.entityTypeDecorator || target.name));
            }
            else {
                func.parameter("bindingParameter",target.entityTypeDecorator || target.constructor.name);
            }
            descriptor.value.functionDecorator = func;
            return descriptor;
        };
    }

    /**
     * @static
     * Defines a data action parameter of an already mapped OData entity type action
     * @param {string} name
     * @param {*} type
     * @param {boolean=} nullable
     * @param {boolean=} fromBody
     * @returns {Function}
     */
    static param(name, type, nullable, fromBody) {
        if (typeof name !== 'string') {
            throw new TypeError('Parameter name must be a string');
        }
        return (target, key, descriptor) => {
            if (typeof type !== 'string' && typeof type !== 'function') {
                throw new TypeError('Parameter type must be a string or function');
            }
            if (typeof descriptor.value !== 'function') {
                throw new Error('Decorator is not valid on this declaration type.');
            }
            //get parameter  type
            let typeString;
            if (typeof type === 'function') {
                if (typeof type.entityTypeDecorator === 'string') {
                    typeString = type.entityTypeDecorator;
                }
                else {
                    typeString = type.name;
                }
            }
            else if (typeof type === 'string') {
                typeString = type;
            }
            if (instanceOf(descriptor.value.actionDecorator, ActionConfiguration)) {
                descriptor.value.actionDecorator.parameter(name, typeString, nullable, fromBody);
            }
            else if (instanceOf(descriptor.value.functionDecorator, FunctionConfiguration)) {
                descriptor.value.functionDecorator.parameter(name, typeString, nullable, fromBody);
            }
            else {
                throw new Error('Procedure configuration cannot be empty for this member. Expected EdmMapping.action(name, returnType) or EdmMapping.func(name, returnType) decorator.');
            }
            return descriptor;
        };
    }

    /**
     * @static
     * Defines the getter of a dynamic navigation property
     * @param {string} name
     * @param {string} type
     * @param {string=} multiplicity
     * @returns {Function}
     */
    static navigationProperty(name, type, multiplicity) {
        if (typeof name !== 'string') {
            throw new TypeError('Action name must be a string');
        }
        return (target, key, descriptor) => {
            if (typeof descriptor.value !== 'function') {
                throw new Error('Decorator is not valid on this declaration type.');
            }
            let propMultiplicity = EdmMultiplicity.ZeroOrOne;
            if (typeof multiplicity !== 'undefined' && typeof multiplicity !== 'string') {
                throw new TypeError('Multiplicity must be a string');
            }
            if (typeof multiplicity === 'string') {
                propMultiplicity = EdmMultiplicity.parse(multiplicity) || EdmMultiplicity.Unknown;
            }
            descriptor.value.navigationPropertyDecorator =  {
                "name": name,
                "type": type,
                "multiplicity": propMultiplicity
            };
        };
    }

    /**
     * @static
     * Maps an object property to an OData entity type property
     * @param {string} name
     * @param {string} type
     * @param {boolean=} nullable
     * @returns {Function}
     */
    static property(name, type, nullable) {
        if (typeof name !== 'string') {
            throw new TypeError('Action name must be a string');
        }
        return (target, key, descriptor) => {
            descriptor.value.propertyDecorator =  {
                "name": name,
                "type": type,
                "nullable": _.isBoolean(nullable) ? nullable : false
            };
        };
    }

    /**
     * @static
     * Validates if the given object instance has a mapped OData action with the given name.
     * @param {*} obj
     * @param {string} name
     * @returns Function|*
     */
    static hasOwnAction(obj, name) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            return;
        }
        const re = new RegExp("^" + name + "$", "ig");
        const functionName = _.find(getOwnPropertyNames(obj), x => {
            return (typeof obj[x] === 'function') && (instanceOf(obj[x].actionDecorator, ActionConfiguration)) && re.test(obj[x].actionDecorator.name);
        });
        if (functionName) {
            return obj[functionName];
        }
    }

    /**
     * @static
     * Validates if the given object instance has a dynamic navigation property getter with the specified name.
     * @param {*} obj
     * @param {string} name
     * @returns Function|*
     */
    static hasOwnNavigationProperty(obj, name) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            return;
        }
        const re = new RegExp("^" + name + "$", "ig");
        const functionName = _.find(getOwnPropertyNames(obj), x => {
            return (typeof obj[x] === 'function') && (typeof obj[x].navigationPropertyDecorator === 'object')  && re.test(obj[x].navigationPropertyDecorator.name);
        });
        if (functionName) {
            return obj[functionName];
        }
    }

    /**
     * @static
     * Validates if the given object instance has a mapped OData function with the given name.
     * @param {*} obj
     * @param {string} name
     * @returns Function|*
     */
    static hasOwnFunction(obj, name) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            return;
        }
        const re = new RegExp("^" + name + "$", "ig");
        const functionName = _.find(getOwnPropertyNames(obj), x => {
            return (typeof obj[x] === 'function') && (instanceOf(obj[x].functionDecorator, FunctionConfiguration)) && re.test(obj[x].functionDecorator.name);
        });
        if (functionName) {
            return obj[functionName];
        }
    }

    /**
     * @static
     * @param {*} obj
     * @returns Array.<Function>|*
     */
    static getOwnFunctions(obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            return;
        }
        return _.flatMap(_.filter(getOwnPropertyNames(obj), x => {
            return (typeof obj[x] === 'function') && (instanceOf(obj[x].functionDecorator, FunctionConfiguration));
        }),  x => {
            return obj[x].functionDecorator;
        });
    }

    /**
     * @static
     * @param {*} obj
     * @returns Array.<Function>|*
     */
    static getOwnActions(obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function') {
            return;
        }
        return _.flatMap(_.filter(getOwnPropertyNames(obj), x => {
            return (typeof obj[x] === 'function') && (instanceOf(obj[x].actionDecorator, ActionConfiguration));
        }),  x => {
            return obj[x].actionDecorator;
        });
    }
}

//exports

export {EdmType};

export {EdmMultiplicity};
export {EntitySetKind};
export {ProcedureConfiguration};
export {ActionConfiguration};
export {FunctionConfiguration};
export {EntityTypeConfiguration};
export {EntitySetConfiguration};
export {SingletonConfiguration};
export {ODataModelBuilder};
export {ODataConventionModelBuilder};
export {EdmMapping};
export {defineDecorator};
