/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
/**/
const path = require('path');
const HttpConfiguration = require('./config').HttpConfiguration;
const HttpContext = require("./context").HttpContext;
const SequentialEventEmitter = require('@themost/common').SequentialEventEmitter;
const Args = require('@themost/common').Args;
const query = require('./consumers/query');
const serveStatic = require('serve-static');
const HttpApplicationService = require('./types').HttpApplicationService;
const AuthStrategy = require('./handlers/auth').AuthStrategy;
const DefaultAuthStrategy = require('./handlers/auth').DefaultAuthStrategy;
const EncryptionStrategy = require('./handlers/auth').EncryptionStrategy;
const DefaultEncryptionStrategy = require('./handlers/auth').DefaultEncryptionStrategy;
const CacheStrategy = require('./cache').CacheStrategy;
const DefaultCacheStrategy = require('./cache').DefaultCacheStrategy;
const LocalizationStrategy = require('./localization').LocalizationStrategy;
const I18nLocalizationStrategy = require('./localization').I18nLocalizationStrategy;
const DataConfigurationStrategy = require('@themost/data').DataConfigurationStrategy;
const HttpNotFoundError = require('@themost/common').HttpNotFoundError;

class HttpContextProvider extends HttpApplicationService {
    constructor(app) {
        super(app);
    }

    create(req, res) {
        const context = new HttpContext(req,res);
        //set context application
        context.application = this.getApplication();
        return context;
    }
}

class HttpApplication extends SequentialEventEmitter {
    constructor(executionPath) {
        // call super constructor
        super();
        // get execution path
        executionPath = (executionPath != null) ? path.resolve(executionPath) : process.cwd();
        // define execution path
        Object.defineProperty(this, 'executionPath', {
            value: executionPath,
            writable: false
        });
        // define an empty array of handlers
        Object.defineProperty(this, 'handlers', {
            value: [],
            writable: false
        });

        // define an empty array of handlers
        Object.defineProperty(this, 'services', {
            value: {},
            enumerable: false,
            writable: false
        });

        // define configuration
        Object.defineProperty(this, 'configuration', {
            value: new HttpConfiguration(path.resolve(executionPath, 'config')),
            writable: false
        });
        // use query string
        this.use(query());
        // set default context provider
        this.useStrategy(HttpContextProvider, HttpContextProvider);
        //set authentication strategy
        this.useStrategy(AuthStrategy, DefaultAuthStrategy);
        //set cache strategy
        this.useStrategy(CacheStrategy, DefaultCacheStrategy);
        //set encryption strategy
        this.useStrategy(EncryptionStrategy, DefaultEncryptionStrategy);
        //set localization strategy
        this.useStrategy(LocalizationStrategy, I18nLocalizationStrategy);
        //set authentication strategy
        this.configuration.useStrategy(DataConfigurationStrategy, DataConfigurationStrategy);
    }

    /**
     * @returns string
     * @deprecated This method has been deprecated. Use HttpApplication.executionPath instead.
     */
    getExecutionPath() {
        return this.executionPath;
    }

    /**
     * @returns HttpConfiguration
     * @deprecated This method has been deprecated. Use HttpApplication.configuration instead.
     */
    getConfiguration() {
        return this.configuration;
    }

    /**
     * Registers a request handler
     * @param handler
     * @returns {HttpApplication}
     */
    use(handler) {
        this.handlers.push(handler);
        return this;
    }

    /**
     * Registers static file handler
     * @param {string} rootDir
     * @param {ServeStaticOptions} options
     * @returns {HttpApplication}
     */
    useStaticContent(rootDir, options) {
        return this.use(serveStatic(rootDir, options))
    }
    /**
     * Registers an application strategy e.g. an singleton service which to be used in application contextr
     * @param {Function} serviceCtor
     * @param {Function} strategyCtor
     * @returns HttpApplication
     */
    useStrategy(serviceCtor, strategyCtor) {
        Args.notFunction(strategyCtor,"Service constructor");
        Args.notFunction(strategyCtor,"Strategy constructor");
        this.services[serviceCtor.name] = new strategyCtor(this);
        return this;
    }
    /**
     * Register a service type in application services
     * @param {Function} serviceCtor
     * @returns HttpApplication
     */
    useService(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        this.services[serviceCtor.name] = new serviceCtor(this);
        return this;
    }
    /**
     * Returns true of application has a strategy of the given base type
     * @param {Function} serviceCtor
     * @returns {boolean}
     */
    hasStrategy(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        return this.services.hasOwnProperty(serviceCtor.name);
    }
    /**
     * Returns true of application has a service of the given type
     * @param {Function} serviceCtor
     * @returns {boolean}
     */
    hasService(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        return this.services.hasOwnProperty(serviceCtor.name);
    }
    /**
     * Gets an application strategy based on the given base service type
     * @param {Function} serviceCtor
     * @return {*}
     */
    getStrategy(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        return this.services[serviceCtor.name];
    }
    /**
     * Gets an application service based on the given base service type
     * @param {Function} serviceCtor
     * @return {*}
     */
    getService(serviceCtor) {
        Args.notFunction(serviceCtor,"Service constructor");
        return this.services[serviceCtor.name];
    }

    getContextProvider() {
        return this.getService(HttpContextProvider);
    }

    createContext(request, response) {
        /**
         * @type {HttpContext}
         */
        const context = this.getContextProvider().create(request, response);
        //set context application
        // noinspection JSValidateTypes
        context.application = this;
        // bind handlers
        this.handlers.forEach( handler => {
            context.on('processRequest', function(context, done) {
                handler(context.request, context.response, (err) => {
                    if (err) {
                        return done(err);
                    }
                    return done();
                })
            });
        });

        context.on('processRequest', function(context, done) {
            return done(new HttpNotFoundError());
        });

        return context;
    }

    /**
     * Returns default runtime handler
     * @returns {RequestHandler}
     */
    runtime() {
        const self = this;
        return function runtimeParser(req, res, next) {
            //create context
            const context = self.createContext(req,res);
            context.request.on('close', function() {
                //finalize data context
                if (context != null) {
                    context.finalize(function() {
                        if (context.response) {
                            //if response is alive
                            if (context.response.finished === false) {
                                //end response
                                context.response.end();
                            }
                        }
                    });
                }
            });
            //process request
            context.emit('processRequest', context, function (err) {
                if (err) {
                    return context.finalize(function() {
                        return next(err);
                    });
                }
                return context.finalize(function() {
                    context.response.end();
                });
            });
        };
    }

}

module.exports.HttpContextProvider = HttpContextProvider;
module.exports.HttpApplication = HttpApplication;
