/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
/**
 * @class
 */
 export declare class QueryField {
    constructor(name?: string);
    count(): QueryField;
    min(): QueryField;
    max(): QueryField;
    average(): QueryField;
    avg(): QueryField;
    sum(): QueryField;
    floor(): QueryField;
    ceil(): QueryField;
    mod(x: any): QueryField;
    add(x: any): QueryField;
    subtract(x: any): QueryField;
    divide(divider: any): QueryField;
    multiply(multiplier: any): QueryField;
    round(n: any): QueryField;
    length(): QueryField;
    trim(): QueryField;
    getYear(): QueryField;
    getDate(): QueryField;
    toDate(): QueryField;
    getDay(): QueryField;
    getMonth(): QueryField;
    getHours(): QueryField;
    getMinutes(): QueryField;
    getSeconds(): QueryField;
    select(name: string): QueryField;
    from(entity: string): QueryField;
    as(alias: string): QueryField;
    concat(...str:any[]): QueryField;
    substr(start: number, length?:number): QueryField;
    toLowerCase(): QueryField;
    toUpperCase(): QueryField;
    indexOf(x: any, start?: number): QueryField;
}
