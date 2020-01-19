/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {parsers} from './types';
import async from 'async';
import { DataError } from '@themost/common';
import _ from 'lodash';

const parseBoolean = parsers.parseBoolean;

class DataObjectAssociationListener {
    /**
     *
     * @param {DataEventArgs} event
     * @param {function(Error=)} callback
     */
    beforeSave(event, callback) {
        try {
            if (_.isNil(event.target)) {
                return callback();
            }
            else {
                const keys = Object.keys(event.target);
                const mappings = [];
                keys.forEach(x => {
                    if (Object.prototype.hasOwnProperty.call(event.target, x) && typeof event.target[x] === 'object' && event.target[x] !== null) {
                        //try to find field mapping, if any
                        const mapping = event.model.inferMapping(x);
                        if (mapping && mapping.associationType === 'association' && mapping.childModel === event.model.name)
                            mappings.push(mapping);
                    }
                });
                async.eachSeries(mappings,
                    /**
                     * @param {DataAssociationMapping} mapping
                     * @param {function(Error=)} cb
                     */
                    (mapping, cb) => {
                        if (mapping.associationType === 'association' && mapping.childModel === event.model.name) {
                            /**
                             * @type {DataField|*}
                             */
                            const field = event.model.field(mapping.childField);
                            const childField = field.property || field.name;
                            //foreign key association
                            if (typeof event.target[childField] !== 'object') {
                                return cb();
                            }
                            if (Object.prototype.hasOwnProperty.call(event.target[childField], mapping.parentField)) {
                                return cb();
                            }
                            //change:21-Mar 2016
                            //description: check if association belongs to this model or it's inherited from any base model
                            //if current association belongs to base model
                            if ((event.model.name !== field.model) && (!parseBoolean(field.cloned))) {
                                //do nothing and exit
                                return cb();
                            }
                            //get associated mode
                            const associatedModel = event.model.context.model(mapping.parentModel);
                            associatedModel.find(event.target[childField]).select(mapping.parentField).silent().flatten().take(1).list((err, result) => {
                                if (err) {
                                    cb(err);
                                }
                                else if (_.isNil(result)) {
                                    return cb(new DataError('EDATA', 'An associated object cannot be found.', null, associatedModel.name));
                                }
                                else if (result.total === 0) {
                                    return cb(new DataError('EDATA', 'An associated object cannot be found.', null, associatedModel.name));
                                }
                                else if (result.total > 1) {
                                    return cb(new DataError('EDATA', 'An associated object is defined more than once and cannot be bound.', null, associatedModel.name));
                                }
                                else {
                                    event.target[childField][mapping.parentField] = result.value[0][mapping.parentField];
                                    cb();
                                }
                            });
                        }
                        else {
                            cb();
                        }
                    }, err => {
                        if (err) {
                            console.log(err);
                        }
                        callback(err);
                    });
            }
        }
        catch (err) {
            callback(err);
        }
    }
    /**
     *
     * @param {DataEventArgs} event
     * @param {function(Error=)} callback
     */
    afterSave(event, callback) {
        try {
            if (typeof event.target === 'undefined' || event.target === null) {
                callback(null);
            }
            else {
                const keys = Object.keys(event.target);
                const mappings = [];
                keys.forEach(x => {
                    if (Object.prototype.hasOwnProperty.call(event.target, x)) {
                        /**
                         * @type DataAssociationMapping
                         */
                        const mapping = event.model.inferMapping(x);
                        if (mapping)
                            if (mapping.associationType === 'junction') {
                                mappings.push({ name: x, mapping: mapping });
                            }
                    }
                });
                async.eachSeries(mappings,
                    /**
                     * @param {{name:string,mapping:DataAssociationMapping}} x
                     * @param {function(Error=)} cb
                     */
                    (x, cb) => {
                        const silentMode = parseBoolean(event.model.$silent);
                        if (x.mapping.associationType === 'junction') {
                            const obj = event.model.convert(event.target);
                            /**
                             * @type {*|{deleted:Array}}
                             */
                            const childs = obj[x.name];
                            let junction;
                            if (!_.isArray(childs)) {
                                return cb();
                            }
                            if (x.mapping.childModel === event.model.name) {
                                const HasParentJunction = require('./HasParentJunction').HasParentJunction;
                                junction = new HasParentJunction(obj, x.mapping);
                                if (event.state === 1 || event.state === 2) {
                                    const toBeRemoved = [];
                                    const toBeInserted = [];
                                    _.forEach(childs, x => {
                                        if (x.$state === 4) {
                                            toBeRemoved.push(x);
                                        }
                                        else {
                                            toBeInserted.push(x);
                                        }
                                    });
                                    junction.silent(silentMode).insert(toBeInserted, err => {
                                        if (err) {
                                            return cb(err);
                                        }
                                        junction.silent(silentMode).remove(toBeRemoved, err => {
                                            if (err) {
                                                return cb(err);
                                            }
                                            return cb();
                                        });
                                    });
                                }
                                else {
                                    return cb();
                                }
                            }
                            else if (x.mapping.parentModel === event.model.name) {
                                if (event.state === 1 || event.state === 2) {
                                    const DataObjectJunction = require('./DataObjectJunction').DataObjectJunction;
                                    const DataObjectTag = require('./DataObjectTag').DataObjectTag;
                                    if (typeof x.mapping.childModel === 'undefined') {
                                        /**
                                         * @type {DataObjectTag}
                                         */
                                        const tags = new DataObjectTag(obj, x.mapping);
                                        return tags.silent(silentMode).all().then(result => {
                                            const toBeRemoved = result.filter(x => { return childs.indexOf(x) < 0; });
                                            const toBeInserted = childs.filter(x => { return result.indexOf(x) < 0; });
                                            if (toBeRemoved.length > 0) {
                                                return tags.silent(silentMode).remove(toBeRemoved).then(() => {
                                                    if (toBeInserted.length === 0) {
                                                        return cb();
                                                    }
                                                    return tags.silent(silentMode).insert(toBeInserted).then(() => {
                                                        return cb();
                                                    });
                                                }).catch(err => {
                                                    return cb(err);
                                                });
                                            }
                                            if (toBeInserted.length === 0) {
                                                return cb();
                                            }
                                            return tags.silent(silentMode).insert(toBeInserted).then(() => {
                                                return cb();
                                            });
                                        }).catch(err => {
                                            return cb(err);
                                        });
                                    }
                                    else {
                                        junction = new DataObjectJunction(obj, x.mapping);
                                        junction.silent(silentMode).insert(childs, err => {
                                            if (err) {
                                                return cb(err);
                                            }
                                            const toBeRemoved = [];
                                            const toBeInserted = [];
                                            _.forEach(childs, x => {
                                                if (x.$state === 4) {
                                                    toBeRemoved.push(x);
                                                }
                                                else {
                                                    toBeInserted.push(x);
                                                }
                                            });
                                            junction.silent(silentMode).insert(toBeInserted, err => {
                                                if (err) {
                                                    return cb(err);
                                                }
                                                junction.silent(silentMode).remove(toBeRemoved, err => {
                                                    if (err) {
                                                        return cb(err);
                                                    }
                                                    return cb();
                                                });
                                            });
                                        });
                                    }
                                }
                                else {
                                    cb();
                                }
                            }
                            else {
                                cb();
                            }
                        }
                        else
                            cb(null);
                    }, err => {
                        callback(err);
                    });
            }
        }
        catch (err) {
            callback(err);
        }
    }
}

export {DataObjectAssociationListener};