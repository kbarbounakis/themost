/**
 * Represents a model migration scheme against data adapters
 * @class
 */
class DataModelMigration {
    constructor() {
        /**
         * Gets an array that contains the definition of fields that are going to be added
         * @type {Array}
         */
        this.add = [];
        /**
         * Gets an array that contains a collection of constraints which are going to be added
         * @type {Array}
         */
        this.constraints = [];
        /**
         * Gets an array that contains a collection of indexes which are going to be added or updated
         * @type {Array}
         */
        this.indexes = [];
        /**
         * Gets an array that contains the definition of fields that are going to be deleted
         * @type {Array}
         */
        this.remove = [];
        /**
         * Gets an array that contains the definition of fields that are going to be changed
         * @type {Array}
         */
        this.change = [];
        /**
         * Gets or sets a string that contains the internal version of this migration. This property cannot be null.
         * @type {string}
         */
        this.version = '0.0';
        /**
         * Gets or sets a string that represents a short description of this migration
         * @type {string}
         */
        this.description = null;
        /**
         * Gets or sets a string that represents the adapter that is going to be migrated through this operation.
         * This property cannot be null.
         */
        this.appliesTo = null;
        /**
         * Gets or sets a string that represents the model that is going to be migrated through this operation.
         * This property may be null.
         */
        this.model = null;
    }
}
export {DataModelMigration};
