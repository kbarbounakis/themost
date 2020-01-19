import { AbstractClassError } from '@themost/common';
import { AbstractMethodError } from '@themost/common';
/**
 * @classdesc Represents an abstract data connector to a database
 * @description
 * <p>
 There are several data adapters for connections to common database engines:
 </p>
 <ul>
    <li>MOST Web Framework MySQL Adapter for connecting with MySQL Database Server
    <p>Install the data adapter:<p>
    <pre class="prettyprint"><code>npm install most-data-mysql</code></pre>
    <p>Append the adapter type in application configuration (app.json#adapterTypes):<p>
    <pre class="prettyprint"><code>
 ...
 "adapterTypes": [
 ...
 { "name":"MySQL Data Adapter", "invariantName": "mysql", "type":"most-data-mysql" }
 ...
 ]
 </code></pre>
 <p>Register an adapter in application configuration (app.json#adapters):<p>
 <pre class="prettyprint"><code>
 adapters: [
 ...
 { "name":"development", "invariantName":"mysql", "default":true,
     "options": {
       "host":"localhost",
       "port":3306,
       "user":"user",
       "password":"password",
       "database":"test"
     }
 }
 ...
 ]
 </code></pre>
 </li>
    <li>MOST Web Framework MSSQL Adapter for connecting with Microsoft SQL Database Server
 <p>Install the data adapter:<p>
 <pre class="prettyprint"><code>npm install most-data-mssql</code></pre>
 <p>Append the adapter type in application configuration (app.json#adapterTypes):<p>
 <pre class="prettyprint"><code>
 ...
 "adapterTypes": [
 ...
 { "name":"MSSQL Data Adapter", "invariantName": "mssql", "type":"most-data-mssql" }
 ...
 ]
 </code></pre>
 <p>Register an adapter in application configuration (app.json#adapters):<p>
 <pre class="prettyprint"><code>
 adapters: [
 ...
 { "name":"development", "invariantName":"mssql", "default":true,
        "options": {
          "server":"localhost",
          "user":"user",
          "password":"password",
          "database":"test"
        }
    }
 ...
 ]
 </code></pre>
 </li>
    <li>MOST Web Framework PostgreSQL Adapter for connecting with PostgreSQL Database Server
 <p>Install the data adapter:<p>
 <pre class="prettyprint"><code>npm install most-data-pg</code></pre>
 <p>Append the adapter type in application configuration (app.json#adapterTypes):<p>
 <pre class="prettyprint"><code>
 ...
 "adapterTypes": [
 ...
 { "name":"PostgreSQL Data Adapter", "invariantName": "postgres", "type":"most-data-pg" }
 ...
 ]
 </code></pre>
 <p>Register an adapter in application configuration (app.json#adapters):<p>
 <pre class="prettyprint"><code>
 adapters: [
 ...
 { "name":"development", "invariantName":"postgres", "default":true,
        "options": {
          "host":"localhost",
          "post":5432,
          "user":"user",
          "password":"password",
          "database":"db"
        }
    }
 ...
 ]
 </code></pre>
 </li>
    <li>MOST Web Framework Oracle Adapter for connecting with Oracle Database Server
 <p>Install the data adapter:<p>
 <pre class="prettyprint"><code>npm install most-data-oracle</code></pre>
 <p>Append the adapter type in application configuration (app.json#adapterTypes):<p>
 <pre class="prettyprint"><code>
 ...
 "adapterTypes": [
 ...
 { "name":"Oracle Data Adapter", "invariantName": "oracle", "type":"most-data-oracle" }
 ...
 ]
 </code></pre>
 <p>Register an adapter in application configuration (app.json#adapters):<p>
 <pre class="prettyprint"><code>
 adapters: [
 ...
 { "name":"development", "invariantName":"oracle", "default":true,
        "options": {
          "host":"localhost",
          "port":1521,
          "user":"user",
          "password":"password",
          "service":"orcl",
          "schema":"PUBLIC"
        }
    }
 ...
 ]
 </code></pre>
 </li>
    <li>MOST Web Framework SQLite Adapter for connecting with Sqlite Databases
 <p>Install the data adapter:<p>
 <pre class="prettyprint"><code>npm install most-data-sqlite</code></pre>
 <p>Append the adapter type in application configuration (app.json#adapterTypes):<p>
 <pre class="prettyprint"><code>
 ...
 "adapterTypes": [
 ...
 { "name":"SQLite Data Adapter", "invariantName": "sqlite", "type":"most-data-sqlite" }
 ...
 ]
 </code></pre>
 <p>Register an adapter in application configuration (app.json#adapters):<p>
 <pre class="prettyprint"><code>
 adapters: [
 ...
 { "name":"development", "invariantName":"sqlite", "default":true,
        "options": {
            database:"db/local.db"
        }
    }
 ...
 ]
 </code></pre>
 </li>
    <li>MOST Web Framework Data Pool Adapter for connection pooling
 <p>Install the data adapter:<p>
 <pre class="prettyprint"><code>npm install most-data-pool</code></pre>
 <p>Append the adapter type in application configuration (app.json#adapterTypes):<p>
 <pre class="prettyprint"><code>
 ...
 "adapterTypes": [
 ...
 { "name":"Pool Data Adapter", "invariantName": "pool", "type":"most-data-pool" }
 { "name":"...", "invariantName": "...", "type":"..." }
 ...
 ]
 </code></pre>
 <p>Register an adapter in application configuration (app.json#adapters):<p>
 <pre class="prettyprint"><code>
 adapters: [
 { "name":"development", "invariantName":"...", "default":false,
    "options": {
      "server":"localhost",
      "user":"user",
      "password":"password",
      "database":"test"
    }
},
 { "name":"development_with_pool", "invariantName":"pool", "default":true,
    "options": {
      "adapter":"development"
    }
}
 ...
 ]
 </code></pre>
 </li>
 </ul>
 * @class
 * @constructor
 * @param {*} options - The database connection options
 * @abstract
 * @property {*} rawConnection - Gets or sets the native database connection
 * @property {*} options - Gets or sets the database connection options
 */
class DataAdapter {
    constructor(options) {
        if (this.constructor === DataAdapter.prototype.constructor) {
            throw new AbstractClassError();
        }
        this.rawConnection = null;
        this.options = options;
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * Opens the underlying database connection
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    open(callback) {
        throw new AbstractMethodError();
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * Closes the underlying database connection
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    close(callback) {
        throw new AbstractMethodError();
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * Executes the given query against the underlying database.
     * @param {string|*} query - A string or a query expression to execute.
     * @param {*} values - An object which represents the named parameters that are going to used during query parsing
     * @param {Function} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    execute(query, values, callback) {
        throw new AbstractMethodError();
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * Produces a new identity value for the given entity and attribute.
     * @param {string} entity - A string that represents the target entity name
     * @param {string} attribute - A string that represents the target attribute name
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    selectIdentity(entity, attribute, callback) {
        throw new AbstractMethodError();
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * Begins a transactional operation and executes the given function
     * @param {Function} fn - The function to execute
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise. The second argument will contain the result.
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    executeInTransaction(fn, callback) {
        throw new AbstractMethodError();
    }
    // noinspection JSUnusedLocalSymbols
    /**
     * A helper method for creating a database view if the current data adapter supports views
     * @param {string} name - A string that represents the name of the view to be created
     * @param {QueryExpression|*} query - A query expression that represents the database view
     * @param {Function=} callback - A callback function where the first argument will contain the Error object if an error occurred, or null otherwise.
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    createView(name, query, callback) {
        throw new AbstractMethodError();
    }
}
