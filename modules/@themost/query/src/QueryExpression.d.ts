/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
// noinspection JSUnusedGlobalSymbols
/**
 * @interface
 */
export declare interface QueryPipeline {
    $match: any,
    $project: any
}
/**
 * @class
 */
export declare class QueryExpression {

    static ComparisonOperators: any;
    static LogicalOperators: any;
    static EvaluationOperators: any;

    $collection?: any;
    $select?: any;
    $delete?: any;
    $update?: any;
    $insert?: any;
    $order?: any;
    $group?: any;
    $expand?: any;
    $match?: any;
    // noinspection JSUnusedGlobalSymbols
    $fixed?: any;
    $limit?: number;
    $skip?: number;

    clone():QueryExpression;
    as(alias: string): QueryExpression;
    fields(): any[];
    // noinspection JSUnusedGlobalSymbols
    hasFilter(): boolean;
    prepare(userOr?: boolean): QueryExpression;
    hasFields(): boolean;
    // noinspection JSUnusedGlobalSymbols
    hasLimit(): boolean;
    distinct(value: any): QueryExpression;
    where(expr: any): QueryExpression;
    where<T>(expr: (value: T) => boolean, params?: any): QueryExpression;
    where<T,J>(expr: (value1: T, value2: J) => any, params?: any): QueryExpression;
    // noinspection JSUnusedGlobalSymbols
    injectWhere(where: any);
    delete(entity: string): QueryExpression;
    insert(any: any): QueryExpression;
    // noinspection JSUnusedGlobalSymbols
    insertOne(any: any): QueryExpression;
    // noinspection JSUnusedGlobalSymbols
    insertMany(any: any[]): QueryExpression;
    into(collection: any): QueryExpression;
    update(collection: any): QueryExpression;
    set(any: any): QueryExpression;
    select(...field: any[]): QueryExpression;
    select<T>(expr: (value: T) => any, params?: any): QueryExpression;
    select<T,J>(expr: (value1: T, value2: J) => any, params?: any): QueryExpression;
    count(alias: string): QueryExpression;
    from(alias: string): QueryExpression;
    join(collection: any): QueryExpression;
    with(localField: any, foreignField: any): QueryExpression;
    with<T,J>(localField: (value: T) => any, foreignField: (value: T) => any): QueryExpression;
    orderBy(...field: any[]): QueryExpression;
    orderBy<T>(expr: (value: T) => any, params?: any): QueryExpression;
    orderByDescending(...field: any[]): QueryExpression;
    orderByDescending<T>(expr: (value: T) => any, params?: any): QueryExpression;
    thenBy(...field: any[]): QueryExpression;
    thenBy<T>(expr: (value: T) => any, params?: any): QueryExpression;
    thenByDescending(...field: any[]): QueryExpression;
    thenByDescending<T>(expr: (value: T) => any, params?: any): QueryExpression;
    groupBy(...field: any[]): QueryExpression;
    groupBy<T>(expr: (value: T) => any, params?: any): QueryExpression;
    or(field: any): QueryExpression;
    and(field: any): QueryExpression;
    equal(value: any): QueryExpression;
    eq(value: any): QueryExpression;
    notEqual(value: any): QueryExpression;
    ne(value: any): QueryExpression;
    in(values: any[]): QueryExpression;
    notIn(values: any[]): QueryExpression;
    mod(value: any): QueryExpression;
    bit(value: any): QueryExpression;
    greaterThan(value: any): QueryExpression;
    gt(value: any): QueryExpression;
    startsWith(value: any): QueryExpression;
    endsWith(value: any): QueryExpression;
    contains(value: any): QueryExpression;
    includes(value: any): QueryExpression;
    notContains(value: any): QueryExpression;
    lowerThan(value: any): QueryExpression;
    lt(value: any): QueryExpression;
    lowerOrEqual(value: any): QueryExpression;
    lte(value: any): QueryExpression;
    greaterOrEqual(value: any): QueryExpression;
    gte(value: any): QueryExpression;
    between(value1: any, value2: any): QueryExpression;
    skip(n: number): QueryExpression;
    take(n: number): QueryExpression;
    add(x: any): QueryExpression;
    subtract(x: any): QueryExpression;
    multiply(x: any): QueryExpression;
    divide(x: any): QueryExpression;
    round(n: any): QueryExpression;
    substr(start: number,length?: number): QueryExpression;
    indexOf(x: any, start?: number): QueryExpression;
    concat(...str:any[]): QueryExpression;
    trim(): QueryExpression;
    length(): QueryExpression;
    getDate(): QueryExpression;
    toDate(): QueryExpression;
    getYear(): QueryExpression;
    getMonth(): QueryExpression;
    getDay(): QueryExpression;
    getMinutes(): QueryExpression;
    getHours(): QueryExpression;
    getSeconds(): QueryExpression;
    floor(): QueryExpression;
    ceil(): QueryExpression;
    toLowerCase(): QueryExpression;
    toUpperCase(): QueryExpression;
    toLocaleLowerCase(): QueryExpression;
    toLocaleUpperCase(): QueryExpression;

}
