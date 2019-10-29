/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2019, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export declare interface FormatterSettings2 {
    nameFormat: string;
    forceAlias?: boolean;
    useAliasKeyword?: boolean;
    aliasKeyword?: string;
}

export declare class SqlFormatter2 {
    provider: any;
    settings: FormatterSettings2;
    formatComparison(comparison: any): string;
    isComparison(obj: any): boolean;
    escape(value: any,unquoted?: boolean): string;
    escapeConstant(value: any,unquoted?: boolean): string;
    formatWhere(where: any): string;
    formatCount(query: any): string;
    formatFixedSelect(query: any): string;
    formatSelect(query: any): string;
    formatLimitSelect(query: any): string;
    formatField(query: any): string;
    formatOrder(query: any): string;
    formatGroupBy(query: any): string;
    formatInsert(query: any): string;
    formatUpdate(query: any): string;
    formatDelete(query: any): string;
    escapeName(name: string): string;
    format(obj: any, s?: string): string;

}