/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import _ from 'lodash';
import {QueryUtils} from '@themost/query';
import {QueryEntity} from '@themost/query';
import {QueryField} from '@themost/query';
import Q from 'q';


/**
 * @module @themost/data/data-mapping-extensions
 * @ignore
 */

const mappingExtensions = {

    /**
     * @param {DataAssociationMapping|*} mapping
     * @returns {*}
     */
    extend: function(mapping) {
        let thisQueryable;
        let childModel_;
        let parentModel_;
        return {
            /**
             * @param {DataQueryable} dataQueryable
             */
            for: function(dataQueryable) {
                thisQueryable = dataQueryable;
                return this;
            },
            getChildModel: function() {
                if (_.isNil(thisQueryable)) {
                    return;
                }
                if (_.isObject(childModel_)) {
                    return childModel_;
                }
                childModel_ = thisQueryable.model.context.model(mapping.childModel);
                return childModel_;

            },
            getParentModel: function() {
                if (_.isNil(thisQueryable)) {
                    return;
                }
                if (_.isObject(parentModel_)) {
                    return parentModel_;
                }
                parentModel_ = thisQueryable.model.context.model(mapping.parentModel);
                return parentModel_;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getParents_v1: function(items) {

                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.childModel !== thisQueryable.model.name) || (mapping.associationType!=='junction')) {
                        return deferred.resolve();
                    }
                    //get array of key values (for childs)
                    let values = arr.filter(x => {
                        return (typeof x[mapping.childField]!=='undefined')
                            && (x[mapping.childField]!=null); })
                            .map(x => { return x[mapping.childField]
                            });
                    //query junction model
                    const HasParentJunction = require('./HasParentJunction').HasParentJunction;
                    const junction = new HasParentJunction(thisQueryable.model.convert({ }), mapping);
                    junction.getBaseModel().where(mapping.associationValueField).in(values).flatten().silent().all((err, junctions) => {
                        if (err) { return deferred.reject(err); }
                        //get array of parent key values
                        values = _.intersection(junctions.map(x => { return x[mapping.associationObjectField] }));
                        //get parent model
                        const parentModel = thisArg.getParentModel();
                        //query parent with parent key values
                        parentModel.filter(mapping.options, (err, q) => {
                            if (err) {
                                return deferred.reject(err);
                            }
                            q.prepare();
                            //Important Backward compatibility issue (<1.8.0)
                            //Description: if $levels parameter is not defined then set the default value to 0.
                            if (typeof q.$levels === 'undefined') {
                                q.$levels = 0;
                            }
                            q.where(mapping.parentField).in(values);
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //and finally query parent
                            q.getItems().then(parents => {
                                //if result contains only one item
                                if (arr.length === 1) {
                                    arr[0][mapping.refersTo] = parents;
                                    return deferred.resolve();
                                }
                                //otherwise loop result array
                                arr.forEach(x => {
                                    //get child (key value)
                                    const childValue = x[mapping.childField];
                                    //get parent(s)
                                    const p = junctions.filter(y => { return (y[mapping.associationValueField]===childValue); }).map(r => { return r[mapping.associationObjectField]; });
                                    //filter data and set property value (a filtered array of parent objects)
                                    x[mapping.refersTo] = parents.filter(z => { return p.indexOf(z[mapping.parentField])>=0; });
                                });
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.reject(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getParents : function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.childModel !== thisQueryable.model.name) || (mapping.associationType!=='junction')) {
                        return deferred.resolve();
                    }
                    const HasParentJunction = require('./HasParentJunction').HasParentJunction;
                    const junction = new HasParentJunction(thisQueryable.model.convert({ }), mapping);
                    return junction.migrate(err => {
                        if (err) { return deferred.reject(err); }
                        const parentModel = thisArg.getParentModel();
                        parentModel.filter(mapping.options, (err, q) => {
                            if (err) { return deferred.reject(err); }
                            //get junction sub-query
                            const junctionQuery = QueryUtils.query(junction.getBaseModel().name).select([mapping.associationObjectField, mapping.associationValueField])
                                .join(thisQueryable.query.as('j0'))
                                .with(QueryUtils.where(new QueryEntity(junction.getBaseModel().name).select(mapping.associationValueField))
                                    .equal(new QueryEntity('j0').select(mapping.childField)));
                            //append join statement with sub-query
                            q.query.join(junctionQuery.as('g0'))
                                .with(QueryUtils.where(new QueryEntity(parentModel.viewAdapter).select(mapping.parentField))
                                    .equal(new QueryEntity('g0').select(mapping.associationObjectField)));
                            if (!q.query.hasFields()) {
                                q.select();
                            }
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //append child key field
                            q.alsoSelect(QueryField.select(mapping.associationValueField).from('g0').as('ref__'));
                            return q.getItems().then(parents => {
                                _.forEach(arr, x => {
                                    x[mapping.refersTo] = _.filter(parents, y => {
                                        if (y['ref__'] === x[mapping.childField]) {
                                            delete y['ref__'];
                                            return true;
                                        }
                                        return false;
                                    });
                                });
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.reject(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getChilds_v1: function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.parentModel !== thisQueryable.model.name) || (mapping.associationType!=='junction')) {
                        return deferred.resolve();
                    }
                    const values = arr.filter(x => {
                        return (typeof x[mapping.parentField]!=='undefined') && (x[mapping.parentField]!=null);
                    }).map(x => {
                        return x[mapping.parentField];
                    });
                    if (_.isNil(mapping.childModel)) {
                        const DataObjectTag = require('./DataObjectTag').DataObjectTag;
                        junction = new DataObjectTag(thisQueryable.model.convert({ }), mapping);
                        return junction.getBaseModel().where('object').in(values).flatten().silent().select('object', 'value').all().then(items => {
                            arr.forEach(x => {
                                x[mapping.refersTo] = items.filter(y => {
                                    return y['object']===x[mapping.parentField];
                                }).map(y => {
                                    return y.value;
                                });
                            });
                            return deferred.resolve();
                        }).catch(err => {
                            return deferred.reject(err);
                        });
                    }
                    //create a dummy object
                    const DataObjectJunction = require('./DataObjectJunction').DataObjectJunction;
                    let junction = new DataObjectJunction(thisQueryable.model.convert({ }), mapping);
                    //query junction model
                    return junction.getBaseModel().where(mapping.associationObjectField).in(values).silent().flatten().getItems().then(junctions => {
                        //get array of child key values
                        const values = junctions.map(x => { return x[mapping.associationValueField] });
                        //get child model
                        const childModel = thisArg.getChildModel();
                        childModel.filter(mapping.options, (err, q) => {
                            if (err) {
                                return deferred.reject(err);
                            }
                            q.prepare();
                            //Important Backward compatibility issue (<1.8.0)
                            //Description: if $levels parameter is not defined then set the default value to 0.
                            if (typeof q.$levels === 'undefined') {
                                q.$levels = 0;
                            }
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //append where statement for this operation
                            if (values.length===1) {
                                q.where(mapping.childField).equal(values[0]);
                            }
                            else {
                                q.where(mapping.childField).in(values);
                            }
                            //and finally query childs
                            q.getItems().then(childs => {
                                //if result contains only one item
                                if (arr.length === 1) {
                                    arr[0][mapping.refersTo] = childs;
                                    return deferred.resolve();
                                }
                                //otherwise loop result array
                                arr.forEach(x => {
                                    //get parent (key value)
                                    const parentValue = x[mapping.parentField];
                                    //get parent(s)
                                    const p = junctions.filter(y => { return (y[mapping.associationObjectField]===parentValue); }).map(r => { return r[mapping.associationValueField]; });
                                    //filter data and set property value (a filtered array of parent objects)
                                    x[mapping.refersTo] = childs.filter(z => { return p.indexOf(z[mapping.childField])>=0; });
                                });
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.reject(err);
                            });
                        });
                    }).catch(err => {
                        return deferred.reject(err);
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getChilds: function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.parentModel !== thisQueryable.model.name) || (mapping.associationType!=='junction')) {
                        return deferred.resolve();
                    }
                    const DataObjectJunction = require('./DataObjectJunction').DataObjectJunction;
                    const junction = new DataObjectJunction(thisQueryable.model.convert({ }), mapping);
                    return junction.migrate(err => {
                        if (err) { return deferred.reject(err); }
                        const childModel = thisArg.getChildModel();
                        childModel.filter(mapping.options, (err, q) => {
                            if (err) { return deferred.reject(err); }
                            if (!q.query.hasFields()) {
                                q.select();
                            }
                            //get junction sub-query
                            const junctionQuery = QueryUtils.query(junction.getBaseModel().name).select([mapping.associationObjectField, mapping.associationValueField])
                                .join(thisQueryable.query.as('j0'))
                                .with(QueryUtils.where(new QueryEntity(junction.getBaseModel().name).select(mapping.associationObjectField))
                                    .equal(new QueryEntity('j0').select(mapping.parentField)));
                            //append join statement with sub-query
                            q.query.join(junctionQuery.as('g0'))
                                .with(QueryUtils.where(new QueryEntity(childModel.viewAdapter).select(mapping.childField))
                                    .equal(new QueryEntity('g0').select(mapping.associationValueField)));

                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //append item reference
                            q.alsoSelect(QueryField.select(mapping.associationObjectField).from('g0').as('ref__'));
                            return q.getItems().then(childs => {
                                _.forEach(arr, x => {
                                    x[mapping.refersTo] = _.filter(childs, y => {
                                        if (y['ref__'] === x[mapping.parentField]) {
                                            delete y['ref__'];
                                            return true;
                                        }
                                        return false;
                                    });
                                });
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.reject(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getAssociatedParents: function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.childModel !== thisQueryable.model.name) || (mapping.associationType!=='association')) {
                        return deferred.resolve();
                    }
                    thisArg.getParentModel().migrate(err => {
                       if (err) { return deferred.reject(err); }
                        thisArg.getParentModel().filter(mapping.options, (err, q) => {
                           if (err) { return deferred.reject(err); }
                            //Important Backward compatibility issue (<1.8.0)
                            //Description: if $levels parameter is not defined then set the default value to 0.
                            if (typeof q.$levels === 'undefined') {
                                q.$levels = 0;
                            }
                            if (typeof q.query.$select === 'undefined') {
                               q.select();
                            }
                            q.query
                               .distinct()
                               .join(thisQueryable.query.as('j0'))
                               .with(QueryUtils.where(new QueryEntity(thisArg.getParentModel().viewAdapter).select(mapping.parentField))
                                   .equal(new QueryEntity('j0').select(mapping.childField)));
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            q.silent().getAllItems().then(parents => {
                                const childField = thisQueryable.model.field(mapping.childField);
                                const keyField = childField.property || childField.name;
                                const iterator = x => {
                                    const key = x[keyField];
                                    x[keyField] = _.find(parents, x => {
                                       return x[mapping.parentField] === key;
                                    });
                                };
                                _.forEach(arr, iterator);
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.reject(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getAssociatedParents_v1: function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.childModel !== thisQueryable.model.name) || (mapping.associationType!=='association')) {
                        return deferred.resolve();
                    }
                    thisArg.getParentModel().migrate(err => {
                        if (err) { return deferred.reject(err); }
                        const childField = thisQueryable.model.field(mapping.childField);
                        const keyField = childField.property || childField.name;
                        if (_.isNil(childField)) {
                            return deferred.reject('The specified field cannot be found on child model');
                        }
                        const values = _.intersection(_.map(_.filter(arr, x => {
                            return x.hasOwnProperty(keyField);
                            }), x => { return x[keyField];}));
                        if (values.length===0) {
                            return deferred.resolve();
                        }
                        thisArg.getParentModel().filter(mapping.options, (err, q) => {
                            if (err) {
                                return deferred.reject(err);
                            }
                            q.prepare();
                            //Important Backward compatibility issue (<1.8.0)
                            //Description: if $levels parameter is not defined then set the default value to 0.
                            if (typeof q.$levels === 'undefined') {
                                q.$levels = 0;
                            }
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //append where statement for this operation
                            q.where(mapping.parentField).in(values);
                            //set silent (?)
                            q.silent().getAllItems().then(parents => {
                                let key=null;

                                const selector = x => {
                                    return x[mapping.parentField]===key;
                                };

                                const iterator = x => {
                                    key = x[keyField];
                                    if (childField.property && childField.property!==childField.name) {
                                        x[childField.property] = parents.filter(selector)[0];
                                        delete x[childField.name];
                                    }
                                    else
                                        x[childField.name] = parents.filter(selector)[0];
                                };

                                if (_.isArray(arr)) {
                                    arr.forEach(iterator);
                                }
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.reject(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getAssociatedChilds_v1: function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.parentModel !== thisQueryable.model.name) || (mapping.associationType!=='association')) {
                        return deferred.resolve();
                    }
                    thisArg.getChildModel().migrate(err => {
                        if (err) { return deferred.reject(err); }
                        const parentField = thisQueryable.model.field(mapping.parentField);
                        if (_.isNil(parentField)) {
                            return deferred.reject('The specified field cannot be found on parent model');
                        }
                        const keyField = parentField.property || parentField.name;
                        const values = _.intersection(_.map(_.filter(arr, x => {
                            return x.hasOwnProperty(keyField);
                        }), x => { return x[keyField];}));
                        if (values.length===0) {
                            return deferred.resolve();
                        }
                        //search for view named summary
                        thisArg.getChildModel().filter(mapping.options, (err, q) => {
                            if (err) {
                                return deferred.reject(err);
                            }
                            const childField = thisArg.getChildModel().field(mapping.childField);
                            if (_.isNil(childField)) {
                                return deferred.reject('The specified field cannot be found on child model');
                            }
                            const foreignKeyField = childField.property || childField.name;
                            //Important Backward compatibility issue (<1.8.0)
                            //Description: if $levels parameter is not defined then set the default value to 0.
                            if (typeof q.$levels === 'undefined') {
                                q.$levels = 0;
                            }
                            q.prepare();
                            if (values.length===1) {
                                q.where(mapping.childField).equal(values[0]);
                            }
                            else {
                                q.where(mapping.childField).in(values);
                            }
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //final execute query
                            return q.getItems().then(childs => {
                                // get referrer field of parent model
                                const refersTo = thisArg.getParentModel().getAttribute(mapping.refersTo);
                                _.forEach(arr, x => {
                                    const items = _.filter(childs, y => {
                                        if (!_.isNil(y[foreignKeyField]) && y[foreignKeyField].hasOwnProperty(keyField)) {
                                            return y[foreignKeyField][keyField] === x[keyField];
                                        }
                                        return y[foreignKeyField] === x[keyField];
                                    });
                                    // if parent field multiplicity attribute defines an one-to-one association
                                    if (refersTo && (refersTo.multiplicity === 'ZeroOrOne' || refersTo.multiplicity === 'One')) {
                                        if (items[0] != null) {
                                            // todo raise error if there are more than one items
                                            // get only the first item
                                            x[mapping.refersTo] = items[0];
                                        }
                                        else {
                                            // or nothing
                                            x[mapping.refersTo] = null;
                                        }
                                    }
                                    else {
                                        // otherwise get all items
                                        x[mapping.refersTo] = items;
                                    }
                                });
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.resolve(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            },
            /**
             * @param {*} items
             * @returns {Promise|*}
             */
            getAssociatedChilds: function(items) {
                const thisArg = this;
                const deferred = Q.defer();
                process.nextTick(() => {
                    if (_.isNil(items)) {
                        return deferred.resolve();
                    }
                    const arr = _.isArray(items) ? items : [items];
                    if (arr.length === 0) {
                        return deferred.resolve();
                    }
                    if (_.isNil(thisQueryable)) {
                        return deferred.reject('The underlying data queryable cannot be empty at this context.');
                    }
                    if ((mapping.parentModel !== thisQueryable.model.name) || (mapping.associationType!=='association')) {
                        return deferred.resolve();
                    }
                    thisArg.getChildModel().migrate(err => {
                        if (err) { return deferred.reject(err); }
                        const parentField = thisArg.getParentModel().field(mapping.parentField);
                        if (_.isNil(parentField)) {
                            return deferred.reject('The specified field cannot be found on parent model');
                        }
                        const keyField = parentField.property || parentField.name;
                        const values = _.intersection(_.map(_.filter(arr, x => {
                            return x.hasOwnProperty(keyField);
                        }), x => { return x[keyField];}));
                        if (values.length===0) {
                            return deferred.resolve();
                        }
                        //search for view named summary
                        thisArg.getChildModel().filter(mapping.options, (err, q) => {
                            if (err) {
                                return deferred.reject(err);
                            }
                            const childField = thisArg.getChildModel().field(mapping.childField);
                            if (_.isNil(childField)) {
                                return deferred.reject('The specified field cannot be found on child model');
                            }
                            const foreignKeyField = childField.property || childField.name;
                            //Important Backward compatibility issue (<1.8.0)
                            //Description: if $levels parameter is not defined then set the default value to 0.
                            if (typeof q.$levels === 'undefined') {
                                q.$levels = 0;
                            }
                            if (!q.query.hasFields()) {
                                q.select();
                            }
                            //inherit silent mode
                            if (thisQueryable.$silent)  { q.silent(); }
                            //join parents
                            q.query.join(thisQueryable.query.as('j0'))
                                .with(QueryUtils.where(new QueryEntity(thisArg.getChildModel().viewAdapter).select(mapping.childField))
                                    .equal(new QueryEntity('j0').select(mapping.parentField)));
                            q.prepare();
                            //final execute query
                            return q.getItems().then(childs => {
                                _.forEach(arr, x => {
                                    x[mapping.refersTo] = _.filter(childs, y => {
                                        if (!_.isNil(y[foreignKeyField]) && y[foreignKeyField].hasOwnProperty(keyField)) {
                                            return y[foreignKeyField][keyField] === x[keyField];
                                        }
                                        return y[foreignKeyField] === x[keyField];
                                    });
                                });
                                return deferred.resolve();
                            }).catch(err => {
                                return deferred.resolve(err);
                            });
                        });
                    });
                });
                return deferred.promise;
            }
        };
    }
};

export default mappingExtensions;
