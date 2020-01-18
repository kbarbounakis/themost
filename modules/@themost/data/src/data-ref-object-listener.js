/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import async from 'async';
import {HasParentJunction} from './has-parent-junction';
import {DataObjectJunction} from './data-object-junction';
import {DataError} from '@themost/common';
import _ from 'lodash';

/**
 * @class
 * @constructor
 */
class DataReferencedObjectListener {
    /**
     * @param {DataEventArgs} event
     * @param {function(Error=)} callback
     */
    beforeRemove(event, callback) {
        return event.model.getReferenceMappings(false).then(mappings => {
            async.eachSeries(mappings,
                /**
                 * @param {DataAssociationMapping} mapping
                 * @param {Function} cb
                 */
                (mapping, cb) => {
                    if (mapping.associationType === 'association') {
                        return beforeRemoveAssociatedObjects(event, mapping, cb);
                    }
                    else if (mapping.associationType === 'junction' && mapping.parentModel === event.model.name) {
                        return beforeRemoveChildConnectedObjects(event, mapping, cb);
                    }
                    else if (mapping.associationType === 'junction' && mapping.childModel === event.model.name) {
                        return beforeRemoveParentConnectedObjects(event, mapping, cb);
                    }
                    else {
                        return cb();
                    }
                }, err => {
                    callback(err);
                });
        }).catch(err => {
            return callback(err);
        });
    }
}

/**
 * @private
 * @param {DataEventArgs} event
 * @param {DataAssociationMapping} mapping
 * @param {Function} callback
 */
function beforeRemoveAssociatedObjects(event, mapping, callback) {
    if (mapping.associationType !== 'association') {
        return callback(new TypeError('Invalid association type. Expected a valid foreign key association.'));
    }
    if (mapping.parentModel !== event.model.name) {
        return callback(new TypeError('Invalid association type. Expected a valid referenced key association.'));
    }
    const context = event.model.context;
    const parentModel = event.model;
    const silent = event.model.$silent;
    const target = event.model.convert(event.target);
    const childModel = context.model(mapping.childModel);
    const parentField = event.model.getAttribute(mapping.parentField);
    const childField = childModel.getAttribute(mapping.childField);
    parentModel.where(parentModel.primaryKey).equal(target[parentModel.primaryKey])
        .select(parentField.name).silent().flatten().value()
        .then(parentKey => {
            if (_.isNil(parentKey)) {
                return callback();
            }
            return childModel.where(mapping.childField).equal(parentKey).count().then(count => {
                if (count>0) {
                    mapping.cascade = mapping.cascade || 'none';
                    if (mapping.cascade === 'none') {
                        return callback(new DataError('EFKEY','Cannot delete this object since it is being referenced by another entity.',null,childModel.name, childField.name));
                    }
                    else if (mapping.cascade === 'null' || mapping.cascade === 'default') {
                        return childModel.where(mapping.childField).equal(target[mapping.parentField])
                            .select(childModel.primaryKey, childModel.childField)
                            .silent()
                            .flatten()
                            .all().then(items => {
                                const childKey = childField.property || childField.name;
                                _.forEach(items, x => {
                                    if (x.hasOwnProperty(childKey)) {
                                        x[childKey] = null;
                                    }
                                    else {
                                        x[childKey] = null;
                                    }
                                });
                                return childModel.silent(silent).save(items).then(() => {
                                    return callback();
                                });
                            });
                    }
                    else if (mapping.cascade === 'delete') {
                        return childModel.where(mapping.childField).equal(target[mapping.parentField])
                            .select(childModel.primaryKey)
                            .silent()
                            .flatten()
                            .all().then(items => {
                                return childModel.silent(silent).remove(items).then(() => {
                                    return callback();
                                });
                            });
                    }
                    else {
                        return callback(new DataError('EATTR', 'Invalid cascade action', childModel.name, childField.name));
                    }
                }
                else {
                    return callback();
                }
            });
        }).catch(err => {
        return callback(err);
    });
}
/**
 * @private
 * @param {DataEventArgs} event
 * @param {DataAssociationMapping} mapping
 * @param {Function} callback
 */
function beforeRemoveParentConnectedObjects(event, mapping, callback) {
    if (mapping.associationType !== 'junction') {
        return callback(new TypeError('Invalid association type. Expected a valid junction.'));
    }
    if (mapping.childModel !== event.model.name) {
        return callback();
    }
    const childModel = event.model;
    const silent = event.model.$silent;
    const target = event.model.convert(event.target);
    const childField = childModel.getAttribute(mapping.childField);
    const junction = new DataObjectJunction(target, mapping);
    return childModel.where(childModel.primaryKey).equal(target.getId())
        .select(childField.name).silent().flatten().value()
        .then(childKey => {
            if (_.isNil(childKey)) {
                return callback();
            }
            const baseModel = junction.getBaseModel();
            baseModel.where(junction.getValueField()).equal(childKey)
                .select(baseModel.primaryKey)
                .silent()
                .all().then(items => {
                mapping.cascade = mapping.cascade || 'none';
                if (mapping.cascade === 'none') {
                    if (items.length === 0) {
                        return callback();
                    }
                    return callback(new DataError('EFKEY','Cannot delete this object since it is being referenced by another entity.',null,childModel.name, childField.name));
                }
                else if (mapping.cascade === 'delete'  || mapping.cascade === 'null' || mapping.cascade === 'default') {
                    return baseModel.silent(silent).remove(items).then(() => {
                        return callback();
                    });
                }
                else {
                    return callback(new DataError('EATTR', 'Invalid cascade action', childModel.name, childField.name));
                }

            }).catch(err => {
                return callback(err);
            });
        });
}

/**
 * @private
 * @param {DataEventArgs} event
 * @param {DataAssociationMapping} mapping
 * @param {Function} callback
 */
function beforeRemoveChildConnectedObjects(event, mapping, callback) {
    const context = event.model.context;
    if (mapping.associationType !== 'junction') {
        return callback(new TypeError('Invalid association type. Expected a valid junction.'));
    }
    if (mapping.parentModel !== event.model.name) {
        return callback();
    }
    const childModel = context.model(mapping.childModel);
    const silent = event.model.$silent;
    const target = event.model.convert(event.target);
    const parentModel =  event.model;
    const parentField = parentModel.getAttribute(mapping.parentField);
    const junction = new HasParentJunction(target, mapping);
    return parentModel.where(parentModel.primaryKey).equal(target.getId())
        .select(parentField.name).silent().flatten().value()
        .then(parentKey => {
            if (_.isNil(parentKey)) {
                return callback();
            }
            const baseModel = junction.getBaseModel();
            baseModel.where(junction.getObjectField()).equal(parentKey)
                .select(baseModel.primaryKey)
                .silent()
                .all().then(items => {
                mapping.cascade = mapping.cascade || 'none';
                if (mapping.cascade === 'none') {
                    if (items.length===0) {
                        return callback();
                    }
                    return callback(new DataError('EFKEY','Cannot delete this object since it is being referenced by another entity.',null,parentModel.name, parentField.name));
                }
                else if (mapping.cascade === 'delete'  || mapping.cascade === 'null' || mapping.cascade === 'default') {
                    if (items.length===0) {
                        return callback();
                    }
                    return baseModel.silent(silent).remove(items).then(() => {
                        return callback();
                    });
                }
                else {
                    return callback(new DataError('EATTR', 'Invalid cascade action', parentModel.name, parentField.name));
                }

            }).catch(err => {
                return callback(err);
            });
        });
}

export {DataReferencedObjectListener};