/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
export declare class QueryCollection {
    constructor(name?: string);
    readonly name: string;
    readonly alias: string;
    select(name: string): QueryCollection;
    as(alias: string): QueryCollection;
    inner(): QueryCollection;
    left(): QueryCollection;
    right(): QueryCollection;
}