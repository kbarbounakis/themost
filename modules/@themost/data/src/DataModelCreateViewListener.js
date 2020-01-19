import { QueryUtils, QueryField, QueryFieldRef } from '@themost/query';
/**
 * @class
 * @constructor
 */
class DataModelCreateViewListener {
    /**
     * Occurs after upgrading a data model.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    afterUpgrade(event, callback) {
        const self = event.model;
        const db = self.context.db;
        const view = self.viewAdapter;
        const adapter = self.sourceAdapter;
        // if data model is a sealed model do nothing anb exit
        if (self.sealed) {
            return callback();
        }
        // if view adapter is the same with source adapter do nothing and exit
        if (view === adapter) {
            return callback();
        }
        // get base model
        const baseModel = self.base();
        // get array of fields
        const fields = self.attributes.filter(x => {
            return (self.name === x.model) && (!x.many);
        }).map(x => {
            return QueryField.select(x.name).from(adapter);
        });
        /**
         * @type {QueryExpression}
         */
        const q = QueryUtils.query(adapter).select(fields);
        let baseAdapter = null;
        const baseFields = [];
        // enumerate attributes of base model (if any)
        if (baseModel) {
            // get base adapter
            baseAdapter = baseModel.viewAdapter;
            // enumerate base model attributes
            baseModel.attributes.forEach(x => {
                //get all fields (except primary and one-to-many relations)
                if ((!x.primary) && (!x.many))
                    baseFields.push(QueryField.select(x.name).from(baseAdapter));
            });
        }
        if (baseFields.length > 0) {
            const from = new QueryFieldRef(adapter, self.key().name);
            const to = new QueryFieldRef(baseAdapter, self.base().key().name);
            q.$expand = { $entity: {}, $with: [] };
            q.$expand.$entity[baseAdapter] = baseFields;
            q.$expand.$with.push(from);
            q.$expand.$with.push(to);
        }
        //execute query
        return db.createView(view, q, err => {
            callback(err);
        });
    }
}
export {DataModelCreateViewListener};

