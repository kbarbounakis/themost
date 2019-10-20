import { Args } from '@themost/common';
import { QueryField } from './QueryField';
import { getOwnPropertyName, REFERENCE_REGEXP } from './query';
/**
 * @class
 * @property {string} name - A string which represents the name of this entity
 * @property {string} alias - A string which represents an alias for this entity
 */
export class QueryEntity {
    /**
     * @param {string=} entity
     */
    constructor(entity) {
        if (entity) {
            Args.notString(entity, 'Entity');
            // format entity graph e.g. { "$Table1": { } }
            this[`$${entity}`] = {};
        }
    }
    /**
     * Returns the name of this entity
     * @returns {*|string}
     */
    get name() {
        // get first property
        let key = getOwnPropertyName(this);
        if (key) {
            // if key is a reference (it starts with $)
            if (REFERENCE_REGEXP.test(key)) {
                // return entity name without $
                return key.substr(1);
            }
            // entity has an alias so get name which is the first property of alias object
            key = getOwnPropertyName(this[key]);
            if (REFERENCE_REGEXP.test(key)) {
                // return entity name without $
                return key.substr(1);
            }
            throw new Error('Invalid entity name reference');
        }
    }
    /**
     * Returns the alias of this entity, if any
     * @returns {*|string}
     */
    get alias() {
        // get first property
        const key = getOwnPropertyName(this);
        if (key) {
            // if key is a reference (it starts with $)
            if (REFERENCE_REGEXP.test(key)) {
                // there is not alias
                return;
            }
            // entity has an alias so get name which is the first property of alias object
            return key;
        }
    }
    select(name) {
        const f = new QueryField(name);
        return f.from(this.$as ? this.$as : this.$name);
    }
    as(alias) {
        Args.notString(alias, 'Entity alias');
        const key = getOwnPropertyName(this);
        if (key == null) {
            // entity name is not defined
            throw new Error('Invalid entity object. Entity is not defined.');
        }
        // entity name is a name reference
        if (REFERENCE_REGEXP.test(key)) {
            // so convert object graph e.g. { Users: { $User: { ... } } }
            this[alias] = {};
            Object.defineProperty(this[alias], key, Object.getOwnPropertyDescriptor(this, key));
            delete this[key];
            return this;
        }
        // query entity has already an alias so rename alias
        if (alias != -key) {
            Object.defineProperty(this, alias, Object.getOwnPropertyDescriptor(this, key));
            delete this[key];
        }
        return this;
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
