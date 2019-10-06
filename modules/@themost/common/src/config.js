/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import _ from 'lodash';
import {Args} from './utils';
import {TraceUtils} from './utils';
import {PathUtils} from './utils';
import {AbstractClassError} from './errors';

/**
 * @class Represents an application configuration
 * @param {string=} configPath
 * @property {*} settings
 * @constructor
 */
export class ConfigurationBase {
    constructor(configPath) {
        
        // set strategies
        Object.defineProperty(this, '_strategies', {
            enumerable: false,
            writable: false,
            value: { }
        });

        // set configuration path
        Object.defineProperty(this, '_configurationPath', {
            enumerable: false,
            writable: false,
            value: configPath || PathUtils.join(process.cwd(),'config')
        });
        TraceUtils.debug('Initializing configuration under %s.', this._configurationPath);

        // set execution path
        Object.defineProperty(this, '_executionPath', {
            enumerable: false,
            writable: false,
            value: PathUtils.join(this._configurationPath,'..')
        });
        TraceUtils.debug('Setting execution path under %s.', this._executionPath);

        // set config source
        // set execution path
        Object.defineProperty(this, '_config', {
            enumerable: false,
            configurable: false,
            value: { }
        });

        //load default module loader strategy
        this.useStrategy(ModuleLoaderStrategy, DefaultModuleLoaderStrategy);

        //get configuration source
        let configSourcePath;
        try {
            let env = 'production';
            //node.js mode
            if (process && process.env) {
                env = process.env['NODE_ENV'] || 'production';
            }
            //browser mode
            else if (window && window.env) {
                env = window.env['BROWSER_ENV'] || 'production';
            }
            configSourcePath = PathUtils.join(this._configurationPath, 'app.' + env + '.json');
            TraceUtils.debug('Validating environment configuration source on %s.', configSourcePath);
            this._config = require(configSourcePath);
        }
        catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                TraceUtils.log('The environment specific configuration cannot be found or is inaccesible.');
                try {
                    configSourcePath = PathUtils.join(this._configurationPath, 'app.json');
                    TraceUtils.debug('Validating application configuration source on %s.', configSourcePath);
                    this._config = require(configSourcePath);
                }
                catch(err) {
                    if (err.code === 'MODULE_NOT_FOUND') {
                        TraceUtils.log('The default application configuration cannot be found or is inaccesible.');
                    }
                    else {
                        TraceUtils.error('An error occured while trying to open default application configuration.');
                        TraceUtils.error(err);
                    }
                    TraceUtils.debug('Initializing empty configuration');
                    this._config = { };
                }
            }
            else {
                TraceUtils.error('An error occured while trying to open application configuration.');
                TraceUtils.error(err);
                //load default configuration
                this._config = { };
            }
        }
        //initialize settings object
        this._config['settings'] = this._config['settings'] || { };

        /**
         * @name ConfigurationBase#settings
         * @type {*}
         */

        Object.defineProperty(this, 'settings',{
            get: function() {
                return this._config['settings'];
        },
            enumerable:true,
            configurable:false});

    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Returns the configuration source object
     * @returns {*}
     */
    getSource() {
        return this._config;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Returns the source configuration object based on the given path (e.g. settings.auth.cookieName or settings/auth/cookieName)
     * @param {string} p - A string which represents an object path
     * @returns {Object|Array}
     */
    getSourceAt(p) {
        return _.at(this._config,p.replace(/\//g,'.'))[0];
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Returns a boolean which indicates whether the specified  object path exists or not (e.g. settings.auth.cookieName or settings/auth/cookieName)
     * @param {string} p - A string which represents an object path
     * @returns {boolean}
     */
    hasSourceAt(p) {
        return _.isObject(_.at(this._config,p.replace(/\//g,'.'))[0]);
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Sets the config value to the specified object path (e.g. settings.auth.cookieName or settings/auth/cookieName)
     * @param {string} p - A string which represents an object path
     * @param {*} value
     * @returns {Object}
     */
    setSourceAt(p, value) {
        return _.set(this._config, p.replace(/\//g,'.'), value);
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Sets the current execution path
     * @param {string} p
     * @returns ConfigurationBase
     */
    setExecutionPath(p) {
        this._executionPath = p;
        return this;
    }

    /**
     * Gets the current execution path
     * @returns {string}
     */
    getExecutionPath() {
        return this._executionPath;
    }

    /**
     * Gets the current configuration path
     * @returns {string}
     */
    getConfigurationPath() {
        return this._configurationPath;
    }

    /**
     * Register a configuration strategy
     * @param {Function} configStrategyCtor
     * @param {Function} strategyCtor
     * @returns ConfigurationBase
     */
    useStrategy(configStrategyCtor, strategyCtor) {
        Args.notFunction(configStrategyCtor,"Configuration strategy constructor");
        Args.notFunction(strategyCtor,"Strategy constructor");
        this._strategies["$".concat(configStrategyCtor.name)] = new strategyCtor(this);
        return this;
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Gets a configuration strategy
     * @param {Function} configStrategyCtor
     */
    getStrategy(configStrategyCtor) {
        Args.notFunction(configStrategyCtor,"Configuration strategy constructor");
        return this._strategies["$".concat(configStrategyCtor.name)];
    }

    /**
     * Gets a configuration strategy
     * @param {Function} configStrategyCtor
     */
    hasStrategy(configStrategyCtor) {
        Args.notFunction(configStrategyCtor,"Configuration strategy constructor");
        return typeof this._strategies["$".concat(configStrategyCtor.name)] !== 'undefined';
    }

    /**
     * Gets the current configuration
     * @returns ConfigurationBase - An instance of DataConfiguration class which represents the current data configuration
     */
    static getCurrent() {
        if (ConfigurationBase._currentConfiguration == null) {
            ConfigurationBase._currentConfiguration = new ConfigurationBase();
        }
        return ConfigurationBase._currentConfiguration;
    }

    /**
     * Sets the current configuration
     * @param {ConfigurationBase} configuration
     * @returns ConfigurationBase - An instance of ApplicationConfiguration class which represents the current configuration
     */
    static setCurrent(configuration) {
        if (configuration instanceof ConfigurationBase) {
            if (!configuration.hasStrategy(ModuleLoaderStrategy)) {
                configuration.useStrategy(ModuleLoaderStrategy, DefaultModuleLoaderStrategy);
            }
            ConfigurationBase._currentConfiguration = configuration;
            return ConfigurationBase._currentConfiguration;
        }
        throw new TypeError('Invalid argument. Expected an instance of DataConfiguration class.');
    }
}

Object.defineProperty(ConfigurationBase, '_currentConfiguration', {
    enumerable: false,
    configurable: false,
    value: null
});

/**
 * @class
 * @param {ConfigurationBase} config
 * @constructor
 * @abstract
 */
export class ConfigurationStrategy {
    constructor(config) {
        Args.check(this.constructor.name !== ConfigurationStrategy, new AbstractClassError());
        Args.notNull(config, 'Configuration');
        this._config = config;
    }

    /**
     * @returns {ConfigurationBase}
     */
    getConfiguration() {
        return this._config;
    }
}

/**
 * @class
 * @constructor
 * @param {ConfigurationBase} config
 * @extends ConfigurationStrategy
 */
export class ModuleLoaderStrategy extends ConfigurationStrategy {
    constructor(config) {
        super(config);
    }

    require(modulePath) {
        Args.notEmpty(modulePath,'Module Path');
        if (!/^.\//i.test(modulePath)) {
            if (require.resolve && require.resolve.paths) {
                /**
                 * get require paths collection
                 * @type string[]
                 */
                let paths = require.resolve.paths(modulePath);
                //get execution
                let path1 = this.getConfiguration().getExecutionPath();
                //loop directories to parent (like classic require)
                while (path1) {
                    //if path does not exist in paths collection
                    if (paths.indexOf(PathUtils.join(path1,'node_modules'))<0) {
                        //add it
                        paths.push(PathUtils.join(path1,'node_modules'));
                        //and check the next path which is going to be resolved
                        if (path1 === PathUtils.join(path1,'..')) {
                            //if it is the same with the current path break loop
                            break;
                        }
                        //otherwise get parent path
                        path1 = PathUtils.join(path1,'..');
                    }
                    else {
                        //path already exists in paths collection, so break loop
                        break;
                    }
                }
                let finalModulePath = require.resolve(modulePath, {
                    paths:paths
                });
                return require(finalModulePath);
            }
            else {
                return require(modulePath);
            }
        }
        return require(PathUtils.join(this.getConfiguration().getExecutionPath(),modulePath));
    }
}

/**
 * @classdesc
 * @extends ModuleLoaderStrategy
 */
export class DefaultModuleLoaderStrategy extends ModuleLoaderStrategy {
    /**
    * @param {ConfigurationBase} config
    */
    constructor(config) {
        super(config);
    }
}


