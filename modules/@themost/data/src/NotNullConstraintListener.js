import async from 'async';
import { NotNullError, TraceUtils } from '@themost/common';
/**
 * @classdesc Represents an event listener for validating not nullable fields. This listener is automatically  registered in all data models.
 * @class
 * @constructor
 */
class NotNullConstraintListener {
    /**
     * Occurs before creating or updating a data object and validates not nullable fields.
     * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
     * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
     */
    beforeSave(event, callback) {
        //find all attributes that have not null flag
        const attrs = event.model.attributes.filter(x => {
            return !x.primary && !(typeof x.nullable === 'undefined' ? true : x.nullable);
        });
        if (attrs.length === 0) {
            callback(null);
            return 0;
        }
        async.eachSeries(attrs, (attr, cb) => {
            const name = attr.property || attr.name;
            const value = event.target[name];
            if ((((value === null) || (value === undefined)) && (event.state === 1))
                || ((value === null) && (typeof value !== 'undefined') && (event.state === 2))) {
                const er = new NotNullError('A value is required.', null, event.model.name, attr.name);
                TraceUtils.debug(er);
                return cb(er);
            }
            else
                return cb();
        }, err => {
            callback(err);
        });
    }
}
export {NotNullConstraintListener};
