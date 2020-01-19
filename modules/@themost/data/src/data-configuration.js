/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
///
import _ from 'lodash';
import {TraceUtils} from '@themost/common';
import path from 'path';
import pluralize from 'pluralize';
import {Args} from '@themost/common';
import {ConfigurationBase} from '@themost/common';
import {ConfigurationStrategy} from '@themost/common';
import {PathUtils} from '@themost/common';
import {RandomUtils} from '@themost/common';
import {AbstractMethodError} from '@themost/common';
import {DataCacheStrategy} from './data-cache';
import {DefaultDataCacheStrategy} from './data-cache';

const modelsProperty = Symbol('models');
const modelPathProperty = Symbol('modelPath');
const filesProperty = Symbol('files');
const dataTypesProperty = Symbol('dataTypes');
const adapterTypesProperty =  Symbol('adapterTypes');
const currentConfiguration = Symbol('current');
const namedConfigurations = Symbol('namedConfigurations');

function interopRequireDefault(path) {
    const obj = require(path);
    return obj && obj.__esModule ? obj['default'] : obj;
}

/**
 *
 * @param s
 * @returns {*}
 * @private
 */
function _dasherize(s) {
    if (_.isString(s))
        return _.trim(s).replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').replace(/^-/,'').toLowerCase();
    return s;
}


/**
 * @method dasherize
 * @memberOf _
 */

if (typeof _.dasherize !== 'function') {
    _.mixin({'dasherize' : _dasherize});
}

/**
 * @class
 * @constructor
 * @interface
 */
function DataTypePropertiesConfiguration() {
    /**
     * Gets a pattern (commonly a regular expression) that validates a value of this data type
     * @name DataTypePropertiesConfiguration#pattern
     * @type {string}
     * @example "^[-][0-9]*$" is the pattern of NegativeInteger data type
     */

    /**
     * Gets a message that describes the pattern of this data type
     * @name DataTypePropertiesConfiguration#patternMessage
     * @type {string}
     * @example "The value should be an integer lower than zero."
     */

    /**
     * Gets the minimum value allowed for a data type
     * @name DataTypePropertiesConfiguration#minValue
     * @type {*}
     * @example 0 is the minimum value of NonNegativeInteger data type
     */

    /**
     * Gets the maximum value allowed for a data type
     * @name DataTypePropertiesConfiguration#maxValue
     * @type {*}
     * @example 2147483647 is the maximum value of NonNegativeInteger data type
     */
}

/**
 * @class
 * @constructor
 * @interface
 */
function DataTypeConfiguration() {
    /**
     * Gets a short description for this data type
     * @name DataTypeConfiguration#comment
     * @type {string}
     * @example "Float data type is a single-precision 32-bit floating point."
     */

    /**
     * Gets a collection of additional properties of this data type
     * @name DataTypeConfiguration#properties
     * @type {DataTypePropertiesConfiguration}
     * @example
     * ...
     * "properties": {
     *       "pattern":"^[+]?[0-9]*\\.?[0-9]*$",
     *       "patternMessage":"The value should be a number greater than zero."
     *  }
     * ...
     */

    /**
     * Gets a title for this data type
     * @name DataTypeConfiguration#label
     * @type {string}
     * @example "Float"
     */

    /**
     * Gets a string which represents a URL that contains information for this data type
     * @name DataTypeConfiguration#url
     * @type {string}
     * @example "https://www.w3.org/TR/xmlschema-2/#float"
     */

    /**
     * Gets a type which is associated with this data type
     * @name DataTypeConfiguration#type
     * @type {string}
     * @example "number"
     */

    /**
     * Gets the equivalent SQL data type
     * @name DataTypeConfiguration#sqltype
     * @type {string}
     * @example "FLOAT"
     */

    /**
     * Gets an array of values associated with data type
     * @name DataTypeConfiguration#instances
     * @type {Array.<*>}
     * @example [ true, false ] are the instances of Boolean data type
     */

    /**
     * Gets an array of super
     * @name DataTypeConfiguration#supertypes
     * @type {Array.<string>}
     * @example [ "Integer" ] are the supertypes of NegativeInteger data type
     */

    /**
     * Gets a string which represents the version of this data type configuration
     * @name DataTypeConfiguration#version
     * @type {string}
     * @example "1.0"
     */
}

/**
 * @class
 * @constructor
 * @interface
 * @example
 * {
 *  "name":"SQLite Data Adapter",
 *  "invariantName": "sqlite",
 *  "type":"most-data-sqlite"
 * }
 */
function DataAdapterConfiguration() {

    /**
     * Gets a string which represents the name of this data adapter
     * @name DataAdapterConfiguration#name
     * @type {string}
     * @example "SQLite Data Adapter"
     */

    /**
     * Gets a string which represents the invariant name of this data adapter
     * @name DataAdapterConfiguration#invariantName
     * @type {string}
     * @example "sqlite"
     */

    /**
     * Gets a boolean which indicates whether this adapter is the default adapter or not
     * @name DataAdapterConfiguration#default
     * @type {boolean}
     */

    /**
     * Gets a dictionary object which represents the connection options of this data adapter
     * @name DataAdapterConfiguration#options
     * @type {*}
     */

}

/**
 * @class
 * @constructor
 * @interface
 * @example
 * {
 *  "name":"SQLite Data Adapter",
 *  "invariantName": "sqlite",
 *  "type":"most-data-sqlite"
 * }
 */
function DataAdapterTypeConfiguration() {

    /**
     * Gets a string which represents the name of this data adapter
     * @name DataAdapterTypeConfiguration#name
     * @type {string}
     * @example "SQLite Data Adapter"
     */

    /**
     * Gets a string which represents the invariant name of this data adapter
     * @name DataAdapterTypeConfiguration#invariantName
     * @type {string}
     * @example "sqlite"
     */

    /**
     * Gets a string which represents the module that loads this data adapter
     * @name DataAdapterTypeConfiguration#type
     * @type {string}
     * @example "@themost/sqlite"
     */

}

/**
 * @class
 * @constructor
 */
function AuthSettingsConfiguration() {
    /**
     * Gets or sets a string which represents the cookie name that is going to be used to identify a user session
     * @type {string}
     */
    this.name = '.MAUTH';
    /**
     * Gets or sets a string which represents the name of unattended execution account
     * @type {string}
     */
    this.unattendedExecutionAccount = RandomUtils.randomHex(16);
    /**
     * Gets or sets a number which represents the lifetime (in minutes) of an authentication cookie
     * @type {number}
     */
    this.timeout = 480;
    /**
     * Gets or sets a boolean which indicates whether an authentication cookie will have a sliding expiration or not
     * @type {boolean}
     */
    this.slidingExpiration = false;
    /**
     * Gets or sets a string which represents the login URI of the current application
     * @type {string}
     */
    this.loginPage = '/login';
}

/**
 * @class
 * @classdesc Holds the configuration of data modeling infrastructure
 * @constructor
 * @param {string=} configPath - The root directory of configuration files. The default directory is the ./config under current working directory
 * @augments ConfigurationBase
 *
 */
class DataConfiguration extends ConfigurationBase {
    constructor(configPath) {
        super(configPath);
        //use default data configuration strategy
        this.useStrategy(DataConfigurationStrategy,DataConfigurationStrategy);
    }

    /**
     * @returns {DataConfigurationStrategy}
     */
    getDataConfiguration() {
        return this.getStrategy(DataConfigurationStrategy);
    }

    /**
     * @returns {DataConfiguration}
     */
    static getCurrent() {
        if (DataConfiguration[currentConfiguration] instanceof DataConfiguration) {
            return DataConfiguration[currentConfiguration]
        }
        DataConfiguration[currentConfiguration] = new DataConfiguration();
        return DataConfiguration[currentConfiguration];
    }

    /**
     * @param DataConfiguration config
     * @returns {DataConfiguration}
     */
    static setCurrent(config) {
        Args.check(config instanceof DataConfiguration, 'Invalid argument. Expected an instance of DataConfiguration class.');
        DataConfiguration[currentConfiguration] = config;
        return DataConfiguration[currentConfiguration];
    }

    /**
     * @param {string=} name
     */
    static getNamedConfiguration(name) {
      if (_.isNil(name)) {
          return DataConfiguration.getCurrent();
      }
      Args.notString(name, 'Configuration Name');
      Args.notEmpty(name, 'Configuration name');
        if (/^current$/i.test(name)) {
            return DataConfiguration.getCurrent();
        }
        if (_.isNil(DataConfiguration[namedConfigurations])) {
            DataConfiguration[namedConfigurations] = { };
        }
        if (typeof DataConfiguration[namedConfigurations][name] !== 'undefined')
            return DataConfiguration[namedConfigurations][name];
        DataConfiguration[namedConfigurations][name] = new DataConfiguration();
        return DataConfiguration[namedConfigurations][name];
    }
}

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @augments {ConfigurationStrategy}
 */
class DataConfigurationStrategy extends DataConfigurationStrategy {
    constructor(config) {

        super(config);

        ///register other strategies
        if (!config.hasStrategy(SchemaLoaderStrategy)) {
            config.useStrategy(SchemaLoaderStrategy, DefaultSchemaLoaderStrategy);
        }
        if (!config.hasStrategy(ModelClassLoaderStrategy)) {
           config.useStrategy(ModelClassLoaderStrategy, DefaultModelClassLoaderStrategy);
        }

        if (!config.hasStrategy(DataCacheStrategy)) {
            //process is running under node js
            if (typeof process !== 'undefined' && process.nextTick) {
                //add default cache strategy (using node-cache)
                config.useStrategy(DataCacheStrategy, DefaultDataCacheStrategy);
            }
        }

        if (!this.getConfiguration().hasSourceAt('adapters')) {
            this.getConfiguration().setSourceAt('adapters',[]);
        }

        if (!this.getConfiguration().hasSourceAt('adapterTypes')) {
            this.getConfiguration().setSourceAt('adapterTypes',[]);
        }

        if (!this.getConfiguration().hasSourceAt('settings/auth')) {
            this.getConfiguration().setSourceAt('settings/auth', new AuthSettingsConfiguration());
        }

        const configAdapterTypes = this.getConfiguration().getSourceAt('adapterTypes');
        this[adapterTypesProperty] = {};
        const self = this;
        //configure adapter types
        _.forEach(configAdapterTypes, x => {
            //first of all validate module
            x.invariantName = x.invariantName || 'unknown';
            x.name = x.name || 'Unknown Data Adapter';
            let valid = false;
            let adapterModule;
            if (x.type) {
                try {
                    if (/^@themost\//.test(x.type)) {
                        //get require paths
                        if (require.resolve && require.resolve.paths) {
                            /**
                             * get require paths collection
                             * @type string[]
                             */
                            const paths = require.resolve.paths(x.type);
                            //get execution
                            let path1 = self.getConfiguration().getExecutionPath();
                            //loop directories to parent (like classic require)
                            while (path1) {
                                //if path does not exist in paths collection
                                if (paths.indexOf(path.resolve(path1,'node_modules'))<0) {
                                    //add it
                                    paths.push(path.resolve(path1,'node_modules'));
                                    //and check the next path which is going to be resolved
                                    if (path1 === path.resolve(path1,'..')) {
                                        //if it is the same with the current path break loop
                                        break;
                                    }
                                    //otherwise get parent path
                                    path1 = path.resolve(path1,'..');
                                }
                                else {
                                    //path already exists in paths collection, so break loop
                                    break;
                                }
                            }
                            const adapterModulePath = require.resolve(x.type, {
                                paths:paths
                            });
                            adapterModule = require(adapterModulePath);
                        }
                        else {
                            adapterModule = require(x.type);
                        }
                    }
                    else {
                        adapterModule = require(x.type);
                    }

                    if (typeof adapterModule.createInstance === 'function') {
                        valid = true;
                    }
                    else {
                        //adapter type does not export a createInstance(options) function
                        TraceUtils.log('The specified data adapter type (%s) does not have the appropriate constructor. Adapter type cannot be loaded.', x.invariantName);
                    }
                }
                catch(err) {
                    //catch error
                    TraceUtils.error(err);
                    //and log a specific error for this adapter type
                    TraceUtils.log('The specified data adapter type (%s) cannot be instantiated. Adapter type cannot be loaded.', x.invariantName);
                }
                if (valid) {
                    //register adapter
                    self[adapterTypesProperty][x.invariantName] = {
                        invariantName:x.invariantName,
                        name: x.name,
                        createInstance:adapterModule.createInstance
                    };
                }
            }
            else {
                TraceUtils.log('The specified data adapter type (%s) does not have a type defined. Adapter type cannot be loaded.', x.invariantName);
            }
        });

        /**
         * @name DataConfigurationStrategy#dataTypes
         * @type {Object.<string,DataTypeConfiguration>}
         */

        Object.defineProperty(this,'dataTypes', {
            get:function() {
                if (this[dataTypesProperty]) {
                    return this[dataTypesProperty];
                }
                //get data types from configuration file
                let dataTypes;
                try {
                    dataTypes = require(path.join(this.getConfiguration().getConfigurationPath(), 'dataTypes.json'));
                    if (_.isNil(dataTypes)) {
                        TraceUtils.log('Data: Application data types are empty. The default data types will be loaded instead.');
                        dataTypes = require('./dataTypes.json');
                    }
                    else {
                        //append default data types which are not defined in application data types
                        const defaultDataTypes = require('./dataTypes.json');
                        //enumerate default data types and replace or append application specific data types
                        _.forEach(_.keys(defaultDataTypes), key => {
                            if (dataTypes.hasOwnProperty(key)) {
                                if (dataTypes[key].version) {
                                    if (dataTypes[key].version <= defaultDataTypes[key].version) {
                                        //replace data type due to lower version
                                        dataTypes[key] = defaultDataTypes[key];
                                    }
                                }
                                else {
                                    //replace data type due to invalid version
                                    dataTypes[key] = defaultDataTypes[key];
                                }
                            }
                            else {
                                //append data type
                                dataTypes[key] = defaultDataTypes[key];
                            }
                        });
                    }
                }
                catch(err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                        TraceUtils.log('Data: Application specific data types are missing. The default data types will be loaded instead.');
                    }
                    else {
                        TraceUtils.log('Data: An error occurred while loading application data types.');
                        throw err;
                    }
                    dataTypes = require('./dataTypes.json');
                }
                this[dataTypesProperty] = dataTypes;
                return this[dataTypesProperty];

            }
        });

        /**
         * @name DataConfigurationStrategy#adapters
         * @type {Array.<DataAdapterConfiguration>}
         */

        Object.defineProperty(this,'adapters', {
            get:function() {
                return this.getConfiguration().getSourceAt('adapters');
            }
        });

        /**
         * @name DataConfigurationStrategy#adapterTypes
         * @type {*}
         */

        Object.defineProperty(this,'adapterTypes', {
            get:function() {
                return this[adapterTypesProperty];
            }
        });


    }

    /**
     * @returns {AuthSettingsConfiguration|*}
     */
    getAuthSettings() {
        return this.getConfiguration().getSourceAt('settings/auth');
    }

    /**
     * @param {string} invariantName
     * @returns {*}
     */
    getAdapterType(invariantName) {
        return this[adapterTypesProperty][invariantName];
    }

    /**
     * Gets a boolean which indicates whether the specified data type is defined in data types collection or not.
     * @param name
     * @returns {boolean}
     */
    hasDataType(name) {
        if (_.isNil(name)) {
            return false;
        }
        if (typeof name !== 'string') {
            return false;
        }
        return this.dataTypes.hasOwnProperty(name);
    }

    /**
     * Gets a native object which represents the definition of the model with the given name.
     * @param {string} name
     * @returns {*}
     */
    getModelDefinition(name) {
        /**
         * @type {SchemaLoaderStrategy}
         */
        const schemaLoader = this.getConfiguration().getStrategy(SchemaLoaderStrategy);
        return schemaLoader.getModelDefinition(name);
    }

    /**
     * Gets a native object which represents the definition of the model with the given name.
     * @param {*} data
     * @returns {DataConfigurationStrategy}
     */
    setModelDefinition(data) {
        /**
         * @type {SchemaLoaderStrategy}
         */
        const schemaLoader = this.getConfiguration().getStrategy(SchemaLoaderStrategy);
        schemaLoader.setModelDefinition(data);
        return this;
    }

    /**
     * @returns {*}
     * @param name {string}
     */
    model(name) {
        return this.getModelDefinition(name);
    }

    /**
     * Gets the current data configuration
     * @returns DataConfigurationStrategy - An instance of DataConfiguration class which represents the current data configuration
     */
    static getCurrent() {
        const configuration = ConfigurationBase.getCurrent();
        if (!configuration.hasStrategy(DataConfigurationStrategy)) {
            configuration.useStrategy(DataConfigurationStrategy, DataConfigurationStrategy);
        }
        return configuration.getStrategy(DataConfigurationStrategy);
    }
}

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @augments ConfigurationStrategy
 */
class SchemaLoaderStrategy extends ConfigurationStrategy {
    constructor(config) {
        super(config);
        this[modelsProperty] = {};
        this.setModelDefinition({
            'name':'Migration', 'title':'Data Model Migrations', 'id': 14,
            'source':'migrations', 'view':'migrations', 'hidden': true, 'sealed':true,
            'fields':[
                { 'name':'id', 'type':'Counter', 'primary':true },
                { 'name':'appliesTo', 'type':'Text', 'size':180, 'nullable':false },
                { 'name':'model', 'type':'Text', 'size':120 },
                { 'name':'description', 'type':'Text', 'size':512},
                { 'name':'version', 'type':'Text', 'size':40, 'nullable':false }
            ],
            'constraints':[
                { 'type':'unique', 'fields':[ 'appliesTo', 'version' ] }
            ]
        });
        
    }

    /**
     * Gets a model definition
     * @param {string} name
     * @returns {*}
     */
    getModelDefinition(name) {
        Args.notString(name,'Model name');
        let result = this[modelsProperty][name];
        if (typeof result !== 'undefined') {
            return result;
        }
        const re = new RegExp('^'+name+'$','ig');
        result = _.find(_.keys(this[modelsProperty]), x => {
            return re.test(x);
        });
        return result;
    }

    /**
     * Sets a model definition
     * @param {*} data
     * @returns {SchemaLoaderStrategy}
     */
    setModelDefinition(data) {
        if (_.isNil(data)) {
            throw new Error('Invalid model definition. Expected object.')
        }
        if (typeof data === 'object') {
            if (typeof data.name === 'undefined' || data.name === null) {
                throw new Error('Invalid model definition. Expected model name.')
            }
            this[modelsProperty][data.name] = data;
        }
        return this;
    }

    /**
     * Gets an array of strings which represents the loaded models
     * @returns {Array.<string>}
     */
    getModels() {
        return _.keys(this[modelsProperty]);
    }
}

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @augments ConfigurationStrategy
 */
class DefaultSchemaLoaderStrategy extends SchemaLoaderStrategy {
    constructor(config) {
        super(config);
        this[modelPathProperty] = PathUtils.join(config.getConfigurationPath(), 'models');
        // set default options
        this.options = {
            usePlural: true
        };
    }

    /**
     * Gets a string which represents the directory which contains model definitions.
     * @returns {string}
     */
    getModelPath() {
        return this[modelPathProperty];
    }

    /**
     * Sets the directory of model definitions.
     * @param {string} p
     * @returns {DefaultSchemaLoaderStrategy}
     */
    setModelPath(p) {
        this[modelPathProperty] = p;
        return this;
    }

    /**
     *
     * @param {string} name
     * @returns {*}
     */
    getModelDefinition(name) {
        const getModelDefinitionSuper = DefaultSchemaLoaderStrategy.super_.prototype.getModelDefinition;
        let i;
        if (typeof name !== 'string')
            return;
        //exclude registered data types
        if (this.getConfiguration().getStrategy(DataConfigurationStrategy).hasDataType(name)) {
            return;
        }
        let modelDefinition = getModelDefinitionSuper.bind(this)(name);
        //first of all try to find if model definition is already in cache
        if (modelDefinition) {
            //and return it
            return modelDefinition;
        }
        // hold singular name of 
        let singularName;
        if (this.options.usePlural &&  pluralize.isPlural(name)) {
            // try to find model based on singular name
            singularName = pluralize.singular(name);
            // call super func
            modelDefinition = getModelDefinitionSuper.bind(this)(singularName);
            if (modelDefinition) {
                //and return it
                return modelDefinition;
            }
        }
        //otherwise open definition file
        const modelPath = this.getModelPath();
        //read files from models directory
        //store file list in a private variable
        if (typeof this[filesProperty] === 'undefined') {
            const nativeFsModule = 'fs';
            const fs = require(nativeFsModule);
            if (typeof fs.readdirSync === 'function') {
                let dirExists = true;
                if (typeof fs.existsSync === 'function') {
                    dirExists = fs.existsSync(modelPath);
                }
                if (dirExists) {
                    this[filesProperty] = fs.readdirSync(modelPath);
                }
                else {
                    this[filesProperty] = [];
                }
            }
            else {
                //try load model definition
                try {
                    modelDefinition = require(PathUtils.join(modelPath, name.concat('.json')));
                    this.setModelDefinition(modelDefinition);
                    return modelDefinition;
                }
                catch(err) {
                    //do nothing (log error)
                    TraceUtils.error('An error occurred while loading definition for model %s.', name);
                    TraceUtils.error(err);
                }
            }
        }
        //and finally get this list of file
        const files = this[filesProperty];
        if (files.length===0) {
            return;
        }
        let searchName;
        if (singularName) {
            // search for singular name also e.g. ^(User|Users)\.json$
            searchName = new RegExp('^(' + singularName + '|' + name + ')\\.json$','i');   
        }
        else {
            // otherwise search for name e.g. ^User\.json$
            searchName = new RegExp('^' + name + '\\.json$','i');
        }
        for (i = 0; i < files.length; i++) {
            searchName.lastIndex=0;
            if (searchName.test(files[i])) {
                //build model file path
                const finalPath = PathUtils.join(modelPath, files[i]);
                //get model
                const result = require(finalPath);
                //set definition
                this.setModelDefinition(result);
                //and finally return this definition
                return result;
            }
        }
    }
}


/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @augments ConfigurationStrategy
 */
class ModelClassLoaderStrategy extends ConfigurationStrategy {
    constructor(config) {
        super(config);
    }

    /**
     * @param {DataModel} model
     * @returns {Function}
     */
    // eslint-disable-next-line no-unused-vars
    resolve(model) {
        throw new AbstractMethodError();
    }
}


/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @augments ModelClassLoaderStrategy
 */
class DefaultModelClassLoaderStrategy extends ModelClassLoaderStrategy {
    constructor(config) {
        super(config);
    }

    /**
     * @param {DataModel} model
     * @returns {Function}
     */
    resolve(model) {
        Args.notNull(model, 'Model');
        const dataObjectClassProperty = 'DataObjectClass';
        // get data object class from the given model
        let DataObjectClass = model.DataObjectClass;
        // if DataObjectClass is a constructor
        if (typeof DataObjectClass === 'function') {
            return DataObjectClass;
        }
        //get model definition
        const modelDefinition = this.getConfiguration().getStrategy(SchemaLoaderStrategy).getModelDefinition(model.name);
        if (typeof model.classPath === 'string') {
            if (/^\.\//.test(model.classPath)) {
                modelDefinition[dataObjectClassProperty] = DataObjectClass = interopRequireDefault(PathUtils.join(this.getConfiguration().getExecutionPath(),model.classPath));
            }
            else {
                modelDefinition[dataObjectClassProperty] = DataObjectClass = interopRequireDefault(model.classPath);
            }
        }
        else {
            //try to find module by using capitalize naming convention
            // e.g. OrderDetail -> OrderDetailModel.js
            let classPath = PathUtils.join(this.getConfiguration().getExecutionPath(),'models',model.name.concat('Model'));
            try {
                modelDefinition[dataObjectClassProperty] = DataObjectClass = interopRequireDefault(classPath);
            }
            catch(err) {
                if (err.code === 'MODULE_NOT_FOUND') {
                    try {
                        //try to find module by using dasherize naming convention
                        // e.g. OrderDetail -> order-detail-model.js
                        classPath = PathUtils.join(this.getConfiguration().getExecutionPath(),'models',_.dasherize(model.name).concat('-model'));
                        modelDefinition[dataObjectClassProperty] = DataObjectClass = interopRequireDefault(classPath);
                    }
                    catch(err) {
                        if (err.code === 'MODULE_NOT_FOUND') {
                            if (_.isNil(model['inherits'])) {
                                if (_.isNil(model['implements'])) {
                                    //use default DataObject class
                                    modelDefinition[dataObjectClassProperty] = DataObjectClass = interopRequireDefault('./data-object').DataObject;
                                }
                                else {
                                    //use implemented data model class
                                    modelDefinition[dataObjectClassProperty] = DataObjectClass = this.resolve(model.context.model(model['implements']));
                                }
                            }
                            else {
                                modelDefinition[dataObjectClassProperty] = DataObjectClass = this.resolve(model.base());
                            }
                        }
                        else {
                            throw err;
                        }
                    }
                }
                else {
                    throw err;
                }
            }
        }
        return DataObjectClass;
    }
}


/**
 * Gets the current data configuration
 * @returns DataConfiguration - An instance of DataConfiguration class which represents the current data configuration
 */
function getCurrent() {
    return DataConfiguration.getCurrent();
}
/**
 * Sets the current data configuration
 * @param {DataConfiguration} configuration
 * @returns DataConfiguration - An instance of DataConfiguration class which represents the current data configuration
 */
function setCurrent(configuration) {
    return DataConfiguration.setCurrent(configuration);
}

/**
 * Gets an instance of DataConfiguration class based on the given name.
 * If the named data configuration does not exists, it will create a new instance of DataConfiguration class with the given name.
 * @param {string} name - A string which represents the name of the data configuration
 * @returns {DataConfiguration}
 */
function getNamedConfiguration(name) {
    return DataConfiguration.getNamedConfiguration(name);
}

export {
    getCurrent,
    setCurrent,
    getNamedConfiguration,
    DataTypePropertiesConfiguration,
    DataTypeConfiguration,
    DataAdapterTypeConfiguration,
    DataAdapterConfiguration,
    AuthSettingsConfiguration,
    DataConfiguration,
    DataConfigurationStrategy,
    SchemaLoaderStrategy,
    DefaultSchemaLoaderStrategy,
    ModelClassLoaderStrategy,
    DefaultModelClassLoaderStrategy
};

