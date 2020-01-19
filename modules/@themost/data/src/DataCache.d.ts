import { DataCacheStrategy } from "./DataCacheStrategy";

/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export declare class DataCache {
    init(callback: (err?: Error) => void): void;

    remove(key: string, callback: (err?: Error) => void): void;

    removeAll(callback: (err?: Error) => void): void;

    add(key: string, value: any, ttl?: number, callback?: (err?: Error) => void): void;

    ensure(key: string, getFunc: (err?: Error, res?: any) => void, callback?: (err?: Error) => void): void;

    get(key: string, callback?: (err?: Error, res?: any) => void): void;

    static getCurrent(): DataCache;
}


export declare class DefaultDataCacheStrategy extends DataCacheStrategy {

    add(key: string, value: any, absoluteExpiration?: number): Promise<any>;

    remove(key: string): Promise<any>;

    clear(): Promise<any>;

    get(key: string): Promise<any>;

    getOrDefault(key: string, getFunc: Promise<any>, absoluteExpiration?: number): Promise<any>;

}