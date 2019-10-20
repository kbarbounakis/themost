/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
 
import _ from 'lodash';
import {Args} from '@themost/common';
import { QueryField } from './QueryField';
import { QueryEntity } from './QueryEntity';
import {getOwnPropertyName, isMethodOrNameReference} from './query';
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
            value: {}
        });
    }
    /**
     * @private
     * @param {string|*=} s
     * @returns {string|*}
     */
    prop(s) {
        if (typeof s === 'undefined') {
            return this.privates.property;
        }
        if (s == null) {
            delete this.privates.property;
        }
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
        if (!_.isNil(this.$expand)) {
            if (_.isArray(this.$expand))
                joins = this.$expand;
            else
                joins.push(this.$expand);
        }
        //get entity fields
        const fields = [];
        //get fields
        const re = QueryField.fieldNameExpression, arr = this.$select[entity] || [];
        _.forEach(arr, x => {
            if (typeof x === 'string') {
                re.lastIndex = 0;
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
            if (typeof this.$prepared === 'object') {
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
        if (!_.isNil(self.$expand)) {
            if (_.isArray(self.$expand))
                joins = self.$expand;
            else
                joins.push(self.$expand);
        }
        //search for fields
        if (_.isArray(self.$select[entity])) {
            if (self.$select[entity].length > 0)
                return true;
        }
        let result = false;
        //enumerate join fields
        _.forEach(joins, x => {
            const table = Object.key(x.$entity);
            if (_.isArray(x.$entity[table])) {
                if (x.$entity[table].length > 0)
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
     * Starts a comparison expression by assigning left operand
     * @param {*} field
     * @returns {QueryExpression}
     */
    where(field) {
        // set left operand
        this._where(field);
        // clear where expression
        delete this.$where;
        // and finally return this;
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
        if (prop === entity)
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
        arr.forEach(x => {
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
        if (this.privates.entity) {
            //initialize $select property
            this.$select = {};
            //and set array of fields
            this.$select[this.privates.entity] = fields;
        }
        else {
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
            name = entity.$as || entity.name;
            this.$ref = this.$ref || {};
            this.$ref[name] = entity;
        }
        else if (entity instanceof QueryExpression) {
            name = entity.$alias || "s0";
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
                obj.$as = alias;
        }
        this.privates.expand = { $entity: obj };
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
        if (obj instanceof QueryExpression) {
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
        arr.forEach(x => {
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
     * Helper function for setting in-process left operand
     * @param {*} field
     * @returns this
     * @private
     */
    _where(field) {
        if (field == null) {
            throw new Error('Left operand cannot be empty. Expected string or object.'); 
        }
        if (typeof field === 'string') {
            // set left operand
            this.privates.left = new QueryField(field);
        }
        else if (typeof field === 'object') {
            // if field is an instance of query field
            if (field instanceof QueryField) {
                // set left operand
                this.privates.left = field;
            }
            else {
                // otherwise convert object to query field
                this.privates.left = Object.assign(new QueryField(), field);
            }
        }
        else {
            throw new Error('Invalid left operand. Expected string or object.');
        }
        return this;
    }
    /**
     * @param {*} right
     * @private
     * @returns QueryExpression
     */
    _append(right) {
        let filter = { };
        Args.notNull(right, 'Right operand');
        // get left operand
        let left = this.privates.left;
        // validate left operand
        Args.notNull(left, 'Left operand');
        // get left operand (query field) name e.g. "name" or $concat etc
        const name = getOwnPropertyName(left);
        Args.notNull(name, 'Left operand name');
        // validate if left operand is a method reference
        const isMethod = isMethodOrNameReference(name);
        if (isMethod) {
            // generate an alias for left operand
            this.$addFields = this.$addFields || { };
            const alias = `add${Object.keys(this.$addFields).length + 1}`;
            // add field to $addFields collection
            Object.defineProperty(this.$addFields, alias, { 
                    value: left[name],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
                // set filter expression
                filter[alias] = right;
            
        } else  {
            // check if left operand is a single field expression (e.g { "dateCreated": 1 })
            if (left[name] === 1 || left[name] === 0) {
            // format expression e.g. { "price": { $eq: 500 } }
                filter[name] = right;
            }
            else {
                // [name] is an alias (e.g. { "createdAt" : "$dateCreated" } ) 
                // so add field to $addFields collection
                this.$addFields = this.$addFields || { };
                Object.defineProperty(this.$addFields, name, { 
                    value: left[name],
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
                filter[name] = right;
            }
        }
        
        if (this.$where == null) {
            this.$where = filter;
        }
        else {
            // get in-process logical operator
            const logicalOperator = this.privates.logicalOperator || '$and';
            //get where expression current operator
            const currentOperator = getOwnPropertyName(this.$where);
            if (currentOperator === logicalOperator) {
                // push filter expression
                this.$where[logicalOperator].push(filter);
            }
            else {
                // merge $where expression and current filter expression
                const newFilter = { };
                newFilter[logicalOperator] = [ this.$where, filter ];
                // set new filter
                this.$where = newFilter;
            }
        }
        delete this.privates.left;
        delete this.privates.expression;
        return this;
    }
    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    or(field) {
        // set left operand
        this._where(field);
        // set in-process logical operator
        this.privates.logicalOperator = '$or';
        return this;
    }
    /**
     * @param {*} field
     * @returns {QueryExpression}
     */
    and(field) {
        // set left operand
        this._where(field);
        // set in-process logical operator
        this.privates.logicalOperator = '$and';
        // and finally return this
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
        return this._append({ $eq: value });
    }

    eq(value) {
        return this.equal(value);
    }

    /**
     * Prepares a not equal expression.
     * @example
     * q.where('id').notEqual(10) //id<>10 expression
     * @param {*} value - A value that represents the right part of the prepared expression
     * @returns {QueryExpression}
     */
    notEqual(value) {
        return this._append({ $ne: value });
    }

    ne(value) {
        return this.notEqual(value);
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
            let comparison = { $in: values };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
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
            let comparison = { $nin: values };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], { $nin: values });
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
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
            let comparison = { $mod: [value, result] };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
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
            let comparison = { $bit: [value, result] };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
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
            let comparison = { $gt: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
        }
        return this;
    }

    gt(value) {
        return this.greaterThan(value);
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
            let comparison = { $regex: '^' + value, $options: 'i' };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], { $regex: '^' + value, $options: 'i' });
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
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
                throw new Error('Invalid argument. Expected string.');
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, { $regex: value + '$', $options: 'i' });
            this._append(expr);
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
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
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
            this._append(expr);
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
            let comparison = { $lt: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
        }
        return this;
    }

    lt(value) {
        return this.lowerThan(value);
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    lowerOrEqual(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $lte: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
        }
        return this;
    }

    lte(value) {
        return this.lowerOrEqual(value);
    }

    /**
     * @param value {*}
     * @returns {QueryExpression}
     */
    greaterOrEqual(value) {
        const p0 = this.prop();
        if (p0) {
            let comparison = { $gte: value };
            if (typeof this[aggregate] === 'object') {
                comparison = QueryFieldAggregator.prototype.wrapWith.call(this[aggregate], comparison);
                delete this[aggregate];
            }
            const expr = QueryFieldComparer.prototype.compareWith.call(p0, comparison);
            this._append(expr);
        }
        return this;
    }

    gte(value) {
        return this.greaterThan(value);
    }

    /**
     * @param {*} value1
     * @param {*} value2
     * @returns {QueryExpression}
     */
    between(value1, value2) {
        const p0 = this.prop();
        if (p0) {
            let comparison1 = { $gte: value1 }, comparison2 = { $lte: value2 };
            if (typeof this[aggregate] === 'object') {
                comparison1 = QueryFieldAggregator.prototype.wrapWith({ $gte: value1 });
                comparison2 = QueryFieldAggregator.prototype.wrapWith({ $lte: value2 });
                delete this[aggregate];
            }
            const comp1 = QueryFieldComparer.prototype.compareWith.call(p0, comparison1);
            const comp2 = QueryFieldComparer.prototype.compareWith.call(p0, comparison2);
            const expr = {};
            expr['$and'] = [comp1, comp2];
            this._append(expr);
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
        this[aggregate] = { $add: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number|*} x
     * @returns {QueryExpression}
     */
    subtract(x) {
        this[aggregate] = { $subtract: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number} x
     * @returns {QueryExpression}
     */
    multiply(x) {
        this[aggregate] = { $multiply: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number} x
     * @returns {QueryExpression}
     */
    divide(x) {
        this[aggregate] = { $divide: [x, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number=} n
     * @returns {QueryExpression}
     */
    round(n) {
        this[aggregate] = { $round: [n, new QueryParameter()] };
        return this;
    }
    /**
     * @param {number} start
     * @param {number=} length
     * @returns {QueryExpression}
     */
    substr(start, length) {
        this[aggregate] = { $substr: [start, length, new QueryParameter()] };
        return this;
    }
    /**
     * @param {string} s
     * @returns {QueryExpression}
     */
    indexOf(s) {
        this[aggregate] = { $indexOf: [s, new QueryParameter()] };
        return this;
    }
    /**
     * @param {string|*} s
     * @returns {QueryExpression}
     */
    concat(s) {
        this[aggregate] = { $concat: [s, new QueryParameter()] };
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
            case 'number': return val + '';
        }
        if (val instanceof Date) {
            const dt = new Date(val);
            const year = dt.getFullYear();
            const month = QueryExpression.zeroPad(dt.getMonth() + 1, 2);
            const day = QueryExpression.zeroPad(dt.getDate(), 2);
            const hour = QueryExpression.zeroPad(dt.getHours(), 2);
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
                return this.escape(val.valueOf());
        }
        val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, s => {
            switch (s) {
                case "\0": return "\\0";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\b": return "\\b";
                case "\t": return "\\t";
                case "\x1a": return "\\Z";
                default: return "\\" + s;
            }
        });
        return "'" + val + "'";
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
