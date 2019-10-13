/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

import {sprintf} from 'sprintf';
import {Args} from '@themost/common';
import _ from 'lodash';
import Symbol from 'symbol';
const aggregate = Symbol();
// eslint-disable-next-line no-unused-vars
//noinspection JSUnusedLocalSymbols

/**
 * @class
 */
class QueryParameter {

}

/**
 * @class
 * @constructor
 */
class QueryFieldAggregator {
    /**
     * Wraps the given comparison expression in this aggregate function e.g. wraps { $gt:45 } with $floor aggregate function and returns { $floor: { $gt:45 } }
     * @param {*} comparison
     */
    wrapWith(comparison) {
        const name = _.keys(this)[0];
        if (name) {
            if (Array.isArray(this[name])) {
                //search for query parameter
                for (let i = 0; i < this[name].length; i++) {
                    if (this[name][i] instanceof QueryParameter) {
                        this[name][i] = comparison;
                        return this;
                    }
                }
                throw new Error('Invalid aggregate expression. Parameter is missing.');
            }
            else {
                if (this[name] instanceof QueryParameter) {
                    this[name] = comparison;
                    return this;
                }
                throw new Error('Invalid aggregate expression. Parameter is missing.');
            }
        }
        throw new Error('Invalid aggregate expression. Aggregator is missing.');
    }
}

/**
 * @class
 * @constructor
 */
export class QueryExpression {
    constructor() {
        /**
         * @private
         */
        Object.defineProperty(this, 'privates', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: { }
        });


    }

    /**
     * @private
     * @param {string|*=} s
     * @returns {string|*}
     */
    prop(s) {
        if (typeof s === 'undefined') { return this.privates.property; }
        if (s == null) { delete this.privates.property; }
        this.privates.property = s;
    }

    /**
     * Clones the current expression and returns a new QueryExpression object.
     * @example
     * var q = new QueryExpression();
     * //do some stuff
     * //...
     * //clone expression
     * var q1 = q.clone();
     * @returns {QueryExpression}
     */
    clone() {
        return _.cloneDeep(this);
    }

    /**
     * Sets the alias of a QueryExpression instance. This alias is going to be used in sub-query operations.
     * @returns {QueryExpression}
     */
    as(alias) {
        this.$alias = alias;
        return this;
    }

    /**
     * Gets a collection that represents the selected fields of the underlying expression
     * @returns {Array}
     */
    fields() {

        if (_.isNil(this.$select))
            return [];
        const entity = Object.key(this.$select);
        let joins = [];
        if (!_.isNil(this.$expand))
        {
            if (_.isArray(this.$expand))
                joins=this.$expand;
            else
                joins.push(this.$expand);
        }
        //get entity fields
        const fields = [];
        //get fields
        const re = QueryField.fieldNameExpression, arr = this.$select[entity] || [];
        _.forEach(arr, x => {
            if (typeof x === 'string') {
                re.lastIndex=0;
                if (!re.test(x))
                    fields.push(new QueryField(x));
                else {
                    const f = new QueryField(x);
                    fields.push(f.from(entity));
                }
            }
            else {
                fields.push(_.assign(new QueryField(), x));
            }
        });
        //enumerate join fields
        _.forEach(joins, x => {
            if (x.$entity instanceof QueryExpression) {
            }
            else {
                const table = Object.key(x.$entity), tableFields = x.$entity[table] || [];
                _.forEach(tableFields, y => {
                    if (typeof x === 'string') {
                        fields.push(new QueryField(y));
                    }
                    else {
                        fields.push(_.assign(new QueryField(), y));
                    }
                });
            }
        });
        return fields;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Gets a boolean value that indicates whether query expression has a filter statement or not.
     * @returns {boolean}
     */
    hasFilter() {
        return _.isObject(this.$where);
    }

    /**
     * @param {boolean=} useOr
     * @returns {QueryExpression}
     */
    prepare(useOr) {
        if (typeof this.$where === 'object') {
            if (typeof this.$prepared === 'object')
            {
                let preparedWhere = {};
                if (useOr)
                    preparedWhere = { $or: [this.$prepared, this.$where] };
                else
                    preparedWhere = { $and: [this.$prepared, this.$where] };
                this.$prepared = preparedWhere;
            }
            else {
                this.$prepared = this.$where;
            }
            delete this.$where;
        }
        return this;
    }

    /**
     * Gets a boolean value that indicates whether query expression has fields or not.
     * @returns {boolean}
     */
    hasFields() {
        const self = this;
        if (!_.isObject(self.$select))
            return false;
        const entity = Object.key(self.$select);
        let joins = [];
        if (!_.isNil(self.$expand))
        {
            if (_.isArray(self.$expand))
                joins=self.$expand;
            else
                joins.push(self.$expand);
        }
        //search for fields
        if (_.isArray(self.$select[entity])) {
            if (self.$select[entity].length>0)
                return true;
        }
        let result = false;
        //enumerate join fields
        _.forEach(joins, x => {
            const table = Object.key(x.$entity);
            if (_.isArray(x.$entity[table])) {
                if (x.$entity[table].length>0)
                    result = true;
            }
        });
        return result;
    }

    /**
     * Gets a boolean value that indicates whether query expression has paging or not.
     * @returns {boolean}
     */
    hasPaging() {
        return !_.isNil(this.$take);
    }

    /**
     * @returns {QueryExpression}
     */
    distinct(value) {
        if (typeof value === 'undefined')
            this.$distinct = true;
        else
            this.$distinct = value || false;
        return this;
    }

    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    where(field) {
        if (field == null)
            throw new Error('Left operand cannot be empty. Expected string or object.');
        delete this.$where;
        if (typeof field === 'string') {
            this.prop(field);
        }
        else if (typeof field === 'object') {
            this.prop(QueryField.prototype.nameOf.call(field))
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Injects the given filter expression into the current query expression
     * @param {*} where - An object that represents a filter expression
     * @returns {QueryExpression}
     */
    injectWhere(where) {
        if (where == null)
            return this;
        this.$where = where;
    }

    /**
     * Initializes a delete query and sets the entity name that is going to be used in this query.
     * @param entity {string}
     * @returns {QueryExpression}
     */
    delete(entity) {
        if (entity == null)
            return this;
        this.$delete = entity.valueOf();
        //delete other properties (if any)
        delete this.$insert;
        delete this.$select;
        delete this.$update;
        return this;
    }

    /**
     * Initializes an insert query and sets the object that is going to be inserted.
     * @param obj {*}
     * @returns {QueryExpression}
     */
    insert(obj) {
        if (obj == null)
            return this;
        if (_.isArray(obj) || _.isObject(obj)) {
            this.$insert = { table1: obj };
            //delete other properties (if any)
            delete this.$delete;
            delete this.$select;
            delete this.$update;
            return this;
        }
        else {
            throw new Error('Invalid argument. Object must be an object or an array of objects');
        }
    }

    into(entity) {
        if (entity == null)
            return this;
        if (_.isNil(this.$insert))
            return this;
        const prop = Object.key(this.$insert);
        if (prop == null)
            return this;
        if (prop===entity)
            return this;
        const value = this.$insert[prop];
        if (value == null)
            return this;
        this.$insert[entity] = value;
        delete this.$insert[prop];
        return this;
    }

    /**
     * Initializes an update query and sets the entity name that is going to be used in this query.
     * @param {string} entity
     * @returns {QueryExpression}
     */
    update(entity) {
        if (entity == null)
            return this;
        if (typeof entity !== 'string')
            throw new Error('Invalid argument type. Update entity argument must be a string.');
        this.$update = {};
        this.$update[entity] = {};
        //delete other properties (if any)
        delete this.$delete;
        delete this.$select;
        delete this.$insert;
        return this;
    }

    /**
     * Sets the object that is going to be updated through an update expression.
     * @param {*} obj
     * @returns {QueryExpression}
     */
    set(obj) {
        if (obj == null)
            return this;
        if (_.isArray(obj) || !_.isObject(obj))
            throw new Error('Invalid argument type. Update expression argument must be an object.');
        //get entity name (by property)
        const prop = Object.key(this.$update);
        if (prop == null)
            throw new Error('Invalid operation. Update entity cannot be empty at this context.');
        //set object to update
        this.$update[prop] = obj;
        return this;
    }

    /**
     * Prepares a SELECT statement by defining a field or an array of fields
     * we want to select data from
     * @param {...*} field - A param array of fields that are going to be used in select statement
     * @returns {QueryExpression}
     * @example
     * const q = new QueryExpression().from('UserBase').select('id', 'name');
     * const formatter = new SqlFormatter();
     * console.log('SQL', formatter.formatSelect(q))
     * // SELECT UserBase.id, UserBase.name FROM UserBase
     */
    /* eslint-disable-next-line no-unused-vars */
    select(field) {
        // get argument
        const arr = Array.prototype.slice.call(arguments);
        if (arr.length === 0) {
            return this;
        }
        // validate arguments
        const fields = [];
        arr.forEach( x => {
            // backward compatibility
            // any argument may be an array of fields
            // this operation needs to be deprecated
            if (Array.isArray(x)) {
                fields.push.apply(fields, x);
            }
            else {
                fields.push(x);
            }
        });
        //if entity is already defined
        if (this.privates.entity)
        {
            //initialize $select property
            this.$select = {};
            //and set array of fields
            this.$select[this.privates.entity] = fields;
        }
        else
        {
            //otherwise store array of fields in temporary property and wait
            this.privates.fields = fields;
        }
        //delete other properties (if any)
        delete this.$delete;
        delete this.$insert;
        delete this.$update;
        return this;
    }

    /**
     * Prepares an aggregated query which is going to count records by specifying the alias of the count attribute
     * e.g. SELECT COUNT(*) AS `total` FROM (SELECT * FROM `Orders` WHERE `orderStatus` = 1) `c0`
     * @param {string} alias - A string which represents the alias of the count attribute
     * @returns QueryExpression
     */
    count(alias) {
        this.$count = alias;
        return this;
    }

    /**
     * Sets the entity of a select query expression
     * @param entity {string|QueryEntity|*} A string that represents the entity name
     * @returns {QueryExpression}
     */
    from(entity) {

        if (entity == null)
            return this;
        let name;
        if (entity instanceof QueryEntity) {
            name  = entity.$as || entity.name;
            this.$ref = this.$ref || {};
            this.$ref[name] = entity;
        }
        else if (entity instanceof QueryExpression) {
            name  = entity.$alias || "s0";
            this.$ref = this.$ref || {};
            this.$ref[name] = entity;
        }
        else {
            name = entity.valueOf();
        }
        if (this.privates.fields) {
            //initialize $select property
            this.$select = {};
            //and set array of fields
            this.$select[name] = this.privates.fields;
        }
        else {
            this.privates.entity = name;
        }
        //delete other properties (if any)
        delete this.$delete;
        delete this.$insert;
        delete this.$update;
        //and return this object
        return this;
    }

    /**
     * Initializes a join expression with the specified entity
     * @param {*} entity
     * @param {Array=} props
     * @param {String=} alias
     * @returns {QueryExpression}
     */
    join(entity, props, alias) {

        if (entity == null)
            return this;
        if (_.isNil(this.$select))
            throw new Error('Query entity cannot be empty when adding a join entity.');
        let obj = {};
        if (entity instanceof QueryEntity) {
            //do nothing (clone object)
            obj = entity;
        }
        else if (entity instanceof QueryExpression) {
            //do nothing (clone object)
            obj = entity;
        }
        else {
            obj[entity] = props || [];
            if (typeof alias === 'string')
                obj.$as=alias;
        }
        this.privates.expand =  { $entity: obj };
        //and return this object
        return this;
    }

    /**
     * Sets the join expression of the last join entity
     * @param obj {Array|*}
     * @returns {QueryExpression}
     */
    with(obj) {

        if (obj == null)
            return this;
        if (_.isNil(this.privates.expand))
            throw new Error('Join entity cannot be empty when adding a join expression. Use QueryExpression.join(entity, props) before.');
        if (obj instanceof QueryExpression)
        {
            /**
             * @type {QueryExpression}
             */
            const expr = obj;
            let where = null;
            if (expr.$where)
                where = expr.$prepared ? { $and: [expr.$prepared, expr.$where] } : expr.$where;
            else if (expr.$prepared)
                where = expr.$prepared;
            this.privates.expand.$with = where;
        }
        else {
            this.privates.expand.$with = obj;
        }
        if (_.isNil(this.$expand)) {
            this.$expand = this.privates.expand;
        }
        else {
            if (_.isArray(this.$expand)) {
                this.$expand.push(this.privates.expand);
            }
            else {
                //get expand object
                const expand = this.$expand;
                //and create array of expand objects
                this.$expand = [expand, this.privates.expand];
            }
        }
        //destroy temp object
        this.privates.expand = null;
        //and return QueryExpression
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Applies an ascending ordering to a query expression
     * @param name {string|Array}
     * @returns {QueryExpression}
     */
    orderBy(name) {

        if (name == null)
            return this;
        if (_.isNil(this.$order))
            this.$order = [];
        this.$order.push({ $asc: name });
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Applies a descending ordering to a query expression
     * @param name
     * @returns {QueryExpression}
     */
    orderByDescending(name) {

        if (name == null)
            return this;
        if (_.isNil(this.$order))
            this.$order = [];
        this.$order.push({ $desc: name });
        return this;
    }

    /**
     * Performs a subsequent ordering in a query expression
     * @param name {string|Array}
     * @returns {QueryExpression}
     */
    thenBy(name) {

        if (name == null)
            return this;
        if (_.isNil(this.$order))
        //throw exception (?)
            return this;
        this.$order.push({ $asc: name });
        return this;
    }

    /**
     * Performs a subsequent ordering in a query expression
     * @param name {string|Array}
     * @returns {QueryExpression}
     */
    thenByDescending(name) {

        if (name == null)
            return this;
        if (_.isNil(this.$order))
        //throw exception (?)
            return this;
        this.$order.push({ $desc: name });
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {...*} field
     * @returns {QueryExpression}
     */
    /* eslint-disable-next-line no-unused-vars */
    groupBy(field) {

        // get argument
        const arr = Array.prototype.slice.call(arguments);
        if (arr.length === 0) {
            return this;
        }
        // validate arguments
        const fields = [];
        arr.forEach( x => {
            // backward compatibility
            // any argument may be an array of fields
            // this operation needs to be deprecated
            if (Array.isArray(x)) {
                fields.push.apply(fields, x);
            }
            else {
                fields.push(x);
            }
        });
        this.$group = fields;
        return this;
    }

    /**
     * @param expr
     * @private
     */
    __append(expr) {
        if (!expr)
            return;
        if (!this.$where) {
            this.$where = expr;
        }
        else {
            const op = this.privates.expression;
            if (op) {
                //get current operator
                const keys = _.keys(this.$where);
                if (keys[0]===op) {
                    this.$where[op].push(expr);
                }
                else {
                    const newFilter = {};
                    newFilter[op] = [this.$where, expr];
                    this.$where = newFilter;
                }
            }
        }
        delete this.privates.property;
        delete this.privates.expression;
    }

    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    or(field) {
        if (field == null)
            throw new Error('Left operand cannot be empty. Expected string or object.');
        if (typeof field === 'string') {
            this.prop(field);
        }
        else if (typeof field === 'object') {
            this.prop(QueryField.prototype.nameOf.call(field))
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        this.privates.expression = '$or';
        return this;
    }

    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    and(field) {
        if (field == null)
            throw new Error('Left operand cannot be empty. Expected string or object.');
        if (typeof field === 'string') {
            this.prop(field);
        }
        else if (typeof field === 'object') {
            this.prop(QueryField.prototype.nameOf.call(field))
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        this.privates.expression = '$and';
        return this;
    }

    /**
     * Prepares an equal expression.
     * @example
     * q.where('id').equal(10) //id=10 expression
     * @param {*} value - A value that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    equal(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = value;
            //apply aggregation if any
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], value);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * Prepares a not equal expression.
     * @example
     * q.where('id').notEqual(10) //id<>10 expression
     * @param {*} value - A value that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    notEqual(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $ne:value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate],{ $ne:value });
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * Prepares an in statement expression
     * @example
     * q.where('id').in([10, 11, 12]) //id in (10,11,12) expression
     * @param {Array} values - An array of values that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    in(values) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $in : values };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * Prepares a not in statement expression
     * @example
     * q.where('id').notIn([10, 11, 12]) //id in (10,11,12) expression
     * @param {Array} values - An array of values that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    notIn(values) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $nin : values };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate],{ $nin : values });
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param {*} value The value to be compared
     * @param {Number} result The result of modulo expression
     * @returns {QueryExpression}
     */
    mod(value, result) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $mod : [ value, result] };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param {*} value The value to be compared
     * @param {Number} result The result of a bitwise and expression
     * @returns {QueryExpression}
     */
    bit(value, result) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $bit : [ value, result] };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    greaterThan(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $gt:value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param value {RegExp|*}
     * @returns {QueryExpression}
     */
    startsWith(value) {
        const p0 = this.prop();
        if (p0) {
            if (typeof value !== 'string') {
                throw new Error('Invalid argument. Expected string.');
            }
            let comparison = { $regex : '^' + value, $options:'i' };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate],{ $regex : '^' + value, $options:'i' });
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    endsWith(value) {
        const p0 = this.prop();
        if (p0) {
            if (typeof value !== 'string') {
                throw new Error('Invalid argument. Expected string.')
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, { $regex : value + '$', $options:'i' });
            this.__append(expr);
        }
        return this;
    }

    /**
     * Prepares a contains expression.
     * @example
     * var qry = require('most-query');
     * var q = qry.query('Person').where('first').contains('om').select(['id','first', 'last']);
     * var formatter = new qry.classes.SqlFormatter();
     * console.log(formatter.format(q));
     * //returns SELECT Person.id, Person.first, Person.last FROM Person WHERE ((first REGEXP 'om')=true)
     * @param  {*} value - A value that represents the right part of the expression
     * @returns {QueryExpression}
     */
    contains(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $text: { $search: value } };
            //apply aggregation if any
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison );
            this.__append(expr);
        }
        return this;
    }

    notContains(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $text: { $search: value } };
            //apply aggregation if any
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = { $not: QueryFieldComparer.prototype.compareWith.call(p0, comparison) };
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    lowerThan(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $lt:value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    lowerOrEqual(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $lte:value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    greaterOrEqual(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $gte:value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this.__append(expr);
        }
        return this;
    }

    /**
     * @param {*} value1
     * @param {*} value2
     * @returns {QueryExpression}
     */
    between(value1, value2) {
        const p0 = this.prop();
        if (p0) {
            let comparison1 = { $gte:value1}, comparison2 = { $lte:value2 };
            if (typeof this[aggregate] === 'object') {
                comparison1 = QueryFieldAggregator.prototype.wrapWith({ $gte:value1} );
                comparison2 = QueryFieldAggregator.prototype.wrapWith({ $lte:value2} );
                delete this[aggregate]
            }
            const comp1 = QueryFieldComparer.prototype.compareWith.call(p0, comparison1);
            const comp2 = QueryFieldComparer.prototype.compareWith.call(p0, comparison2);
            const expr = {};
            expr['$and'] = [ comp1, comp2 ];
            this.__append(expr);
        }
        return this;
    }

    /**
     * Skips the specified number of objects during select.
     * @param {Number} n
     * @returns {QueryExpression}
     */
    skip(n) {
        this.$skip = isNaN(n) ? 0 : n;
        return this;
    }

    /**
     * Takes the specified number of objects during select.
     * @param {Number} n
     * @returns {QueryExpression}
     */
    take(n) {
        this.$take = isNaN(n) ? 0 : n;
        return this;
    }

    /**
     * @private
     * @param {number|*} number
     * @param {number} length
     * @returns {*}
     */
    static zeroPad(number, length) {
        number = number || 0;
        let res = number.toString();
        while (res.length < length) {
            res = '0' + res;
        }
        return res;
    }

    /**
     * @param {number|*} x
     * @returns {QueryExpression}
     */
    add(x) {
        this[aggregate] = { $add:[ x, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {number|*} x
     * @returns {QueryExpression}
     */
    subtract(x) {
        this[aggregate] = { $subtract:[ x, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {number} x
     * @returns {QueryExpression}
     */
    multiply(x) {
        this[aggregate] = { $multiply:[ x, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {number} x
     * @returns {QueryExpression}
     */
    divide(x) {
        this[aggregate] = { $divide:[ x, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {number=} n
     * @returns {QueryExpression}
     */
    round(n) {
        this[aggregate] = { $round:[ n, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {number} start
     * @param {number=} length
     * @returns {QueryExpression}
     */
    substr(start, length) {
        this[aggregate] = { $substr:[ start, length, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {string} s
     * @returns {QueryExpression}
     */
    indexOf(s) {
        this[aggregate] = { $indexOf:[ s, new QueryParameter() ] };
        return this;
    }

    /**
     * @param {string|*} s
     * @returns {QueryExpression}
     */
    concat(s) {
        this[aggregate] = { $concat:[ s, new QueryParameter()] };
        return this;
    }

    /**
     * @returns {QueryExpression}
     */
    trim() {
        this[aggregate] = { $trim: new QueryParameter() };
        return this;
    }

    /**
     * @returns {QueryExpression}
     */
    length() {
        this[aggregate] = { $length: new QueryParameter() };
        return this;
    }

    /**
     * @returns {QueryExpression}
     */
    getDate() {
        this[aggregate] = { $date: new QueryParameter() };
        return this;
    }

    /**
     * @returns {QueryExpression}
     */
    getYear() {
        this[aggregate] = { $year: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getMonth() {
        this[aggregate] = { $month: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getDay() {
        this[aggregate] = { $dayOfMonth: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getHours() {
        this[aggregate] = { $hour: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getMinutes() {
        this[aggregate] = { $minutes: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    getSeconds() {
        this[aggregate] = { $seconds: new QueryParameter() };
        return this;
    }

    /**
     * @returns {QueryExpression}
     */
    floor() {
        this[aggregate] = { $floor: new QueryParameter() };
        return this;
    }

    /**
     * @returns {QueryExpression}
     */
    ceil() {
        this[aggregate] = { $ceiling: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    toLocaleLowerCase() {
        this[aggregate] = { $toLower: new QueryParameter() };
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @returns {QueryExpression}
     */
    toLocaleUpperCase() {
        this[aggregate] = { $toUpper: new QueryParameter() };
        return this;
    }

    static escape(val) {
        if (val == null) {
            return 'null';
        }

        switch (typeof val) {
            case 'boolean': return (val) ? 'true' : 'false';
            case 'number': return val+'';
        }

        if (val instanceof Date) {
            const dt = new Date(val);
            const year   = dt.getFullYear();
            const month  = QueryExpression.zeroPad(dt.getMonth() + 1, 2);
            const day    = QueryExpression.zeroPad(dt.getDate(), 2);
            const hour   = QueryExpression.zeroPad(dt.getHours(), 2);
            const minute = QueryExpression.zeroPad(dt.getMinutes(), 2);
            const second = QueryExpression.zeroPad(dt.getSeconds(), 2);
            const millisecond = QueryExpression.zeroPad(dt.getMilliseconds(), 3);
            val = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
        }

        if (typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]') {
            const values = [];
            _.forEach(val, x => {
                QueryExpression.escape(x);
            });
            return values.join(',');
        }

        if (typeof val === 'object') {
            if (val.hasOwnProperty('$name'))
            //return field identifier
                return val['$name'];
            else
                return this.escape(val.valueOf())
        }

        val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, s => {
            switch(s) {
                case "\0": return "\\0";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\b": return "\\b";
                case "\t": return "\\t";
                case "\x1a": return "\\Z";
                default: return "\\"+s;
            }
        });
        return "'"+val+"'";
    }
}

/**
 * Represents an enumeration of comparison query operators
 * @type {*}
 */
QueryExpression.ComparisonOperators = { $eq:'$eq', $ne:'$ne', $gt:'$gt',$gte:'$gte', $lt:'$lt',$lte:'$lte', $in: '$in', $nin:'$nin' };
/**
 * Represents an enumeration of logical query operators
 * @type {*}
 */
QueryExpression.LogicalOperators = { $or:'$or', $and:'$and', $not:'$not', $nor:'$not' };
/**
 * Represents an enumeration of evaluation query operators
 * @type {*}
 */
QueryExpression.EvaluationOperators = { $mod:'$mod', $add:'$add', $sub:'$sub', $mul:'$mul', $div:'$div' };

/**
 * Prepares an equal expression.
 * @example
 * q.where('id').eq(10) //id=10 expression
 * @param {*} value
 * @returns {QueryExpression}
 */
QueryExpression.prototype.eq = QueryExpression.prototype.equal;


QueryExpression.prototype.ne = QueryExpression.prototype.notEqual;
// noinspection JSUnusedGlobalSymbols
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.gt = QueryExpression.prototype.greaterThan;
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.lt = QueryExpression.prototype.lowerThan;
// noinspection JSUnusedGlobalSymbols
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.lte = QueryExpression.prototype.lowerOrEqual;
// noinspection JSUnusedGlobalSymbols
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.gte = QueryExpression.prototype.greaterOrEqual;

/**
 * @class
 * @property {string} $name - A string which represents the name of this entity
 * @property {string} $as - A string which represents an alias for this entity
 * @property {*} $project - A key/value pair collection of attributes of this entity
 */
export class QueryEntity {

    /**
     * @param {string=} entity
     */
    constructor(entity) {
        if (entity) {
            Args.notString(entity,'Entity');
        }
        this.$name = entity || 'Table';
    }

    /**
     * Returns the name of this entity (for backward compatibility issues)
     * @deprecated This property has been deprecated and it's going to be removed in the next version
     * @returns {*|string}
     */
    get name() {
        return this.$name;
    }

    select(name) {
        const f = new QueryField(name);
        return f.from(this.$as ? this.$as : this.$name);
    }

    as(alias) {
        this.$as = alias;
        return this;
    }

    inner() {
        this.$join = 'inner';
        return this;
    }

    left() {
        this.$join = 'left';
        return this;
    }

    right() {
        this.$join = 'right';
        return this;
    }
}

/**
 * @class
 * @param obj {string=}
 * @constructor
 */
export class QueryField {
    constructor(obj) {
        if (typeof  obj === 'string') {
            /**
             * @property QueryField#$name
             * @private
             * @type {string}
             */
            this.$name = obj;
        }
        else if (_.isObject(obj)) {
            _.assign(this, obj);
        }
    }

    /**
     * Sets the name of a query field
     * @param name {string} - A string which represents a field name
     * @example
     * // { $name: 'price' }
     * let field = new QueryField().select('price');
     * @returns {QueryField}
     */
    select(name) {
        // validate name
        Args.notString(name, 'name');
        // clear object
        Object.clear(this);
        // set field name
        this.$name = name;
        // return this
        return this;
    }

    /**
     * Sets the entity of the current field
     * @param entity {string}
     * @returns {QueryField}
     */
    from(entity) {
        let name;
        if (typeof entity !== 'string')
            throw  new Error('Invalid argument. Expected string');
        //get property
        if (!_.isNil(this.$name))
        {
            if (typeof this.$name === 'string') {
                //check if an entity is already defined
                name = this.$name;
                if (QueryField.fieldNameExpression.test(name))
                //if not append entity name
                    this.$name = entity.concat('.', name);
                else
                //split field name and add entity
                    this.$name = entity.concat('.', name.split('.')[1]);
            }
            else
                throw new Error("Invalid field definition.");
        }
        else {
            //get default property
            const alias = Object.key(this);
            if (alias == null)
                throw new Error("Field definition cannot be empty at this context");
            //get field expression
            const expr = this[alias];
            //get field name
            const aggregate = Object.key(expr);
            if (aggregate == null)
                throw new Error("Field expression cannot be empty at this context");
            name = expr[aggregate];
            if (QueryField.fieldNameExpression.test(name))
            //if not append entity name
                expr[aggregate] = entity.concat('.', name);
            else
            //split field name and add entity
                expr[aggregate] = entity.concat('.', name.split('.')[1]);
        }
        return this;
    }

    /**
     * Defines a COUNT() query expression for the given field
     * @example
     * // { orderCount: { $count: 'order' } }
     * let field = new QueryField().count('order').as('orderCount')
     * @param {string} name - A string which represents a field name
     * @returns {QueryField}
     */
    count(name) {
        // validate name argument
        Args.notString(name, 'name');
        //clear object
        Object.clear(this);
        // set count aggregate function
        this[name] = { $count: name };
        // return this
        return this;
    }

    /**
     * @param {...string} str
     * @return {QueryField}
     */
    /* eslint-disable-next-line no-unused-vars */
    concat(str) {
        this.$name.concat.apply(this.$name, Array.prototype.slice.call(arguments));
        return this;
    }

    /**
     * Defines a SUM() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { total: { $sum: 'price' } }
     * let field = new QueryField().sum('price').as('total')
     * @returns {QueryField}
     */
    sum(name) {
        // validate field
        Args.notString(name, 'name');
        //clear object
        Object.clear(this);
        // field as aggregate function e.g. { price: { $sum: 'price' } }
        this[name] = { $sum: name };
        return this;
    }

    /**
     * Defines a MIN() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { minimumPrice: { $min: 'price' } }
     * let field = new QueryField().sum('price').as('minimumPrice')
     * @returns {QueryField}
     */
    min(name) {
        if (typeof name !== 'string')
            throw  new Error('Invalid argument. Expected string');
        //clear object
        Object.clear(this);
        // set aggregate function
        this[name] = { $min: name };
        return this;
    }

    /**
     * Defines an AVG() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { averagePrice: { $avg: 'price' } }
     * let field = new QueryField().sum('price').as('averagePrice')
     * @returns {QueryField}
     */
    average(name) {
        // validate field
        Args.notString(name, 'name');
        //clear object
        Object.clear(this);
        // set aggregate function
        this[name] = { $avg: name };
        return this;
    }

    /**
     * Defines an AVG() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { averagePrice: { $avg: 'price' } }
     * let field = new QueryField().sum('price').as('averagePrice')
     * @returns {QueryField}
     */
    avg(name) {
        return this.average(name);
    }

    /**
     * Defines a MAX() query expression for the given field
     * @param {string} name - A string which represents a field name
     * // { maxPrice: { $max: 'price' } }
     * let field = new QueryField().max('price').as('maxPrice')
     * @returns {QueryField}
     */
    max(name) {
        // validate field
        Args.notString(name, 'name');
        //clear object
        Object.clear(this);
        // set aggregate function
        this[name] = { $max: name };
        // return this
        return this;
    }

    /**
     *
     * @param {String=} alias
     * @returns {QueryField|String}
     */
    as(alias) {
        if (typeof alias === 'undefined')
        {
            if (typeof this.$name !== 'undefined')
                return null;
            const keys = _.keys(this);
            if (keys.length===0)
                return null;
            else
                return keys[0];
        }
        if (typeof alias !== 'string')
            throw  new Error('Invalid argument. Expected string');
        //get first property
        const prop = Object.key(this);
        if (prop == null)
            throw  new Error('Invalid object state. Field is not selected.');
        const value = this[prop];
        if (prop!==alias) {
            this[alias] = value;
            delete this[prop];
        }
        return this;
    }

    /**
     * Gets query field name
     * @returns {string}
     */
    getName() {
        let name = null;
        if (typeof this.$name === 'string') {
            name = this.$name
        }
        else {
            const prop = Object.key(this);
            if (prop) {
                name = this[prop];
            }
        }
        if (typeof name === 'string') {
            //check if an entity is already defined
            const re = new RegExp(QueryField.fieldNameExpression.source);
            if (re.test(name))
                return name;
            else
                return name.split('.')[1];
        }
    }

    nameOf() {

        if ((typeof this === 'string') || (this instanceof String)) {
            return this;
        }
        let alias;
        if (typeof this.as === 'function')
            alias = this.as();
        else
            alias = QueryField.prototype.as.call(this);

        if (alias) {
            return this[alias];
        }
        else {
            return this.$name;
        }
    }

    valueOf() {
        return this.$name;
    }

    /**
     * @param {*} field
     * @returns {QueryField}
     */
    static select(field) {
        return new QueryField(field);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static count(name) {
        return new QueryField().count(name);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static min(name) {
        return new QueryField().min(name);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static max(name) {
        return new QueryField().max(name);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static average(name) {
        return new QueryField().average(name);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static avg(name) {
        return new QueryField().average(name);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static sum(name) {
        return new QueryField().sum(name);
    }

    /**
     * @param {string} name
     * @returns QueryField
     */
    static floor(name) {
        const f = { };
        f[name] = { $floor:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static ceil(name) {
        const f = { };
        f[name] = { $ceiling:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param {string} name
     * @param {number|*} divider
     * @returns {QueryField}
     */
    static modulo(name, divider) {
        const f = { };
        f[name] = { $mod:[ new QueryField(name), divider ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param {string} name
     * @param {number|*} x
     * @returns {QueryField}
     */
    static add(name, x) {
        const f = { };
        f[name] = { $add:[ new QueryField(name), x ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param {string} name
     * @param {number|*} x
     * @returns {QueryField}
     */
    static subtract(name, x) {
        const f = { };
        f[name] = { $subtract:[ new QueryField(name), x ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param {string} name
     * @param {number|*} divider
     * @returns {QueryField}
     */
    static divide(name, divider) {
        const f = { };
        f[name] = { $divide:[ new QueryField(name), divider ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param {string} name
     * @param {number|*} multiplier
     * @returns {QueryField}
     */
    static multiply(name, multiplier) {
        const f = { };
        f[name] = { $multiply:[ new QueryField(name), multiplier ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param {string} name
     * @param {number=} n
     * @returns {QueryField}
     */
    static round(name, n) {
        const f = { };
        f[name] = { $round:[ new QueryField(name), typeof n !== 'number' ? n : 2 ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static strLength(name) {
        const f = { };
        f[name] = { $length:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static trim(name) {
        const f = { };
        f[name] = { $trim:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static year(name) {
        const f = { };
        f[name] = { $year:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static day(name) {
        const f = { };
        f[name] = { $day:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static date(name) {
        const f = { };
        f[name] = { $date:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static hour(name) {
        const f = { };
        f[name] = { $hour:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static minute(name) {
        const f = { };
        f[name] = { $minute:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static second(name) {
        const f = { };
        f[name] = { $second:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }

    /**
     * @param name {string}
     * @returns {QueryField}
     */
    static month(name) {
        const f = { };
        f[name] = { $month:[ new QueryField(name) ] };
        return _.assign(new QueryField(), f);
    }
}

QueryField.fieldNameExpression = /^[A-Za-z_0-9]+$/;

/**
 * @class QueryFieldComparer
 * @constructor
 */
class QueryFieldComparer {
    /**
     *
     * @param {*} comparison
     * @returns {*}
     */
    compareWith(comparison) {
        const expr = { };
        if ((typeof this === 'string') || (this instanceof String)) {
            expr[this] = comparison;
            return expr;
        }

        //get aggregate function
        const aggr = Object.key(this);

        let name;
        if (_.isArray(this[aggr])) {
            //get first element (the field name)
            name = QueryField.prototype.nameOf.call(this[aggr][0]);
        }
        else {
            //get element (the field name)
            name = QueryField.prototype.nameOf.call(this[aggr]);
        }
        expr[name] = { };
        expr[name][aggr] = comparison;
        return expr;
    }
}

/**
 * @class
 * @constructor
 */
export class OpenDataQuery {
    constructor() {
        /**
         * @private
         */
        Object.defineProperty(this, 'privates', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: { }
        });
    }

    /**
     * @private
     * @returns OpenDataQuery
     */
    append() {

        const self = this;
        let exprs;
        if (self.privates.left) {
            let expr = null;

            if (self.privates.op==='in') {
                if (_.isArray(self.privates.right)) {
                    //expand values
                    exprs = [];
                    _.forEach(self.privates.right, x => {
                        exprs.push(self.privates.left + ' eq ' + QueryExpression.escape(x));
                    });
                    if (exprs.length>0)
                        expr = '(' + exprs.join(' or ') + ')';
                }
            }
            else if (self.privates.op==='nin') {
                if (_.isArray(self.privates.right)) {
                    //expand values
                    exprs = [];
                    _.forEach(self.privates.right, x => {
                        exprs.push(self.privates.left + ' ne ' + QueryExpression.escape(x));
                    });
                    if (exprs.length>0)
                        expr = '(' + exprs.join(' and ') + ')';
                }
            }
            else
                expr = self.privates.left + ' ' + self.privates.op + ' ' + QueryExpression.escape(self.privates.right);
            if (expr) {
                if (_.isNil(self.$filter))
                    self.$filter = expr;
                else {
                    self.privates.lop = self.privates.lop || 'and';
                    self.privates._lop = self.privates._lop || self.privates.lop;
                    if (self.privates._lop === self.privates.lop)
                        self.$filter = self.$filter + ' ' + self.privates.lop + ' ' + expr;
                    else
                        self.$filter = '(' + self.$filter + ') ' + self.privates.lop + ' ' + expr;
                    self.privates._lop = self.privates.lop;
                }
            }
        }
        delete self.privates.lop;delete self.privates.left; delete self.privates.op; delete self.privates.right;
        return this;
    }

    /**
     * @param {...string} attr
     * @returns OpenDataQuery
     */
    select(attr) {
        const args = (arguments.length>1) ? Array.prototype.slice.call(arguments): attr;
        this.$select = _.map(args, arg => {
            if (_.isArray(arg)) {
                return arg.join(',');
            }
            return arg;
        }).join(',');
        return this;
    }

    /**
     * @param {number} val
     * @returns OpenDataQuery
     */
    take(val) {
        this.$top = isNaN(val) ? 0 : val;
        return this;
    }

    /**
     * @param {number} val
     * @returns OpenDataQuery
     */
    skip(val) {
        this.$skip = isNaN(val) ? 0 : val;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {string} name
     * @returns OpenDataQuery
     */
    orderBy(name) {
        if (!name == null) {
            this.$orderby = name.toString();
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    orderByDescending(name) {
        if (!name == null) {
            this.$orderby = name.toString() + ' desc';
        }
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    thenBy(name) {
        if (!name == null) {
                this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString());
        }
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    thenByDescending(name) {
        if (!name == null) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString()) + ' desc';
        }
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    where(name) {
        this.privates.left = name;
        return this;
    }

    /**
     * @param {String=} name
     * @returns OpenDataQuery
     */
    and(name) {
        this.privates.lop = 'and';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }

    /**
     * @param {String=} name
     * @returns OpenDataQuery
     */
    or(name) {
        this.privates.lop = 'or';
        if (typeof name !== 'undefined')
            this.privates.left = name;
        return this;
    }

    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    equal(value) {
        this.privates.op = 'eq';this.privates.right = value; return this.append();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    indexOf(name) {
        this.privates.left = 'indexof(' + name + ')';
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns OpenDataQuery
     */
    endsWith(name, s) {
        this.privates.left = sprintf('endswith(%s,%s)',name,QueryExpression.escape(s));
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns OpenDataQuery
     */
    startsWith(name, s) {
        this.privates.left = sprintf('startswith(%s,%s)',name,QueryExpression.escape(s));
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @param {*} s
     * @returns OpenDataQuery
     */
    substringOf(name, s) {
        this.privates.left = sprintf('substringof(%s,%s)',name,QueryExpression.escape(s));
        return this;
    }

    /**
     * @param {*} name
     * @param {number} pos
     * @param {number} length
     * @returns OpenDataQuery
     */
    substring(name, pos, length) {
        this.privates.left = sprintf('substring(%s,%s,%s)',name,pos,length);
        return this;
    }

    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    length(name) {
        this.privates.left = sprintf('length(%s)',name);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    toLower(name) {
        this.privates.left = sprintf('tolower(%s)',name);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    toUpper(name) {
        this.privates.left = sprintf('toupper(%s)',name);
        return this;
    }

    /**
     * @param {*} name
     * @returns OpenDataQuery
     */
    trim(name) {
        this.privates.left = sprintf('trim(%s)',name);
        return this;
    }

    /**
     * @param {*} s0
     * @param {*} s1
     * @param {*=} s2
     * @param {*=} s3
     * @param {*=} s4
     * @returns OpenDataQuery
     */
    concat(s0, s1, s2, s3, s4) {
        this.privates.left = 'concat(' + QueryExpression.escape(s0) + ',' + QueryExpression.escape(s1);
        if (typeof s2 !== 'undefined')
            this.privates.left +=',' + QueryExpression.escape(s2);
        if (typeof s3 !== 'undefined')
            this.privates.left +=',' + QueryExpression.escape(s3);
        if (typeof s4 !== 'undefined')
            this.privates.left +=',' + QueryExpression.escape(s4);
        this.privates.left +=')';
        return this;
    }

    field(name) {
        return { "$name":name }
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    day(name) {
        this.privates.left = sprintf('day(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    hour(name) {
        this.privates.left = sprintf('hour(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    minute(name) {
        this.privates.left = sprintf('minute(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    month(name) {
        this.privates.left = sprintf('month(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    second(name) {
        this.privates.left = sprintf('second(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    year(name) {
        this.privates.left = sprintf('year(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    round(name) {
        this.privates.left = sprintf('round(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    floor(name) {
        this.privates.left = sprintf('floor(%s)',name);
        return this;
    }

    /**
     * @param {String} name
     * @returns OpenDataQuery
     */
    ceiling(name) {
        this.privates.left = sprintf('ceiling(%s)',name);
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    // noinspection JSUnusedGlobalSymbols
    notEqual(value) {
        this.privates.op = 'ne';this.privates.right = value; return this.append();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    greaterThan(value) {
        this.privates.op = 'gt';this.privates.right = value; return this.append();
    }

    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    greaterOrEqual(value) {
        this.privates.op = 'ge';this.privates.right = value; return this.append();
    }

    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    lowerThan(value) {
        this.privates.op = 'lt';this.privates.right = value; return this.append();
    }

    /**
     * @param {*} value
     * @returns OpenDataQuery
     */
    lowerOrEqual(value) {
        this.privates.op = 'le';this.privates.right = value; return this.append();
    }

    /**
     * @param {Array} values
     * @returns OpenDataQuery
     */
    in(values) {
        this.privates.op = 'in';this.privates.right = values; return this.append();
    }

    /**
     * @param {Array} values
     * @returns OpenDataQuery
     */
    notIn(values) {
        this.privates.op = 'nin';this.privates.right = values; return this.append();
    }
}

/**
 * @class
 */
export class QueryFieldRef {
    /**
     *
     * @param {string} entity
     * @param {string} name
     */
    constructor(entity, name) {
        this[entity] = [name];
    }
}

/**
 * @class
 */
export class QueryValuedRef {
    /**
     * @param value
     */
    constructor(value) {
        this.$value = value;
    }
}
