export declare class DataAdapter {
    /**
     *
     * @param options
     */
    constructor(options: any);
    /**
     *
     */
    rawConnection: any;
    /**
     *
     */
    options: any;
    /**
     *
     * @param {(err?: Error) => void} callback
     */
    open(callback: (err?: Error) => void);
    /**
     *
     * @param {(err?: Error) => void} callback
     */
    close(callback: (err?: Error) => void);
    /**
     *
     * @param query
     * @param {Array<any>} values
     * @param {(err?: Error, result?: any) => void} callback
     */
    execute(query: any, values: Array<any>, callback: (err?: Error, result?: any) => void);
    /**
     *
     * @param {string} entity
     * @param {string} attribute
     * @param {(err?: Error, result?: any) => void} callback
     */
    selectIdentity(entity: string, attribute: string, callback?: (err?: Error, result?: any) => void);
    /**
     *
     * @param {Function} fn
     * @param {(err?: Error) => void} callback
     */
    executeInTransaction(fn: Function, callback: (err?: Error) => void);
    /**
     *
     * @param {string} name
     * @param query
     * @param {(err?: Error) => void} callback
     */
    createView(name: string, query: any, callback: (err?: Error) => void);
}
