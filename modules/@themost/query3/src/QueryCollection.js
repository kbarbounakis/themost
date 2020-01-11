import { Args } from '@themost/common';
import { getOwnPropertyName, isMethodOrNameReference } from './query';
/**
 * @class
 * @property {string} name - A string which represents the name of the collection
 * @property {string} alias - A string which represents an alias for the collection
 */
export class QueryCollection {
    /**
     * @param {string=} collection
     */
    constructor(collection) {
        if (collection) {
            Args.notString(collection, 'Collection');
            Object.defineProperty(this, collection, {
                        value: 1,
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
        }
    }
    /**
     * Returns the name of this collection
     * @returns {*}
     */
    get name() {
        // get first property
        let key = getOwnPropertyName(this);
        Args.notNull(key, 'Collection');
        if (this[key] === 1) {
            // simple collection reference e.g. { "Person": 1 }
            return key;
        }
        if (isMethodOrNameReference(this[key])) {
            // collection reference with alias e.g. { "People": "$Person" }
            return this[key].substr(1);
        }
        throw new Error('Invalid collection reference.');
    }
    /**
     * Returns the alias of this entity, if any
     * @returns {*}
     */
    get alias() {
        // get first property
        let key = getOwnPropertyName(this);
        Args.notNull(key, 'Collection');
        if (this[key] === 1) {
            // simple collection reference e.g. { "Person": 1 }
            return;
        }
        if (isMethodOrNameReference(this[key])) {
            // collection reference with alias e.g. { "People": "$Person" }
            return key;
        }
        throw new Error('Invalid collection reference.');
    }

    as(alias) {
        Args.notString(alias, 'Alias');
        const key = getOwnPropertyName(this);
        Args.notNull(key, 'Collection');
        // if collection name is a single expression e.g. { "Person": 1 }
        if (this[key] === 1) {
            // convert collection reference to { "People": "$Person" }
            Object.defineProperty(this, alias, {
                        value: `$${key}`,
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
            delete this[key];
            return this;
        }
        // check if alias is the same with that already exists
        if (key === alias) {
            return;
        }
        // query entity has already an alias so rename alias
        if (isMethodOrNameReference(this[key])) {
            Object.defineProperty(this, alias, {
                        value: `${this[key]}`,
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
            delete this[key];
            return this;
        }
        throw new Error('Invalid collection reference.');

    }
    inner() {
        throw new Error('Not yet implemented');
    }
    left() {
        throw new Error('Not yet implemented');
    }
    right() {
        throw new Error('Not yet implemented');
    }
}
