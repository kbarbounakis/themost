/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import _ from "lodash";

import {QueryUtils} from '@themost/query/utils';
import async from "async";
import {DataError} from '@themost/common/errors';


/**
 * 
 * @param attr
 * @param event
 * @param callback
 * @returns {*}
 * @private
 */
function beforeSave_(attr, event, callback) {
    const context = event.model.context;
    const name = attr.property || attr.name;
    const key = event.model.getPrimaryKey();
    const nestedObj = event.target[name];
    //if attribute is null or undefined do nothing
    if (_.isNil(nestedObj)) {
        return callback();
    }
    //get target model
    const nestedModel = context.model(attr.type);
    if (_.isNil(nestedModel)) {
        return callback();
    }
    if (event.state===1) {
        //save nested object
        nestedModel.silent().save(nestedObj, err => {
            callback(err);
        });
    }
    else if (event.state === 2) {
        //first of all get original address from db
        event.model.where(key)
            .equal(event.target[key])
            .select(key,name)
            .silent()
            .first().then(result => {
                if (_.isNil(result)) { return callback(new Error('Invalid object state.')); }
            const nestedKey = nestedModel.getPrimaryKey();
                if (_.isNil(result[name])) {
                    //first of all delete nested object id (for insert)
                    delete nestedObj[nestedKey];
                    //save data
                    nestedModel.silent().save(nestedObj).then(() => {
                        return callback();
                    }).catch(err => {
                        return callback(err);
                    });
                }
                else {
                    //set nested object id (for update)
                    nestedObj[nestedKey] = result[name][nestedKey];
                    nestedModel.silent().save(nestedObj).then(() => {
                        return callback();
                    }).catch(err => {
                        return callback(err);
                    });
                }
        }).catch(err => {
            return callback(err);
        });
    }
    else {
        return callback();
    }
}

/**
 * 
 * @param attr
 * @param event
 * @param callback
 * @returns {*}
 * @private
 */
function beforeSaveMany_(attr, event, callback) {
    const context = event.model.context;
    const name = attr.property || attr.name;
    const key = event.model.getPrimaryKey();
    const nestedObj = event.target[name];
    //if attribute is null or undefined
    if (_.isNil(nestedObj)) {
        //do nothing
        return callback();
    }
    //if nested object is not an array
    if (!_.isArray(nestedObj)) {
        //throw exception
        return callback(new DataError("EJUNCT","Invalid argument type. Expected array.",null, event.model.name, name));
    }
    //if nested array does not have any data
    if (nestedObj.length===0) {
        //do nothing
        return callback();
    }
    //get target model
    const nestedModel = context.model(attr.type);
    //if target model cannot be found
    if (_.isNil(nestedModel)) {
        return callback();
    }
    //get nested primary key
    const nestedKey = nestedModel.getPrimaryKey();
    //on insert
    if (event.state===1) {
        //enumerate nested objects and set state to new
        _.forEach(nestedObj, x => {
            //delete identifier
            delete x[nestedKey];
            //force state to new ($state=1)
            x.$state = 1;
        });
        //save nested objects
        nestedModel.silent().save(nestedObj, err => {
            //remove $state attribute
            nestedObj.forEach(x => { delete x.$state; });
            //and return
            callback(err);
        });
    }
        //on update
    else if (event.state === 2) {
        //first of all get original associated object, if any
        event.model.where(key)
            .equal(event.target[key])
            .select(key,name)
            .expand(name)
            .silent()
            .first((err, result) => {
                if (err) { return callback(err); }
                //if original object cannot be found, throw an invalid state exception
                if (_.isNil(result)) { return callback(new Error('Invalid object state.')); }
                //get original nested objects
                const originalNestedObjects = result[name] || [];
                //enumerate nested objects

                _.forEach(nestedObj, x => {
                    const obj = _.find(originalNestedObjects, y => { return y[nestedKey] === x[nestedKey]; });
                    if (obj) {
                        //force state to update ($state=2)
                        x.$state = 2;
                    }
                    else {
                        //delete identifier
                        delete x[nestedKey];
                        //force state to new ($state=1)
                        x.$state = 1;
                    }
                });

                _.forEach(originalNestedObjects, x => {
                    const obj = _.find(nestedObj, y => {
                        return y[nestedKey] === x[nestedKey];
                    });
                    if (_.isNil(obj)) {
                        //force state to delete ($state=4)
                        x.$state = 4;
                        nestedObj.push(x);
                    }
                });

                //and finally save objects
                nestedModel.silent().save(nestedObj, err => {
                    //remove $state attribute
                    _.forEach(nestedObj, x => {
                        delete x.$state;
                    });
                    if (err) { return callback(err); }
                    return callback();
                });
            });
    }
    else {
        return callback();
    }
}


/**
 * @module @themost/data/data-nested-object-listener
 * @ignore
 */

/**
 * @class
 * @constructor
 */
class DataNestedObjectListener {
    /**
     * @param {DataEventArgs} event
     * @param {Function} callback
     */
    beforeSave(event, callback) {
        try {
            //get attributes with nested property set to on
            const nested = event.model.attributes.filter(x => {
                //only if these attributes belong to current model
                return x.nested && (x.model === event.model.name);
            });
            //if there are no attribute defined as nested do nothing
            if (nested.length === 0) { return callback(); }
            async.eachSeries(nested, (attr, cb) => {
                if (attr.many===true) {
                    return cb();
                }
                return beforeSave_(attr, event, cb);
            }, err => {
                return callback(err);
            });
        }
        catch (err) {
            return callback(err);
        }
    }

    beforeRemove(event, callback) {
        try {
            //get attributes with nested property set to on
            const nested = event.model.attributes.filter(x => {
                //only if these attributes belong to current model
                return x.nested && (x.model === event.model.name);
            });
            //if there are no attribute defined as nested, do nothing and exit
            if (nested.length === 0) { return callback(); }
            async.eachSeries(nested, (attr, cb) => {
                return beforeRemove_(attr, event, cb);
            }, err => {
                return callback(err);
            });
        }
        catch (err) {
            return callback(err);
        }
    }

    /**
     * @param {DataEventArgs} event
     * @param {Function} callback
     */
    afterSave(event, callback) {
        try {
            //get attributes with nested property set to on
            const nested = event.model.attributes.filter(x => {
                //only if these attributes belong to current model
                return x.nested && (x.model === event.model.name);
            });
            //if there are no attribute defined as nested do nothing
            if (nested.length === 0) {
                return callback();
            }
            async.eachSeries(nested, (attr, cb) => {
                // get mapping
                const mapping = event.model.inferMapping(attr.name);
                if (mapping && mapping.parentModel === event.model.name) {
                    // check constraints
                    const childModel = event.model.context.model(mapping.childModel);
                    // if child model was found
                    if (childModel &&
                        // has constraints
                        childModel.constraints &&
                        // constraints is not empty
                        childModel.constraints.length &&
                        // and there is a constraint that has one key and this key is the mapping child field
                        childModel.constraints.find(constraint => {
                            return constraint.fields && constraint.fields.length === 1 && constraint.fields.indexOf(mapping.childField) === 0;
                        })) {
                        // try to save one-to-one nested association where parent model is the current model
                        return afterSave_(attr, event, cb);
                    }
                }
                if (attr.many===true) {
                    return afterSaveMany_(attr, event, cb);
                }
                return cb();
            }, err => {
                return callback(err);
            });
        }
        catch (err) {
            return callback(err);
        }
    }
}

function beforeRemove_(attr, event, callback) {
    try {
        if (event.state !== 4) { return callback(); }
        const context = event.model.context;
        const name = attr.property || attr.name;
        const key = event.model.getPrimaryKey();
        /**
         * @type {DataModel}
         */
        const nestedModel = context.model(attr.type);
        if (_.isNil(nestedModel)) { return callback(); }
        event.model.where(key).equal(event.target[key]).select(key,name).flatten().silent().first((err, result) => {
            if (err) { return callback(err); }
            if (_.isNil(result)) { return callback(); }
            if (_.isNil(result[name])) { return callback(); }
            //set silent mode (if parent model is in silent mode)
            if (event.model.isSilent()) {
                nestedModel.silent();
            }
            const nestedKey =  result[name];
            //Update target object (remove the association between target object and nested object).
            //This operation must be done before trying to remove nested object otherwise the operation will fail with foreign key reference error
            const updated = {};
            updated[name] = null;
            const q = QueryUtils.update(event.model.sourceAdapter).set(updated).where(event.model.primaryKey).equal(result[event.model.primaryKey]);
            return context.db.execute(q, null, err => {
                if (err) {
                    return callback(err);
                }
                nestedModel.silent().remove({id:nestedKey}).then(() => {
                    return callback();
                }).catch(err => {
                    return callback(err);
                });
            });

        });
    }
    catch (err) {
        callback(err)
    }
}


// eslint-disable-next-line no-unused-vars
function beforeRemoveMany_(attr, event, callback) {
    try {
        if (event.state !== 4) { return callback(); }
        const context = event.model.context;
        const name = attr.property || attr.name;
        const nestedModel = context.model(attr.type);
        if (_.isNil(nestedModel)) { return callback(); }
        //get junction
        const junction = event.target.property(name);
        //select object identifiers (get all objects in silent mode to avoid orphaned objects)
        junction.select(nestedModel.getPrimaryKey()).silent().all().then(result => {
            //first of all remove all associations
            junction.clear(err => {
                if (err) { return callback(err); }
                //and afterwards remove nested objects
                nestedModel.silent().remove(result, err => {
                    if (err) { return callback(); }
                });
            });
        }).catch(err => {
           return callback(err);
        });
    }
    catch (err) {
        callback(err)
    }
}

/**
 * Handles after save event for one-to-one associations where the parent model is the current model.
 * This operation uses interactive user (or in-process) privileges for insert, update, delete
 * @param {DataField} attr
 * @param {DataEventArgs} event
 * @param {Function} callback
 * @returns {*}
 * @private
 */
function afterSave_(attr, event, callback) {
    // get context
    const context = event.model.context;
    // get attribute
    const name = attr.property || attr.name;
    // if target object does not have a property with the specified name
    if (event.target.hasOwnProperty(name) === false) {
        // return
        return callback();
    }
    // get nested object
    const nestedObject = event.target[name];
    //if attribute is null or undefined and state is insert
    if (nestedObject == null && event.state === 1) {
        //do nothing
        return callback();
    }
    /**
     * get nested model
     * @type {DataModel}
     */
    const nestedModel = context.model(attr.type);
    //if target model cannot be found
    if (_.isNil(nestedModel)) {
        // do nothing
        return callback();
    }
    // get mapping
    const mapping = event.model.inferMapping(attr.name);
    if (_.isNil(mapping)) {
        // throw error
        return callback(new DataError('EASSOCIATION','Association mapping may not be empty.', null, event.model.name, attr.name));
    }
    // check if mapping parent model is the same with event target model
    if (mapping.parentModel !== event.model.name) {
        // do nothing
        return callback();
    }
    // validate nested object
    if (_.isArray(nestedObject)) {
        // throw error for invalid nested object type
        return callback(new DataError('EASSOCIATION', 'Expected object.', null, event.model.name, name));
    }
    // get in-process silent mode
    const silent = event.model.isSilent();
    // get nested primary key
    const nestedKey = nestedModel.getPrimaryKey();
    if (nestedObject) {
        // safe delete identifier
        delete nestedObject[nestedKey];
        // set associated value
        nestedObject[mapping.childField] = event.target[mapping.parentField];
    }
    if (event.state === 1) {
        // save nested object (with interactive user privileges)
        return nestedModel.silent(silent).save(nestedObject).then(() => {
            // and return
            return callback();
        }).catch(err => {
            return callback(err);
        });
    }
    else if (event.state === 2) {
        if (nestedObject == null) {
            // try to find nested object
            return nestedModel.where(mapping.childField).equal(event.target[mapping.parentField])
                .silent().getItem().then(originalObject => {
                    if (originalObject) {
                        // try to remove (with interactive user privileges)
                        return nestedModel.silent(silent).remove(originalObject).then(() => {
                           // and return
                           return callback();
                        });
                    }
                    // else do nothing
                    return callback();
                }).catch(err => {
                    return callback(err);
                });
        }
        else {
            // update nested object (with interactive user privileges)
            return nestedModel.silent(silent).save(nestedObject).then(() => {
                // and return
                return callback();
            }).catch(err => {
                return callback(err);
            });
        }
    }
    // otherwise do nothing
    return callback();
}

function afterSaveMany_(attr, event, callback) {
    const context = event.model.context;
    const name = attr.property || attr.name;
    const key = event.model.getPrimaryKey();
    const nestedObj = event.target[name];
    //if attribute is null or undefined
    if (_.isNil(nestedObj)) {
        //do nothing
        return callback();
    }
    //if nested object is not an array
    if (!_.isArray(nestedObj)) {
        //throw exception
        return callback(new DataError("EASSOCIATION","Invalid argument type. Expected array.",null, event.model.name, name));
    }
    //get mapping
    const mapping = event.model.inferMapping(attr.name);
    if (_.isNil(mapping)) {
        return callback(new DataError('EASSOCIATION','Association mapping may not be empty.', null, event.model.name, attr.name));
    }
    if (mapping.associationType === 'junction') {
        return callback(new DataError('EASSOCIATION','Junction nested association type is not supported.', null, event.model.name, attr.name));
    }
    if (mapping.associationType === 'association' && mapping.parentModel !== event.model.name) {
        return callback(new DataError('EASSOCIATION','Invalid nested association type.', null, event.model.name, attr.name));
    }
    //get target model
    const nestedModel = context.model(attr.type);
    //if target model cannot be found
    if (_.isNil(nestedModel)) {
        return callback();
    }
    //get nested primary key
    const nestedKey = nestedModel.getPrimaryKey();
    //on insert
    if (event.state===1) {
        //enumerate nested objects and set state to new
        _.forEach(nestedObj, x => {
            //delete identifier
            delete x[nestedKey];
            //force state to new ($state=1)
            x.$state = 1;
            //set parent field for mapping
            x[mapping.childField] = event.target[mapping.parentField];
        });
        //save nested objects
        nestedModel.silent().save(nestedObj, err => {
            //remove $state attribute
            nestedObj.forEach(x => { delete x.$state; });
            //and return
            callback(err);
        });
    }
    //on update
    else if (event.state === 2) {
        //first of all get original associated object, if any
        event.model.where(key)
            .equal(event.target[key])
            .select(key,name)
            .expand(name)
            .silent()
            .first((err, result) => {
                if (err) { return callback(err); }
                //if original object cannot be found, throw an invalid state exception
                if (_.isNil(result)) { return callback(new Error('Invalid object state.')); }
                //get original nested objects
                const originalNestedObjects = result[name] || [];
                //enumerate nested objects

                _.forEach(nestedObj, x => {
                    const obj = _.find(originalNestedObjects, y => {
                        return y[nestedKey] === x[nestedKey];
                    });
                    if (obj) {
                        //force state to update ($state=2)
                        x.$state = 2;
                    }
                    else {
                        //delete identifier
                        delete x[nestedKey];
                        //force state to new ($state=1)
                        x.$state = 1;
                    }
                    x[mapping.childField] = event.target[mapping.parentField];
                });

                _.forEach(originalNestedObjects, x => {
                    const obj = _.find(nestedObj, y => {
                        return y[nestedKey] === x[nestedKey];
                    });
                    if (_.isNil(obj)) {
                        //force state to delete ($state=4)
                        x.$state = 4;
                        nestedObj.push(x);
                    }
                });

                //and finally save objects
                nestedModel.silent().save(nestedObj, err => {
                    //remove $state attribute
                    _.remove(nestedObj, y => {
                       return y.$state === 4;
                    });
                    _.forEach(nestedObj, x => {
                        delete x.$state;
                    });
                    if (err) { return callback(err); }
                    return callback();
                });
            });
    }
    else {
        return callback();
    }
}


if (typeof exports !== 'undefined')
{
    module.exports.DataNestedObjectListener = DataNestedObjectListener;
}
