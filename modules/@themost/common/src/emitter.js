/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
 
import {EventEmitter} from 'events';
import {applyEachSeries} from 'async';

/**
 * @classdesc SequentialEventEmitter class is an extension of node.js EventEmitter class where listeners are executing in series.
 * @class
 * @constructor
 * @augments EventEmitter
 */
export class SequentialEventEmitter extends EventEmitter {
    /**
     * Executes event listeners in series.
     * @param {String} event - The event that is going to be executed.
     * @param {...*} args - An object that contains the event arguments.
     */
    // eslint-disable-next-line no-unused-vars
    // tslint:disable-nex-lineb no-unused-variable
    emit(event, _args) {
        //ensure callback
        callback = callback || (() => {});
        //get listeners
        if (typeof this.listeners !== 'function') {
            throw new Error('undefined listeners');
        }
        const listeners = this.listeners(event);

        const argsAndCallback = [].concat(Array.prototype.slice.call(arguments, 1));
        if (argsAndCallback.length > 0) {
            //check the last argument (expected callback function)
            if (typeof argsAndCallback[argsAndCallback.length - 1] !== "function") {
                throw new TypeError("Expected event callback");
            }
        }
        //get callback function (the last argument of arguments list)
        const callback = argsAndCallback[argsAndCallback.length - 1];

        //validate listeners
        if (listeners.length===0) {
            //exit emitter
            return callback();
        }
        //apply each series
        return applyEachSeries.apply(this, [listeners].concat(argsAndCallback));
    }
}
