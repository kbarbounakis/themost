/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
function previousStateListener(event, callback) {
    const _ = require('lodash');
    if (event.state===1) { return callback(); }
    const key = event.model.primaryKey;
    if (_.isNil(event.target[key])) {
        return callback();
    }
    event.model.where(key).equal(event.target[key]).silent().first((err, result) => {
        if (err) {
            return callback(err);
        }
        else {
            event.previous = result;
            return callback();
        }
    });
}

/**
 * Occurs before creating or updating a data object.
 * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
 * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
 */
function beforeSave(event, callback) {
    return previousStateListener(event, callback);
}

/**
 * Occurs before removing a data objects.
 * @param {DataEventArgs|*} event - An object that represents the event arguments passed to this operation.
 * @param {Function} callback - A callback function that should be called at the end of this operation. The first argument may be an error if any occurred.
 */
function beforeRemove(event, callback) {
    return previousStateListener(event, callback);
}

export {beforeSave, beforeRemove};