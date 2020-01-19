/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import {QueryEntity, QueryUtils} from '@themost/query';
import async from 'async';
import {AccessDeniedError} from '@themost/common';
import {DataConfigurationStrategy} from './DataConfiguration';
import _ from 'lodash';
import {DataCacheStrategy} from './DataCache';
import Q from 'q';
/**
 * @class
 * @constructor
 * @private
 * @ignore
 */
function EachSeriesCancelled() {
    //
}

/**
 * @class
 * @constructor
 */
function DataPermissionEventArgs() {
    /**
     * The target data model
     * @type {DataModel}
     */
    this.model = null;
    /**
     * The underlying query expression
     * @type {QueryExpression}
     */
    this.query = null;
    /**
     * The permission mask
     * @type {Number}
     */
    this.mask = null;
    /**
     * The query type
     * @type {String}
     */
    this.type = null;
    /**
     * The query type
     * @type {String}
     */
    this.privilege = null;
    /**
     * The data queryable object that emits the event.
     * @type {DataQueryable|*}
     */
    this.emitter = null;
}
/**
 * An enumeration of the available permission masks
 * @enum {number}
 */
function PermissionMask() {

}

/**
 * Read Access Mask (1)
 * @type {number}
 */
PermissionMask.Read = 1;
/**
 * Create Access Mask (2)
 * @type {number}
 */
PermissionMask.Create = 2;
/**
 * Update Access Mask (4)
 * @type {number}
 */
PermissionMask.Update = 4;
/**
 * Delete Access Mask (8)
 * @type {number}
 */
PermissionMask.Delete = 8;
/**
 * Execute Access Mask (16)
 * @type {number}
 */
PermissionMask.Execute = 16;
/**
 * Full Access Mask (31)
 * @type {number}
 */
PermissionMask.Owner = 31;

/**
 * @class
 * @constructor
 */
class DataPermissionEventListener {
    /**
     * Occurs before creating or updating a data object.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeSave(event, callback) {
        DataPermissionEventListener.prototype.validate(event, callback);
    }

    /**
     * Occurs before removing a data object.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     * @returns {DataEventListener}
     */
    beforeRemove(event, callback) {
        DataPermissionEventListener.prototype.validate(event, callback);
    }

    /**
     * Validates permissions against the event arguments provided.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    validate(event, callback) {
        const model = event.model;
        /**
         * @type {DataContext|*}
         */
        const context = event.model.context;
        let requestMask = 1;
        const workspace = 1;
        //ensure silent operation
        if (event.model && event.model.$silent) {
            return callback();
        }
        if (event.state === 0)
            requestMask = PermissionMask.Read;
        else if (event.state === 1)
            requestMask = PermissionMask.Create;
        else if (event.state === 2)
            requestMask = PermissionMask.Update;
        else if (event.state === 4)
            requestMask = PermissionMask.Delete;
        else if (event.state === 16)
            requestMask = PermissionMask.Execute;
        else {
            callback(new Error('Target object has an invalid state.'));
            return;
        }
        //validate throwError
        if (typeof event.throwError === 'undefined')
            event.throwError = true;
        context.user = context.user || { name:'anonymous',authenticationType:'None' };
        //change: 2-May 2015
        //description: Use unattended execution account as an escape permission check account
        const authSettings = context.getConfiguration().getStrategy(DataConfigurationStrategy).getAuthSettings();
        if (authSettings)
        {
            const unattendedExecutionAccount=authSettings.unattendedExecutionAccount;
            if ((typeof unattendedExecutionAccount !== 'undefined'
                || unattendedExecutionAccount != null)
                && (unattendedExecutionAccount===context.user.name))
            {
                event.result = true;
                callback();
                return;
            }
        }

        //get user key
        const users = context.model('User');

        const permissions = context.model('Permission');
        if (_.isNil(users)) {
            //do nothing
            callback();
            return;
        }
        if (_.isNil(permissions)) {
            //do nothing
            callback();
            return;
        }

        effectiveAccounts(context, (err, accounts) => {
            if (err) { callback(err); return; }

            const permEnabled = model.privileges.filter(x => { return !x.disabled; }, model.privileges).length>0;
            //get all enabled privileges
            const privileges = model.privileges.filter(x => { return !x.disabled && ((x.mask & requestMask) === requestMask) });
            if (privileges.length===0) {
                if (event.throwError) {
                    //if the target model has privileges but it has no privileges with the requested mask
                    if (permEnabled) {
                        //throw error
                        const error = new Error('Access denied.');
                        error.statusCode = 401;
                        callback(error);
                    }
                    else {
                        //do nothing
                        callback(null);
                    }
                }
                else {
                    //set result to false (or true if model has no privileges at all)
                    event.result = !permEnabled;
                    //and exit
                    callback(null);
                }
            }
            else {
                let cancel = false;
                event.result = false;
                //enumerate privileges
                async.eachSeries(privileges, (item, cb) => {
                    if (cancel) {
                        cb(null);
                        return;
                    }
                    //global
                    if (item.type==='global') {
                        if (typeof item.account !== 'undefined') {
                            //check if a privilege is assigned by the model
                            if (item.account==='*') {
                                //get permission and exit
                                cancel=true;
                                event.result = true;
                                return cb();
                            }
                            else if (item.hasOwnProperty('account')) {
                                if (accounts.findIndex(x => { return x.name === item.account })>=0) {
                                    cancel=true;
                                    event.result = true;
                                    return cb();
                                }
                            }
                        }
                        //try to find user has global permissions assigned
                        permissions.where('privilege').equal(model.name).
                            and('parentPrivilege').equal(null).
                            and('target').equal('0').
                            and('workspace').equal(workspace).
                            and('account').in(accounts.map(x => { return x.id; })).
                            and('mask').bit(requestMask, requestMask).silent().count((err, count) => {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    if (count>=1) {
                                        cancel=true;
                                        event.result = true;
                                    }
                                    cb(null);
                                }
                            });
                    }
                    else if (item.type==='parent') {
                        const mapping = model.inferMapping(item.property);
                        if (!mapping) {
                            cb(null);
                            return;
                        }
                        if (requestMask===PermissionMask.Create) {
                            permissions.where('privilege').equal(mapping.childModel).
                                and('parentPrivilege').equal(mapping.parentModel).
                                and('target').equal(event.target[mapping.childField]).
                                and('workspace').equal(workspace).
                                and('account').in(accounts.map(x => { return x.id; })).
                                and('mask').bit(requestMask, requestMask).silent().count((err, count) => {
                                    if (err) {
                                        cb(err);
                                    }
                                    else {
                                        if (count>=1) {
                                            cancel=true;
                                            event.result = true;
                                        }
                                        cb(null);
                                    }
                                });
                        }
                        else {
                            //get original value
                            model.where(model.primaryKey).equal(event.target[model.primaryKey]).select(mapping.childField).first((err, result) => {
                                if (err) {
                                    cb(err);
                                }
                                else if (result) {
                                    permissions.where('privilege').equal(mapping.childModel).
                                        and('parentPrivilege').equal(mapping.parentModel).
                                        and('target').equal(result[mapping.childField]).
                                        and('workspace').equal(workspace).
                                        and('account').in(accounts.map(x => { return x.id; })).
                                        and('mask').bit(requestMask, requestMask).silent().count((err, count) => {
                                            if (err) {
                                                cb(err);
                                            }
                                            else {
                                                if (count>=1) {
                                                    cancel=true;
                                                    event.result = true;
                                                }
                                                cb(null);
                                            }
                                        });
                                }
                                else {
                                    cb(null);
                                }
                            });
                        }
                    }
                    else if (item.type==='item') {
                        //if target object is a new object
                        if (requestMask===PermissionMask.Create) {
                            //do nothing
                            cb(null); return;
                        }
                        permissions.where('privilege').equal(model.name).
                            and('parentPrivilege').equal(null).
                            and('target').equal(event.target[model.primaryKey]).
                            and('workspace').equal(workspace).
                            and('account').in(accounts.map(x => { return x.id; })).
                            and('mask').bit(requestMask, requestMask).silent().count((err, count) => {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    if (count>=1) {
                                        cancel=true;
                                        event.result = true;
                                    }
                                    cb(null);
                                }
                            });
                    }
                    else if (item.type==='self') {
                        // check if the specified privilege has account attribute
                        if (typeof item.account !== 'undefined' && item.account !== null && item.account !== '*') {
                            // if user does not have this account return
                            if (accounts.findIndex(x => { return x.name === item.account; }) < 0) {
                                return cb();
                            }
                        }
                        if (requestMask===PermissionMask.Create) {
                            const query = QueryUtils.query(model.viewAdapter);
                            const fields=[];
                            let field;

                            //cast target
                            let name;

                            const obj = event.target;
                            model.attributes.forEach(x => {
                                name = obj.hasOwnProperty(x.property) ? x.property : x.name;
                                if (obj.hasOwnProperty(name))
                                {
                                    const mapping = model.inferMapping(name);
                                    if (_.isNil(mapping)) {
                                        field = {};
                                        field[x.name] = { $value: obj[name] };
                                        fields.push(field);
                                    }
                                    else if ((mapping.associationType==='association') && (mapping.childModel===model.name)) {
                                        if (typeof obj[name] === 'object' && obj[name] !== null) {
                                            //set associated key value (event.g. primary key value)
                                            field = {};
                                            field[x.name] = { $value: obj[name][mapping.parentField] };
                                            fields.push(field);
                                        }
                                        else {
                                            //set raw value
                                            field = {};
                                            field[x.name] = { $value: obj[name] };
                                            fields.push(field);
                                        }
                                    }
                                }
                            });
                            //add fields
                            query.select(fields);
                            //set fixed query
                            query.$fixed = true;
                            model.filter(item.filter, (err, q) => {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    //set where from DataQueryable.query
                                    query.$where = q.query.$prepared;
                                    query.$expand = q.query.$expand;
                                    model.context.db.execute(query,null, (err, result) => {
                                        if (err) {
                                            cb(err);
                                        }
                                        else {
                                            if (result.length===1) {
                                                cancel=true;
                                                event.result = true;
                                            }
                                            cb(null);
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            //get privilege filter
                            model.filter(item.filter, (err, q) => {
                                if (err) {
                                    cb(err);
                                }
                                else {
                                    //prepare query and append primary key expression
                                    q.where(model.primaryKey).equal(event.target[model.primaryKey]).silent().count((err, count) => {
                                        if (err) { cb(err); return; }
                                        if (count>=1) {
                                            cancel=true;
                                            event.result = true;
                                        }
                                        cb(null);
                                    })
                                }
                            });
                        }
                    }
                    else {
                        //do nothing (unknown permission)
                        cb(null);
                    }

                }, err => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (event.throwError && !event.result) {
                            const error = new AccessDeniedError();
                            error.model = model.name;
                            callback(error);
                        }
                        else {
                            callback(null);
                        }
                    }
                });
            }

        });
    }

    /**
     * Occurs before executing a data operation.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeExecute(event, callback) {
        if (_.isNil(event.model)) {
            return callback();
        }
        //ensure silent query operation
        if (event.emitter && event.emitter.$silent) {
            callback();
            return;
        }
        const model = event.model;
        /**
         * @type {DataContext|*}
         */
        const context = event.model.context;
        let requestMask = 1;
        const workspace = 1;
        let privilege = model.name;
        let parentPrivilege = null;
        //get privilege from event arguments if it's defined (event.g. the operation requests execute permission User.ChangePassword where
        // privilege=ChangePassword and parentPrivilege=User)
        if (event.privilege) {
            //event argument is the privilege
            privilege = event.privilege;
            //and model is the parent privilege
            parentPrivilege = model.name;
        }
        //do not check permissions if the target model has no privileges defined
        if (model.privileges.filter(x => { return !x.disabled; }, model.privileges).length===0) {
            callback(null);
            return;
        }
        //infer permission mask
        if (typeof event.mask !== 'undefined') {
            requestMask = event.mask;
        }
        else {
            if (event.query) {
                //infer mask from query type
                if (event.query.$select)
                //read permissions
                    requestMask=1;
                else if (event.query.$insert)
                //create permissions
                    requestMask=2;
                else if (event.query.$update)
                //update permissions
                    requestMask=4;
                else if (event.query.$delete)
                //delete permissions
                    requestMask=8;
            }
        }
        //ensure context user
        context.user = context.user || { name:'anonymous',authenticationType:'None' };
        //change: 2-May 2015
        //description: Use unattended execution account as an escape permission check account
        const authSettings = context.getConfiguration().getStrategy(DataConfigurationStrategy).getAuthSettings();
        if (authSettings)
        {
            const unattendedExecutionAccount=authSettings.unattendedExecutionAccount;
            if ((typeof unattendedExecutionAccount !== 'undefined'
                || unattendedExecutionAccount !== null)
                && (unattendedExecutionAccount===context.user.name))
            {
                callback();
                return;
            }
        }
        if (event.query) {
            //get user key
            const users = context.model('User');

            const permissions = context.model('Permission');
            if (_.isNil(users)) {
                //do nothing
                callback(null);
                return;
            }
            if (_.isNil(permissions)) {
                //do nothing
                callback(null);
                return;
            }
            //get model privileges
            const modelPrivileges = model.privileges || [];
            //if model has no privileges defined
            if (modelPrivileges.length===0) {
                //do nothing
                callback(null);
                //and exit
                return;
            }
            //tuning up operation
            //validate request mask permissions against all users privilege { mask:<requestMask>,disabled:false,account:"*" }
            const allUsersPrivilege = modelPrivileges.find(x => {
                return (((x.mask & requestMask)===requestMask) && !x.disabled && (x.account==='*'));
            });
            if (typeof allUsersPrivilege !== 'undefined') {
                //do nothing
                callback(null);
                //and exit
                return;
            }

            effectiveAccounts(context, (err, accounts) => {
                if (err) { callback(err); return; }
                //get all enabled privileges
                const privileges = modelPrivileges.filter(x => {
                    return !x.disabled && ((x.mask & requestMask) === requestMask);
                });

                // set query lastIndex
                event.query.$lastIndex = parseInt(event.query.$lastIndex) || 0;
                let cancel = false;
                let assigned = false;
                const entity = new QueryEntity(model.viewAdapter);
                let expand = null;
                const perms1 = new QueryEntity(permissions.viewAdapter).as(permissions.viewAdapter + event.query.$lastIndex.toString());
                let expr = null;
                async.eachSeries(privileges, (item, cb) => {
                    if (cancel) {
                        return cb();
                    }
                    try {
                        if (item.type==='global') {
                            //check if a privilege is assigned by the model
                            if (item.account==='*') {
                                //get permission and exit
                                assigned=true;
                                return cb(new EachSeriesCancelled());
                            }
                            else if (item.hasOwnProperty('account')) {
                                if (accounts.findIndex(x => { return x.name === item.account })>=0) {
                                    assigned=true;
                                    return cb(new EachSeriesCancelled());
                                }
                            }
                            //try to find user has global permissions assigned
                            permissions.where('privilege').equal(model.name).
                                and('parentPrivilege').equal(null).
                                and('target').equal('0').
                                and('workspace').equal(1).
                                and('account').in(accounts.map(x => { return x.id; })).
                                and('mask').bit(requestMask, requestMask).silent().count((err, count) => {
                                    if (err) {
                                        cb(err);
                                    }
                                    else {
                                        if (count>=1) {
                                            assigned=true;
                                            return cb(new EachSeriesCancelled());
                                        }
                                        cb();
                                    }
                                });
                        }
                        else if (item.type==='parent') {
                            //get field mapping
                            const mapping = model.inferMapping(item.property);
                            if (!mapping) {
                                return cb();
                            }
                            if (_.isNil(expr))
                                expr = QueryUtils.query();
                            expr.where(entity.select(mapping.childField)).equal(perms1.select('target')).
                                and(perms1.select('privilege')).equal(mapping.childModel).
                                and(perms1.select('parentPrivilege')).equal(mapping.parentModel).
                                and(perms1.select('workspace')).equal(workspace).
                                and(perms1.select('mask')).bit(requestMask,requestMask).
                                and(perms1.select('account')).in(accounts.map(x => { return x.id; })).prepare(true);
                            assigned=true;
                            cb();
                        }
                        else if (item.type==='item') {
                            if (_.isNil(expr))
                                expr = QueryUtils.query();
                            expr.where(entity.select(model.primaryKey)).equal(perms1.select('target')).
                                and(perms1.select('privilege')).equal(model.name).
                                and(perms1.select('parentPrivilege')).equal(null).
                                and(perms1.select('workspace')).equal(workspace).
                                and(perms1.select('mask')).bit(requestMask, requestMask).
                                and(perms1.select('account')).in(accounts.map(x => { return x.id; })).prepare(true);
                            assigned=true;
                            cb();
                        }
                        else if (item.type==='self') {
                            // check if the specified privilege has account attribute
                            if (typeof item.account !== 'undefined' && item.account !== null && item.account !== '*') {
                                // if user does not have this account return
                                if (accounts.findIndex(x => { return x.name === item.account; }) < 0) {
                                    return cb();
                                }
                            }
                            if (typeof item.filter === 'string' ) {
                                model.filter(item.filter, (err, q) => {
                                    if (err) {
                                        cb(err);
                                    }
                                    else {
                                        if (q.query.$prepared) {
                                            if (_.isNil(expr))
                                                expr = QueryUtils.query();
                                            expr.$where = q.query.$prepared;
                                            if (q.query.$expand) { expand = q.query.$expand; }
                                            expr.prepare(true);
                                            assigned=true;
                                            cb();
                                        }
                                        else
                                            cb();
                                    }
                                });
                            }
                            else {
                                cb();
                            }
                        }
                        else {
                            cb();
                        }
                    }
                    catch (e) {
                        cb(e);
                    }
                }, err => {
                    if (err) {
                        cancel = (err instanceof EachSeriesCancelled);
                        if (!cancel) {
                            return callback(err);
                        }
                    }
                    if (!assigned) {
                        //prepare no access query
                        event.query.prepare();
                        //add no record parameter
                        event.query.where(event.model.fieldOf(event.model.primaryKey)).equal(null).prepare();
                        return callback();
                    }
                    else if (expr) {
                        return context.model('Permission').migrate(err => {
                            if (err) { return callback(err); }
                            const q = QueryUtils.query(model.viewAdapter).select([model.primaryKey]).distinct();
                            if (expand) {
                                const arrExpand=[].concat(expand);
                                _.forEach(arrExpand, x => {
                                    q.join(x.$entity).with(x.$with);
                                });
                            }
                            q.join(perms1).with(expr);
                            // set static alias
                            event.query.$lastIndex += 1;
                            const pqAlias = context.model('Permission').viewAdapter + event.query.$lastIndex.toString();
                            event.query.join(q.as(pqAlias)).with(QueryUtils.where(entity.select(model.primaryKey)).equal(new QueryEntity(pqAlias).select(model.primaryKey)));
                            return callback();
                        });
                    }
                    return callback();

                });
            });
        }
        else {
            callback();
        }
    }
}

/**
 * @private
 * @type {string}
 */
const ANONYMOUS_USER_CACHE_PATH = '/User/anonymous';
/**
 * @param {DataContext} context
 * @param {function(Error=,*=)} callback
 * @private
 */
function anonymousUser(context, callback) {
    queryUser(context, 'anonymous', (err, result) => {
        if (err) {
            callback(err);
        }
        else {
            callback(null, result || { id:null, name:'anonymous', groups:[], enabled:false});
        }
    });
}
/**
 *
 * @param {DataContext} context
 * @param {string} username
 * @param {function(Error=,*=)} callback
 * @private
 */
function queryUser(context, username, callback) {
    try {
        if (_.isNil(context)) {
            return callback();
        }
        const users = context.model('User');
        if (_.isNil(users)) {
            return callback();
        }
        users.where('name').equal(username).silent().select('id','name').expand('groups').getTypedItem().then(result => {
            return callback(null, result);
        }).catch(err => {
            return callback(err);
        });
    }
    catch (err) {
        callback(err);
    }
}
/**
 * @param {DataContext} context
 * @param {function(Error=,Array=)} callback
 * @private
 */
function effectiveAccounts(context, callback) {
    if (_.isNil(context)) {
        //push no account
        return callback(null, [ { id: null } ]);
    }

    /**
     * @type {DataCacheStrategy}
     */
    const cache = context.getConfiguration().getStrategy(DataCacheStrategy);
    /**
     * Gets or sets an object that represents the user of the current data context.
     * @property {*|{name: string, authenticationType: string}}
     * @name DataContext#user
     * @memberof DataContext
     */
    context.user = context.user || { name:'anonymous',authenticationType:'None' };
    context.user.name = context.user.name || 'anonymous';
    //if the current user is anonymous
    if (context.user.name === 'anonymous') {
        //get anonymous user data
        cache.getOrDefault(ANONYMOUS_USER_CACHE_PATH, () => {
            return Q.nfbind(anonymousUser)(context);
        }).then(result => {
            const arr = [];
            if (result) {
                arr.push({ 'id': result.id, 'name': result.name });
                result.groups = result.groups || [];
                result.groups.forEach(x => { arr.push({ 'id': x.id, 'name': x.name }); });
            }
            if (arr.length===0)
                arr.push({ id: null });
            return callback(null, arr);
        }).catch(err => {
            return callback(err);
        });
    }
    else {
        //try to get data from cache
        const USER_CACHE_PATH = '/User/' + context.user.name;

        cache.getOrDefault(USER_CACHE_PATH, () => {
            return Q.nfbind(queryUser)(context, context.user.name);
        }).then(user => {
            return cache.getOrDefault(ANONYMOUS_USER_CACHE_PATH, () => {
                return Q.nfbind(anonymousUser)(context);
            }).then(anonymous => {
                const arr = [ ];
                if (user) {
                    arr.push({ 'id': user.id, 'name': user.name });
                    if (_.isArray(user.groups))
                        user.groups.forEach(x => { arr.push({ 'id': x.id, 'name': x.name }); });
                }
                if (anonymous) {
                    arr.push({ 'id': anonymous.id, 'name': 'anonymous' });
                    if (_.isArray(anonymous.groups))
                        anonymous.groups.forEach(x => { arr.push({ 'id': x.id, 'name': x.name }); });
                }
                if (arr.length===0)
                    arr.push({ id: null });
                return callback(null, arr);
            });
        }).catch(err => {
            return callback(err);
        });
    }
}

export {DataPermissionEventArgs, DataPermissionEventListener, PermissionMask}

