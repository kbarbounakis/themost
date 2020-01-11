/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import initSqlJs from 'sql.js';
import {SqlUtils} from './SqlUtils';
import {QueryExpression} from './QueryExpression';
import {QueryField} from './QueryField';
import {MemoryFormatter} from './TestMemoryFormatter.spec';
import {TraceUtils} from '@themost/common';

const INSTANCE_DB = new Map();
const DateTimeRegex = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)(?:Z(-?\d*))?([+-](\d+):(\d+))?$/;

/**
 *
 */
export class MemoryAdapter {

    static isDate(value) {
        if (value instanceof Date) {
            return true;
        }
        return DateTimeRegex.test(value);
    }

    constructor(options) {
        // noinspection JSUnusedGlobalSymbols
        /**
         * @type {{database: string}}
         */
        this.options = options || { name: 'memory' };
        /**
         * Represents the database raw connection associated with this adapter
         * @type {*}
         */
        this.rawConnection = null;
    }

    /**
     * Opens database connection
     * @param {AdapterExecuteCallback} callback
     * @returns {*}
     */
    open(callback) {
        const self = this;
        callback = callback || function() {};
        // if connection is open
        if (self.rawConnection) {
            // return
            return callback();
        }
        // init database
        return initSqlJs().then( SQL => {
            // try to get instance
            const db = INSTANCE_DB.get(self.options.name);
            if (db) {
                // set database connection
                self.rawConnection = db;
            }
            else {
                self.options.name = self.options.name || 'memory-db';
                // create database connection
                self.rawConnection = new SQL.Database();
                TraceUtils.debug(`Database initialization for ${self.options.name} file=${self.rawConnection.filename} db=${self.rawConnection.db}`);
                // set instance database
                INSTANCE_DB.set(self.options.name, self.rawConnection);
            }
            // and return
            return callback();
        }).catch( err => {
            return callback(err);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Opens database connection
     * @returns {Promise<*>}
     */
    openAsync() {
        return new Promise((resolve, reject) => {
            return this.open( err => {
                if (err) {
                   return reject(err);
                }
                return resolve();
            })
        });
    }

    /**
     * Closes database connection
     * @param {function(): *} callback
     * @returns {*}
     */
    close(callback) {
        const self = this;
        callback = callback || function() {};
        if (self.rawConnection == null) {
            return callback();
        }
        self.rawConnection = null;
        return callback();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Closes database connection
     * @returns {Promise<*>}
     */
    closeAsync() {
        return new Promise((resolve, reject) => {
            return this.close( err => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        });
    }

    /**
     * Prepares a query expression with the specified parameters
     * @param {string} query - A parameterized query expression e.g. SELECT * FROM Table1 WHERE status = ?
     * @param {Array<*>=} values - An array of parameters
     */
    prepare(query, values) {
        return SqlUtils.format(query,values);
    }

    /**
     * @param {MemoryAdapterColumn} field
     * @returns {string}
     */
    static formatType(field) {
        const size = parseInt(field.size);
        let s;
        switch (field.type)
        {
            case 'Boolean':
                s = 'INTEGER(1,0)';
                break;
            case 'Byte':
                s = 'INTEGER(1,0)';
                break;
            case 'Number':
            case 'Float':
                s = 'REAL';
                break;
            case 'Counter':
                return 'INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL';
            case 'Currency':
                s =  'NUMERIC(' + (field.size || 19) + ',4)';
                break;
            case 'Decimal':
                s =  'NUMERIC';
                if ((field.size) && (field.scale)) { s += '(' + field.size + ',' + field.scale + ')'; }
                break;
            case 'Date':
            case 'DateTime':
                s = 'NUMERIC';
                break;
            case 'Time':
                s = size>0 ?  `TEXT(${size},0)` : 'TEXT';
                break;
            case 'Long':
                s = 'NUMERIC';
                break;
            case 'Duration':
                s = size > 0 ? `TEXT(${size},0)` : 'TEXT(48,0)';
                break;
            case 'Integer':
                s = 'INTEGER' + (size ? '(' + size + ',0)':'' );
                break;
            case 'URL':
            case 'Text':
            case 'Note':
                s = size > 0 ? `TEXT(${size},0)` : 'TEXT';
                break;
            case 'Image':
            case 'Binary':
                s ='BLOB';
                break;
            case 'Guid':
                s = 'TEXT(36,0)';
                break;
            case 'Short':
                s = 'INTEGER(2,0)';
                break;
            default:
                s = 'INTEGER';
                break;
        }
        if (field.primary) {
            return s.concat(' PRIMARY KEY NOT NULL');
        }
        else {
            return s.concat((field.nullable===undefined) ? ' NULL': (field.nullable ? ' NULL': ' NOT NULL'));
        }
    }

    /**
     * Begins a transactional operation by executing the given function
     * @param {TransactionFunctionCallback} transactionFunc The function to execute
     * @param {AdapterExecuteCallback} callback The callback that contains the error -if any- and the results of the given operation
     */
    executeInTransaction(transactionFunc, callback) {
        const self = this;
        //ensure parameters
        transactionFunc = transactionFunc || function() {};
        callback = callback || function() {};
        self.open(function(err) {
            if (err) {
                return callback(err);
            }
            // if adapter has an active transaction
            if (self.transaction) {
                return transactionFunc.call(self, (err) => {
                    callback(err);
                });
            }
            // begin transaction
            return self.execute('BEGIN TRANSACTION;', null, (err) => {
                if (err) {
                    // sometimes something went wrong with transaction validation
                    // so prevent error while starting a transaction by handling 'cannot start transaction' error
                    // and continue
                    if (err.message === 'cannot start a transaction within a transaction') {
                        self.transaction = { };
                        return callback();
                    }
                    return callback(err);
                }
                //initialize dummy transaction object (for future use)
                self.transaction = { };
                //execute function
                transactionFunc.call(self, (err) => {
                    if (err) {
                        //rollback transaction
                        self.execute('ROLLBACK;', null, rollbackError => {
                            if (rollbackError) {
                                TraceUtils.error(`An error occurred while transaction being rolled back.`);
                                TraceUtils.error(rollbackError);
                            }
                            self.transaction = null;
                            return callback(err);
                        });
                    }
                    else {
                        //commit transaction
                        self.execute('COMMIT;', null, commitError => {
                            self.transaction = null;
                            return callback(commitError);
                        });
                    }
                });
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Begins a transactional operation by executing the given function
     * @param {TransactionFunction} transactionFunc
     * @returns {Promise<void>}
     */
    executeInTransactionAsync(transactionFunc) {
        return new Promise((resolve, reject) => {
           this.executeInTransaction((cb) => {
               transactionFunc.bind(this)().then(() => {
                   return cb();
               }).catch( err => {
                   return cb(err);
               });
           }, ((error) => {
               if (error) {
                   return reject(error);
               }
               return resolve();
           }));
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} name
     * @param {*} query
     * @param {AdapterExecuteCallback} callback
     */
    createView(name, query, callback) {
        return this.view(name).create(query, callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * A shortcut method of MemoryAdapter.view().create()
     * @param {string} name
     * @param {*} query
     */
    createViewAsync(name, query) {
        return this.view(name).createAsync(query);
    }

    /*
     * @param {MemoryAdapterMigration} obj An Object that represents the data model scheme we want to migrate
     * @param {function(Error=)} callback
     */
    migrate(obj, callback) {
        const self = this;
        callback = callback || function() {};
        if (obj == null) {
            return callback();
        }
        /**
         * @type {MemoryAdapterMigration}
         */
        const migration = obj;
        const format = function(format, obj)
        {
            let result = format;
            if (/%t/.test(format))
                result = result.replace(/%t/g,MemoryAdapter.formatType(obj));
            if (/%f/.test(format))
                result = result.replace(/%f/g,obj.name);
            return result;
        };
        (async function migrate() {
            // check if table `migrations`  exists or not
            let exists = await self.table('migrations').existsAsync();
            if (exists === false) {
                // create table `migrations`
                await self.executeAsync('CREATE TABLE "migrations" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                    '"appliesTo" TEXT NOT NULL, "model" TEXT NULL, "description" TEXT,"version" TEXT NOT NULL)')
            }
            // validate target version
            if (migration.appliesTo == null) {
                throw new Error('Target object may not be null will trying to execute a data migration.');
            }
            // get last version
            const lastVersion = await self.table(migration.appliesTo).versionAsync();
            // get version
            const version = migration.version || '1.0';
            if (lastVersion && lastVersion >= version) {
                // do nothing because data migration has been already applied
                migration.updated = true;
                return;
            }
            // check table existence
            exists = await self.table(migration.appliesTo).existsAsync();
            if (exists === false) {
                // create table
                const str1 = migration.add.filter( x => {
                    return !x['oneToMany'];
                }).map( x => {
                        return format('"%f" %t', x);
                    }).join(', ');
                const sql = `CREATE TABLE "${migration.appliesTo}" (${str1})`;
                // execute create with a clone of current adapter in order to execute CREATE TABLE out of transaction
                await self.executeAsync(sql);
                // set updated to false
                migration.updated = false;
            }
            else {
                // get table columns (use clone adapter)
                const columns = await self.table(migration.appliesTo).columnsAsync();
                let forceAlter = false;
                let newType;
                let oldType;
                let column;
                let expressions = [];
                // columns to be removed
                if (Array.isArray(migration.remove)) {
                    if (migration.remove.length) {
                        for (let i = 0; i < migration.remove.length; i++) {
                            let x = migration.remove[i];
                            let colIndex = columns.findIndex( y => {
                                // noinspection JSUnresolvedVariable
                                return y.name === x.name;
                            });
                            if (colIndex>=0) {
                                if (!columns[colIndex].primary) {
                                    // set force later column
                                    forceAlter = true;
                                }
                                else {
                                    // remove column from remove collection
                                    migration.remove.splice(i, 1);
                                    i-=1;
                                }
                            }
                            else {
                                // remove column from remove collection
                                migration.remove.splice(i, 1);
                                i-=1;
                            }
                        }
                    }
                }
                // columns to be changed
                if (Array.isArray(migration.change)) {
                    if (migration.change.length) {
                        for (let i = 0; i < migration.change.length; i++) {
                            let x = migration.change[i];
                            column = columns.find( y => {
                                // noinspection JSUnresolvedVariable
                                return y.name === x.name;
                            });
                            if (column) {
                                if (!column.primary) {
                                    // validate new column type (e.g. TEXT(120,0) NOT NULL)
                                    newType = format('%t', x); oldType = column.type.toUpperCase().concat(column.nullable ? ' NOT NULL' : ' NULL');
                                    if ((newType !== oldType)) {
                                        //force alter
                                        forceAlter = true;
                                    }
                                }
                                else {
                                    // remove column from change collection (because it's a primary key)
                                    migration.change.splice(i, 1);
                                    i-=1;
                                }
                            }
                            else {
                                // add column (column was not found in table)
                                migration.add.push(x);
                                // remove column from change collection
                                migration.change.splice(i, 1);
                                i-=1;
                            }
                        }
                    }
                }
                // columns to be added
                if (Array.isArray(migration.add)) {
                    for (let i = 0; i < migration.add.length; i++) {
                        let x = migration.add[i];
                        column = columns.find( y => {
                            // noinspection JSUnresolvedVariable
                            return (y.name === x.name);
                        });
                        if (column) {
                            if (column.primary) {
                                migration.add.splice(i, 1);
                                i-=1;
                            }
                            else {
                                newType = format('%t', x); oldType = column.type.toUpperCase().concat(column.nullable ? ' NOT NULL' : ' NULL');
                                if (newType === oldType) {
                                    //remove column from add collection
                                    migration.add.splice(i, 1);
                                    i-=1;
                                }
                                else {
                                    forceAlter = true;
                                }
                            }
                        }
                    }
                    if (forceAlter) {
                        throw new Error('Full table migration is not yet implemented.');
                    }
                    else {
                        migration.add.forEach( x => {
                            //search for columns
                            expressions.push(`ALTER TABLE "${migration.appliesTo}" ADD COLUMN "${x.name}" ${MemoryAdapter.formatType(x)}`);
                        });
                    }
                }
                // set updated to false
                migration.updated = (expressions.length === 0);
                // execute expressions (with clone adapter)
                if (expressions.length) {
                    for (let i = 0; i < expressions.length; i++) {
                        const expression = migration[i];
                        await self.executeAsync(expression);
                    }
                }
            }
            // finally do update version (with clone adapter)
            await self.executeAsync('INSERT INTO "migrations" ("appliesTo", "model", "version", "description") VALUES (?,?,?,?)', [
                migration.appliesTo,
                migration.model,
                migration.version,
                migration.description
            ]);
        })().then(() => {
            setTimeout(()=> {
                return callback();
            }, 100);
        }).catch( err => {
            return callback(err);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {MemoryAdapterMigration} migration
     */
    migrateAsync(migration) {
        return new Promise((resolve, reject) => {
            return this.migrate(migration, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        });
    }

    /**
     * Produces a new identity value for the given entity and attribute.
     * @param entity {string} The target entity name
     * @param attribute {string} The target attribute
     * @param {AdapterExecuteCallback} callback
     */
    selectIdentity(entity, attribute, callback) {

        const self = this;

        const migration = {
            appliesTo:'increment_id',
            model:'increments',
            description:'Increments migration (version 1.0)',
            version:'1.0',
            add:[
                { name:'id', type:'Counter', primary:true },
                { name:'entity', type:'Text', size:120 },
                { name:'attribute', type:'Text', size:120 },
                { name:'value', type:'Integer' }
            ]
        };
        //ensure increments entity
        self.migrate(migration, function(err)
        {
            //throw error if any
            if (err) { callback.call(self,err); return; }
            self.execute('SELECT * FROM increment_id WHERE entity=? AND attribute=?', [entity, attribute], function(err, result) {
                if (err) { callback.call(self,err); return; }
                if (result.length===0) {
                    //get max value by querying the given entity
                    const q = new QueryExpression().from(entity).select([new QueryField().max(attribute)]);
                    self.execute(q,null, function(err, result) {
                        if (err) { callback.call(self, err); return; }
                        let value = 1;
                        if (result.length>0) {
                            value = (parseInt(result[0][attribute]) || 0)+ 1;
                        }
                        self.execute('INSERT INTO increment_id(entity, attribute, value) VALUES (?,?,?)',[entity, attribute, value], function(err) {
                            //throw error if any
                            if (err) { callback.call(self, err); return; }
                            //return new increment value
                            callback.call(self, err, value);
                        });
                    });
                }
                else {
                    //get new increment value
                    const value = parseInt(result[0].value) + 1;
                    self.execute('UPDATE increment_id SET value=? WHERE id=?',[value, result[0].id], function(err) {
                        //throw error if any
                        if (err) { callback.call(self, err); return; }
                        //return new increment value
                        callback.call(self, err, value);
                    });
                }
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Produces a new identity value for the given entity and attribute.
     * @param {string} entity The target entity name
     * @param {string} attribute The target attribute
     * @returns Promise<*>
     */
    selectIdentityAsync(entity, attribute) {
        return new Promise((resolve, reject) => {
            return this.selectIdentity(entity, attribute, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        });
    }

    /**
     * A helper method for managing a database table
     * @param {string} name
     * @returns {MemoryAdapterTable}
     */
    table(name) {
        const self = this;
        return {
            /**
             * @param {ExistsCallback} callback
             */
            exists:function(callback) {
                self.execute(`SELECT COUNT(*) AS "count" FROM "sqlite_master" WHERE "name" = ? AND "type" = 'table';`, [ name ], (err, result) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, (result[0].count>0));
                });
            },
            /**
             * @returns {Promise<boolean>}
             */
            existsAsync() {
                const thisArg = this;
                return new Promise((resolve, reject) => {
                    return thisArg.exists((error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(result);
                    });
                });
            },
            /**
             * @param {VersionCallback} callback
             */
            version:function(callback) {
                self.execute(`SELECT MAX("version") AS "version" FROM "migrations" WHERE "appliesTo" = ?`,
                    [name], function(err, result) {
                        if (err) { return callback(err); }
                        if (result.length === 0)
                            callback(null, '0.0');
                        else
                            callback(null, result[0].version || '0.0');
                    });
            },
            /**
             * @returns {Promise<string>}
             */
            versionAsync() {
                const thisArg = this;
                return new Promise((resolve, reject) => {
                    return thisArg.version((error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(result);
                    });
                });
            },
            /**
             * @param {HasSequenceCallback} callback
             */
            hasSequence:function(callback) {
                callback = callback || function() {};
                self.execute(`SELECT COUNT(*) AS "count" FROM "sqlite_sequence" WHERE "name" = ?`,
                    [name], function(err, result) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, (result[0].count>0));
                    });
            },
            /**
             * @returns {Promise<boolean>}
             */
            hasSequenceAsync() {
                const thisArg = this;
                return new Promise((resolve, reject) => {
                    return thisArg.hasSequence((error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(result);
                    });
                });
            },
            /**
             * @param {ColumnsCallback} callback
             */
            columns:function(callback) {
                callback = callback || function() {};
                self.execute(`SELECT c.* from pragma_table_info(?) c;`,
                    [name], function(err, result) {
                        if (err) { callback(err); return; }
                        const arr = [];
                        /**
                         * enumerates table columns
                         * @param {{name:string},{cid:number},{type:string},{notnull:number},{pk:number}} x
                         */
                        const iterator = function(x) {
                            const col = {
                                name: x.name,
                                ordinal: x.cid,
                                type: x.type,
                                nullable: (!!x.notnull),
                                primary: (x.pk === 1)
                            };
                            const matches = /(\w+)\((\d+),(\d+)\)/.exec(x.type);
                            if (matches) {
                                //extract max length attribute (e.g. integer(2,0) etc)
                                if (parseInt(matches[2])>0) { col.size =  parseInt(matches[2]); }
                                //extract scale attribute from field (e.g. integer(2,0) etc)
                                if (parseInt(matches[3])>0) { col.scale =  parseInt(matches[3]); }
                            }
                            arr.push(col);
                        };
                        result.forEach(iterator);
                        callback(null, arr);
                    });
            },
            /**
             * @returns {Promise<Array<MemoryAdapterColumn>>}
             */
            columnsAsync() {
                return new Promise((resolve, reject) => {
                    return this.columns((error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve(result);
                    });
                });
            },
        };

    }

    /**
     * A helper method for managing a database view
     * @param {string} name
     * @returns {MemoryAdapterView}
     */
    view(name) {
        const self = this;
        const formatter = new MemoryFormatter();
        return {
            /**
             * @param {ExistsCallback} callback
             */
            exists:function(callback) {
                self.execute(`SELECT COUNT(*) count FROM sqlite_master WHERE name=? AND type=\'view\';`, [name], function(err, result) {
                    if (err) { callback(err); return; }
                    callback(null, (result[0].count>0));
                });
            },
            /**
             * @returns {Promise<boolean>}
             */
            existsAsync() {
              return new Promise((resolve, reject) => {
                 return this.exists((error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(result);
                 });
              });
            },
            /**
             * @param {AdapterExecuteCallback} callback
             */
            drop:function(callback) {
                callback = callback || function() {};
                self.open(function(err) {
                    if (err) { callback(err); return; }
                    const formatter = new MemoryFormatter();
                    const sql = `DROP VIEW IF EXISTS ${formatter.escapeName(name)}`;
                    self.execute(sql, undefined, function(err) {
                        if (err) { callback(err); return; }
                        callback();
                    });
                });
            },
            /**
             * @returns {Promise<void>}
             */
            dropAsync() {
                return new Promise((resolve, reject) => {
                    return this.drop( error => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            },
            /**
             * @param {*} q
             * @param {AdapterExecuteCallback} callback
             */
            create:function(q, callback) {
                const thisArg = this;
                self.executeInTransaction( tr => {
                    thisArg.drop(function(err) {
                        if (err) {
                            return tr(err);
                        }
                        try {
                            let sql = `CREATE VIEW ${formatter.escapeName(name)} AS `;
                            sql += formatter.format(q);
                            return self.execute(sql, null, (error) => {
                                if (error) {
                                    return tr(error);
                                }
                                return tr();
                            });
                        }
                        catch(e) {
                            tr(e);
                        }
                    });
                }, function(err) {
                    callback(err);
                });
            },
            /**
             * @param {*} query
             * @returns {Promise<void>}
             */
            createAsync(query) {
                return new Promise((resolve, reject) => {
                    return this.create(query, error => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            },
        };
    }

    /**
     * Executes a query against the underlying database
     * @param {*} query
     * @param {Array<*>=} values
     * @param {AdapterExecuteCallback} callback
     */
    execute(query, values, callback) {
        const self = this;
        /**
         * @type {string}
         */
        let sql;
        try {

            if (typeof query === 'string') {
                //get raw sql statement
                sql = query;
            }
            else {
                //format query expression or any object that may be act as query expression
                const formatter = new MemoryFormatter();
                sql = formatter.format(query);
            }
            //validate sql statement
            if (sql == null) {
                return callback.call(self, new Error('The executing command is of the wrong type or empty.'));
            }
            //ensure connection
            self.open(function(err) {
                if (err) {
                    callback.call(self, err);
                }
                else {

                    //prepare statement - the traditional way
                    const prepared = self.prepare(sql, values);
                    //log statement (optional)
                    if (process.env.NODE_ENV==='development') {
                        TraceUtils.log(`SQL:${prepared}, Parameters:${JSON.stringify(values)}`);
                    }
                    let results;
                    let result = [];
                    //validate statement
                    if (/^(SELECT|PRAGMA)/ig.test(prepared)) {
                        //prepare for select
                        try {
                            /**
                             * @returns Array<*>
                             */
                            results = self.rawConnection.exec(prepared);
                            // get first result
                            if (results.length === 0) {
                                // return an empty array
                                return callback(null, []);
                            }
                            // enumerate values
                            result = results[0].values.map( x => {
                                const obj = { };
                                results[0].columns.forEach( (column, index) => {
                                    // define property
                                    let value = x[index];
                                    if (MemoryAdapter.isDate(value)) {
                                        value = new Date(value);
                                    }
                                    Object.defineProperty(obj, column, {
                                       configurable: true,
                                       enumerable: true,
                                       writable: true,
                                       value: value
                                    });
                                });
                                return obj;
                            });
                            // and return final result (an array of objects)
                            return callback(null, result);
                        }
                        catch (err) {
                            TraceUtils.error(`SQL: ${prepared}`);
                            return callback(err);
                        }
                    }
                    else {
                        try {
                            //otherwise prepare for run
                            self.rawConnection.run(prepared);
                            return callback();
                        }
                        catch (err) {
                            TraceUtils.error(`SQL: ${prepared}`);
                            return callback(err);
                        }

                    }
                }
            });
        }
        catch (e) {
            callback.call(self, e);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Executes the specified query against the underlying database and returns a result set.
     * @param {*} query
     * @param {Array<*>=} values
     * @returns {Promise<*>}
     */
    executeAsync(query, values) {
        const thisArg = this;
        return new Promise((resolve, reject) => {
            return thisArg.execute(query, values, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        });
    }

    /**
     *
     * @param {AdapterExecuteCallback} callback
     * @returns {*}
     */
    lastIdentity(callback) {
        const self = this;
        return self.open(function(err) {
            if (err) {
                return callback(err);
            }
            //execute lastval (for sequence)
            return self.execute('SELECT last_insert_rowid() as lastval', [], function(err, lastval) {
                if (err) {
                    return callback(null, { insertId: null });
                }
                lastval = lastval || [];
                if (lastval.length>0)
                    { // noinspection JSUnresolvedVariable
                        callback(null, { insertId:lastval[0].lastval });
                    }
                else
                    callback(null, { insertId: null });
            });
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the identity value which has been inserted during the last query operation
     * @returns {Promise<*>}
     */
    lastIdentityAsync() {
        return new Promise((resolve, reject) => {
            return this.lastIdentity( (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        });
    }

    /**
     *
     * @param {string} table
     * @returns {MemoryAdapterTableIndexes}
     */
    indexes(table) {
        const self = this;
        const formatter = new MemoryFormatter();
        return {
            /**
             * @param {IndexesCallback} callback
             */
            list: function (callback) {
                const thisObject = this;
                if (thisObject.hasOwnProperty('indexes')) {
                    return callback(null, thisObject['indexes']);
                }
                self.execute(`SELECT c.* FROM pragma_index_list(${formatter.escape(table)}) c`, null , function (err, result) {
                    if (err) { return callback(err); }
                    const indexes = result.filter(function(x) {
                        return x.origin === 'c';
                    }).map(function(x) {
                        return {
                            name:x.name,
                            columns:[]
                        };
                    });
                    (async function() {
                        for (let i = 0; i < indexes.length; i++) {
                            // get index
                            const index = indexes[i];
                            // get columns
                            const columns = await self.executeAsync(`SELECT c.* FROM pragma_index_info(${formatter.escape(index.name)}) c`);
                            // set index columns
                            index.columns = columns.map( x => {
                                return x.name;
                            });
                        }
                        // set table indexes
                        thisObject.indexes = indexes;
                        return indexes;
                    })().then( indexes => {
                        return callback(null, indexes);
                    });
                });
            },
            /**
             * @returns {Promise<Array<MemoryAdapterTableIndex>>}
             */
            listAsync() {
                return new Promise((resolve, reject) => {
                   return this.list((err, result) => {
                      if (err) {
                          return reject(err);
                      }
                      return resolve(result);
                   });
                });
            },
            /**
             * @param {string} name
             * @param {Array<string>|string} columns
             * @param {AdapterExecuteCallback} callback
             */
            create: function(name, columns, callback) {
                const cols = [];
                if (typeof columns === 'string') {
                    cols.push(columns);
                }
                else if (Array.isArray(columns)) {
                    cols.push.apply(cols, columns);
                }
                else {
                    return callback(new Error("Invalid parameter. Columns parameter must be a string or an array of strings."));
                }

                const thisArg = this;
                thisArg.list(function(err, indexes) {
                    if (err) { return callback(err); }
                    const ix = indexes.find(function(x) { return x.name === name; });
                    //format create index SQL statement
                    const tableName = formatter.escapeName(table);
                    const indexName = formatter.escapeName(name);
                    const indexColumns = cols.map( x => {
                        return formatter.escapeName(x);
                    }).join(",");
                    const sqlCreateIndex = `CREATE INDEX ${indexName} ON ${tableName}(${indexColumns})`;
                    if ( ix == null) {
                        self.execute(sqlCreateIndex, [], callback);
                    }
                    else {
                        let nCols = cols.length;
                        //enumerate existing columns
                        ix.columns.forEach(function(x) {
                            if (cols.indexOf(x)>=0) {
                                //column exists in index
                                nCols -= 1;
                            }
                        });
                        if (nCols>0) {
                            //drop index
                            thisArg.drop(name, function(err) {
                                if (err) { return callback(err); }
                                //and create it
                                self.execute(sqlCreateIndex, [], callback);
                            });
                        }
                        else {
                            //do nothing
                            return callback();
                        }
                    }
                });
            },
            /**
             * @param {string} name
             * @param {Array<string>|string} columns
             * @returns {Promise<void>}
             */
            createAsync(name, columns) {
                return new Promise((resolve, reject) => {
                    return this.create( name, columns, error => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            },
            /**
             *
             * @param {string} name
             * @param {AdapterExecuteCallback} callback
             * @returns {*}
             */
            drop: function(name, callback) {
                if (typeof name !== 'string') {
                    return callback(new Error("Name must be a valid string."));
                }
                self.execute(`SELECT c.* FROM pragma_index_list(${formatter.escape(table)}) c`, null, function(err, result) {
                    if (err) { return callback(err); }
                    const exists = typeof result.find(function(x) { return x.name===name; }) !== 'undefined';
                    if (!exists) {
                        return callback();
                    }
                    self.execute(`DROP INDEX ${formatter.escapeName(name)}`, [], callback);
                });
            },
            /**
             * @param {string} name
             * @returns {Promise<void>}
             */
            dropAsync(name) {
                return new Promise((resolve, reject) => {
                    return this.drop( name, error => {
                        if (error) {
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            },
        };
    }

}

/**
 * Creates an instance of MemoryAdapter class
 * @param {*} options
 * @returns {MemoryAdapter}
 */
export function createInstance(options) {
    return new MemoryAdapter(options);
}
