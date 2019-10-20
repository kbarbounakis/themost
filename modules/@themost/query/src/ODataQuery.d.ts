/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */


export declare class ODataQuery {
    select(...attr: string[]): ODataQuery;

    take(val: number): ODataQuery;

    skip(val: number): ODataQuery;

    orderBy(name: string): ODataQuery;

    orderByDescending(name: string): ODataQuery;

    thenBy(name: string): ODataQuery;

    thenByDescending(name: string): ODataQuery;

    where(name: string): ODataQuery;

    and(name: string): ODataQuery;

    or(name: string): ODataQuery;

    indexOf(name: string): ODataQuery;

    equal(value: any): ODataQuery;

    endsWith(name: string, s: string): ODataQuery;

    startsWith(name: string, s: string): ODataQuery;

    substringOf(name: string, s: string): ODataQuery;

    substring(name: string, pos: number, length: number): ODataQuery;

    length(name: ODataQuery): ODataQuery;

    toLower(name: string): ODataQuery;

    trim(name: string): ODataQuery;

    concat(s0: string, s1: string, s2?: string, s3?: string, s4?: string): ODataQuery;

    field(name: string): any;

    day(name: string): ODataQuery;

    hour(name: string): ODataQuery;

    month(name: string): ODataQuery;

    minute(name: string): ODataQuery;

    second(name: string): ODataQuery;

    year(name: string): ODataQuery;

    round(name: string): ODataQuery;

    floor(name: string): ODataQuery;

    ceiling(name: string): ODataQuery;

    notEqual(name: string): ODataQuery;

    greaterThan(name: string): ODataQuery;

    greaterOrEqual(name: string): ODataQuery;

    lowerThan(name: string): ODataQuery;

    lowerOrEqual(name: string): ODataQuery;

    in(values: any[]): ODataQuery;

    notIn(values: any[]): ODataQuery;

}