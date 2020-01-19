import async from 'async';
import _ from 'lodash';
import { DataModelCreateViewListener } from './DataModelCreateViewListener';
/**
 * @class
 * @constructor
 */
class DataModelSubTypesListener {
    /**
     * Occurs after upgrading a data model.
     * @param {DataEventArgs} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    afterUpgrade(event, callback) {
        const self = event.model;
        const context = event.model.context;
        try {
            self.getSubTypes().then(result => {
                if (result.length === 0) {
                    return callback();
                }
                //enumerate sub types
                async.eachSeries(result, (name, cb) => {
                    //get model
                    const model = context.model(name);
                    if (_.isNil(model)) {
                        return cb();
                    }
                    //if model is sealed do nothing
                    if (model.sealed) {
                        return cb();
                    }
                    //create event arguments
                    const ev = { model: model };
                    //execute create view listener
                    DataModelCreateViewListener.prototype.afterUpgrade(ev, cb);
                }, err => {
                    return callback(err);
                });
            }).catch(err => {
                return callback(err);
            });
        }
        catch (e) {
            callback(e);
        }
    }
}
export {DataModelSubTypesListener};
