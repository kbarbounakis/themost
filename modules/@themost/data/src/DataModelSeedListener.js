import _ from 'lodash';
/**
 * @class
 * @constructor
 */
class DataModelSeedListener {
    /**
     * Occurs after upgrading a data model.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    afterUpgrade(event, callback) {
        const self = event.model;
        try {
            /**
             * Gets items to be seeded
             * @type {Array}
             */
            const items = self['seed'];
            //if model has an array of items to be seeded
            if (_.isArray(items)) {
                if (items.length === 0) {
                    //if seed array is empty exit
                    return callback();
                }
                //try to insert items if model does not have any record
                self.asQueryable().silent().flatten().count((err, count) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    //if model has no data
                    if (count === 0) {
                        //set items state to new
                        items.forEach(x => { x.$state = 1; });
                        self.silent().save(items, callback);
                    }
                    else {
                        //model was already seeded
                        return callback();
                    }
                });
            }
            else {
                //do nothing and exit
                return callback();
            }
        }
        catch (e) {
            callback(e);
        }
    }
}
export {DataModelSeedListener};