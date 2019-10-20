/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export declare class QueryExpression {

    static ComparisonOperators: any;
    static LogicalOperators: any;
    static EvaluationOperators: any;

    $select?: any;
    $delete?: any;
    $update?: any;
    $insert?: any;
    $order?: any;
    $group?: any;
    $expand?: any;
    $where?: any;
    $fixed?: any;

    clone():QueryExpression;
    as(alias: string): QueryExpression;
    fields(): Array<any>;
    hasFilter(): boolean;
    prepare(userOr?: boolean): QueryExpression;
    hasFields(): boolean;
    hasPaging(): boolean;
    distinct(value: any): QueryExpression;
    where(field: any): QueryExpression;
    injectWhere(where: any);
    delete(entity: string): QueryExpression;
    insert(obj: any): QueryExpression;
    into(entity: string): QueryExpression;
    update(entity: string): QueryExpression;
    set(obj: any): QueryExpression;
    select(...field: Array<any>): QueryExpression;
    count(alias: string): QueryExpression;
    from(alias: string): QueryExpression;
    join(entity: any, props?: any, alias?: any): QueryExpression;
    with(obj: any): QueryExpression;
    orderBy(name: string): QueryExpression;
    orderByDescending(name: string): QueryExpression;
    thenBy(name: string): QueryExpression;
    thenByDescending(name: string): QueryExpression;
    groupBy(...field: Array<any>): QueryExpression;
    or(field: any): QueryExpression;
    and(field: any): QueryExpression;
    equal(value: any): QueryExpression;
    notEqual(value: any): QueryExpression;
    in(values: Array<any>): QueryExpression;
    notIn(values: Array<any>): QueryExpression;
    mod(value: any, result: number): QueryExpression;
    bit(value: any, result: number): QueryExpression;
    greaterThan(value: any): QueryExpression;
    startsWith(value: any): QueryExpression;
    endsWith(value: any): QueryExpression;
    contains(value: any): QueryExpression;
    notContains(value: any): QueryExpression;
    lowerThan(value: any): QueryExpression;
    lowerOrEqual(value: any): QueryExpression;
    greaterOrEqual(value: any): QueryExpression;
    between(value1: any, value2: any): QueryExpression;
    skip(n: number): QueryExpression;
    take(n: number): QueryExpression;
    add(x: number): QueryExpression;
    subtract(x: number): QueryExpression;
    multiply(x: number): QueryExpression;
    divide(x: number): QueryExpression;
    round(n: number): QueryExpression;
    substr(start: number,length?: number): QueryExpression;
    indexOf(s: string): QueryExpression;
    concat(s: string): QueryExpression;
    trim(): QueryExpression;
    length(): QueryExpression;
    getDate(): QueryExpression;
    getYear(): QueryExpression;
    getMonth(): QueryExpression;
    getDay(): QueryExpression;
    getMinutes(): QueryExpression;
    getHours(): QueryExpression;
    getSeconds(): QueryExpression;
    floor(): QueryExpression;
    ceil(): QueryExpression;
    toLocaleLowerCase(): QueryExpression;
    toLocaleUpperCase(): QueryExpression;

}
