/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export interface ODataQueryParams {
    $filter: string;
    $groupby: string;
    $select: string;
    $orderby: string;
    $expand: string;
    $count: boolean;
    $top: number;
    $skip: number;
    $first: boolean;
    $levels: number;
}
export declare class ODataQuery {
    constructor(collection: string);
    toString(): any;
    toExpand(): string;
    takeNext(n: number): ODataQuery;
    takePrevious(n: number): ODataQuery;
    getParams(): ODataQueryParams;
    setParam(name: string, value: any): ODataQuery;
    getCollection(): string;
    getUrl(): string;
    setUrl(value: string): this;
    where(name: string): ODataQuery;
    and(name: string): ODataQuery;
    andAlso(name: string): ODataQuery;
    or(name: string): ODataQuery;
    orElse(name: string): ODataQuery;
    equal(value: any): ODataQuery;
    notEqual(value: any): ODataQuery;
    greaterThan(value: any): ODataQuery;
    greaterOrEqual(value: any): ODataQuery;
    lowerThan(value: any): ODataQuery;
    lowerOrEqual(value: any): ODataQuery;
    between(value1: any, value2: any): ODataQuery;
    toFilter(): string;
    contains(value: any): ODataQuery;
    getDate(): ODataQuery;
    getDay(): ODataQuery;
    getMonth(): ODataQuery;
    getYear(): ODataQuery;
    getFullYear(): ODataQuery;
    getHours(): ODataQuery;
    getMinutes(): ODataQuery;
    getSeconds(): ODataQuery;
    length(): ODataQuery;
    trim(): ODataQuery;
    toLocaleLowerCase(): ODataQuery;
    toLowerCase(): ODataQuery;
    toLocaleUpperCase(): ODataQuery;
    toUpperCase(): ODataQuery;
    round(): ODataQuery;
    floor(): ODataQuery;
    ceil(): ODataQuery;
    indexOf(s: string): ODataQuery;
    substr(pos: number, length: number): ODataQuery;
    startsWith(s: string): ODataQuery;
    endsWith(s: string): ODataQuery;
    select(...attr: string[]): ODataQuery;
    groupBy(...attr: string[]): ODataQuery;
    expand(...attr: string[]): ODataQuery;
    orderBy(attr: string): ODataQuery;
    thenBy(attr: string): ODataQuery;
    orderByDescending(attr: string): ODataQuery;
    thenByDescending(attr: string): ODataQuery;
    skip(num: number): ODataQuery;
    take(num: number): ODataQuery;
    filter(s: string): ODataQuery;
    levels(n: number): ODataQuery;
    prepare(or?: boolean): ODataQuery;
}
