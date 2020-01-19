/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import _ from 'lodash';
import {QueryExpression} from '@themost/query';
import {QueryField} from '@themost/query';
import {DataAssociationMapping} from './types';
import {DataQueryable} from './data-queryable';

/**
 * @classdesc Represents a foreign key association between two models.
 <p>
 This association may be defined in a field of a data model as follows:
 </p>
 <pre class="prettyprint"><code>
 {
    "name": "Order", "id": 449, "title": "Order", "hidden": false, "sealed": false,
    "abstract": false, "version": "1.0",
    "fields": [
        ...
        {
            "name": "customer",
            "title": "Customer",
            "description": "Party placing the order.",
            "type": "Party"
        }
        ...
    ]
 }
 </code></pre>
 <p>
 where model Order has a foreign key association with model Party (Person or Organization).
 HasOneAssociation class inherits DataQueryable class for selecting the associated item.
 </p>
 <pre class="prettyprint"><code>
 var orders = context.model('Order');
 orders.where('id').equal(145).first().then(function(result) {
        var order = orders.convert(result);
        order.property('customer')
            .first().then(function(result) {
                done(null, result);
            }).catch(function(err) {
                done(err);
            });
    }).catch(function(err) {
        done(err);
    });
 </code></pre>
 * @class
 * @constructor
 * @augments DataQueryable
 * @param {DataObject} obj - An instance of DataObject class that represents the parent data object
 * @param {string|*} association A string that represents the name of the field which holds association mapping or the association mapping itself.
 * @property {DataObject} parent Gets or sets the parent data object
 */
class HasOneAssociation extends DataQueryable {
    constructor(obj, association) {
        super();
        /**
         * @type {DataObject}
         * @private
         */
        let parent = obj;
        /**
         * Gets or sets the parent data object
         * @type DataObject
         */
        Object.defineProperty(this, 'parent', { get: function () {
            return parent;
        }, set: function (value) {
            parent = value;
        }, configurable: false, enumerable: false});
        const self = this;
        /**
         * @type {DataAssociationMapping}
         */
        this.mapping = undefined;
        if (typeof association === 'string') {
            //infer mapping from field name
            //set relation mapping
            if (self.parent!==null) {
                const model = self.parent.getModel();
                if (model!==null)
                    self.mapping = model.inferMapping(association);
            }
        }
        else if (typeof association === 'object' && association !==null) {
            //get the specified mapping
            if (association instanceof DataAssociationMapping)
                self.mapping = association;
            else
                self.mapping = _.assign(new DataAssociationMapping(), association);
        }

        /**
         * @type QueryExpression
         */
        let _query;
        //override query property
        Object.defineProperty(this, 'query', {
            get:function() {
                //if query is already defined
                if (_query != null) {
                    return _query;
                }
                if (typeof self.mapping === 'undefined' || self.mapping===null)
                    throw new Error('Data association mapping cannot be empty at this context.');
                //get parent object
                let associatedValue = null;
                if (self.parent.hasOwnProperty(self.mapping.childField)) {
                    // get associated object
                    const associatedObject = self.parent[self.mapping.childField];
                    // if parent object has a property for mapping child field
                    if (associatedObject && associatedObject.hasOwnProperty(self.mapping.parentField)) {
                        // get associated value
                        associatedValue = associatedObject[self.mapping.parentField];
                    }
                    else if (associatedObject != null ) {
                        associatedValue = associatedObject;
                    }
                    // return query
                    _query = self.model.where(self.mapping.parentField).equal(associatedValue).prepare().query;
                    return _query;
                }
                else {
                    const childModel = self.parent.getModel();
                    const parentModel = self.model;
                    /**
                     * get empty query expression
                     * @type QueryExpression
                     */
                    _query = self.model.asQueryable().cache(false).select().query;
                    // get random alias
                    const alias = self.model.name + '0';
                    // get join left operand
                    const left = new QueryExpression().select(self.mapping.parentField).from(parentModel.viewAdapter).$select;
                    // get join right operand
                    const right = new QueryExpression().select(self.mapping.childField).from(alias).$select;
                    // create join
                    _query.join(childModel.viewAdapter, [], alias).with([left, right]);
                    // inject where
                    _query.injectWhere(new QueryExpression().where(new QueryField(self.model.primaryKey).from(alias)).equal(self.parent.getId()).$where);
                    // return query
                    return _query.prepare();
                }
            },
            configurable:false,
            enumerable:false
        });

        /**
         * @type DataModel
         */
        let _model;
        Object.defineProperty(this, 'model', {
            get: function() {
                if (_model) {
                    return _model;
                }
                if (self.parent && self.mapping) {
                    _model = this.parent.context.model(self.mapping.parentModel);
                    return _model;
                }
                return null;
            },
            enumerable: false
        });


    }

    getItems() {
        throw new Error('Unsupported method call:getItems()')
    }

    getList() {
        throw new Error('Unsupported method call:getList()')
    }

    getItem() {
        return HasOneAssociation.super_.prototype.getItem.bind(this)();
    }

    getAllItems() {
        throw new Error('Unsupported method call:getAllItems()')
    }
}

export {HasOneAssociation};
