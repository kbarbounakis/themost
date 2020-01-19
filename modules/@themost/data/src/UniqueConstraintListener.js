import async from 'async';
import { UniqueConstraintError, TraceUtils } from '@themost/common';
/**
 * @class
 * @constructor
 * @classdesc Represents an event listener for validating data model's unique constraints. This listener is automatically registered in all data models.
 */
class UniqueConstraintListener {
    /**
     * Occurs before creating or updating a data object and validates the unique constraints of data model.
     * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeSave(event, callback) {
        //there are no constraints
        if (event.model.constraints === null) {
            //do nothing
            callback(null);
            return;
        }
        //get unique constraints
        const constraints = event.model.constraints.filter(x => {
            return (x.type === 'unique');
        });
        if (constraints.length === 0) {
            //do nothing
            callback(null);
            return;
        }
        async.eachSeries(constraints, (constraint, cb) => {
            /**
             * @type {DataQueryable}
             */
            let q;
            //build query
            for (let i = 0; i < constraint.fields.length; i++) {
                const attr = constraint.fields[i];
                let value = event.target[attr];
                if (typeof value === 'undefined') {
                    cb(null);
                    return;
                }
                //check field mapping
                const mapping = event.model.inferMapping(attr);
                if (typeof mapping !== 'undefined' && mapping !== null) {
                    if (typeof event.target[attr] === 'object') {
                        value = event.target[attr][mapping.parentField];
                    }
                }
                if (typeof value === 'undefined')
                    value = null;
                if (q) {
                    q.and(attr).equal(value);
                }
                else {
                    q = event.model.where(attr).equal(value);
                }
            }
            if (typeof q === 'undefined')
                cb(null);
            else {
                q.silent().select(event.model.primaryKey).first((err, result) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    if (!result) {
                        //object does not exist
                        cb(null);
                    }
                    else {
                        let objectExists = true;
                        if (event.state === 2) {
                            //validate object id (check if target object is the same with the returned object)
                            objectExists = (result[event.model.primaryKey] !== event.target[event.model.primaryKey]);
                        }
                        //if object already exists
                        if (objectExists) {
                            let er;
                            //so throw exception
                            if (constraint.description) {
                                er = new UniqueConstraintError(constraint.description, null, event.model.name);
                            }
                            else {
                                er = new UniqueConstraintError('Object already exists. A unique constraint violated.', null, event.model.name);
                            }
                            TraceUtils.debug(er);
                            return cb(er);
                        }
                        else {
                            return cb();
                        }
                    }
                });
            }
        }, err => {
            callback(err);
        });
    }
}
export {UniqueConstraintListener};
