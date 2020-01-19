/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import { DataField } from "./DataField";
import { DataAssociationMapping } from "./DataAssociationMapping";
import { DataModelPrivilege } from "./DataModelPrivilege";
import { ConfigurationBase } from "@themost/common";
import { DataAdapter } from "./DataAdapter";

export declare interface DataModelBase {
    hidden?: boolean;
    sealed?: boolean;
    abstract?: boolean;
    version: string;
    caching?: string;
    fields: Array<DataField>;
    eventListeners?: Array<any>;
    constraints?: Array<any>;
    views?: Array<any>;
    privileges?: Array<DataModelPrivilege>;
    context: DataContextBase;
    readonly sourceAdapter?: string;
    readonly viewAdapter?: string;
    silent(value?: boolean): DataModelBase;
    readonly attributes?: Array<DataField>;
    readonly primaryKey: any;
    readonly attributeNames: Array<string>;
    readonly constraintCollection: Array<any>;
    getPrimaryKey(): DataField;
    isSilent(): boolean;
    getDataObjectType(): any;
    initialize(): void;
    clone(): DataModelBase;
    join(model: string): DataModelBase;
    where(attr: string): DataQueryableBase;
    search(text: string): DataQueryableBase;
    asQueryable(): DataQueryableBase;
    filter(params: any, callback?: (err?: Error, res?: any) => void): void;
    find(obj: any):DataQueryableBase;
    select(...attr: any[]): DataQueryableBase;
    orderBy(attr: any): DataQueryableBase;
    orderByDescending(attr: any): DataQueryableBase;
    take(n: number): DataQueryableBase;
    getList():Promise<any>;
    skip(n: number): DataQueryableBase;
    base(): DataModelBase;
    convert(obj: any): DataObjectBase;
    convert<T>(obj: any): T;
    cast(obj: any, state: number): any;
    save(obj: any): Promise<any>;
    inferState(obj: any, callback: (err?: Error, res?: any) => void): void;
    getSuperTypes(): Array<string>;
    update(obj: any): Promise<any>;
    insert(obj: any): Promise<any>;
    remove(obj: any): Promise<any>;
    migrate(callback: (err?: Error, res?: any) => void): void;
    key(): any;
    field(name: string): DataField;
    getDataView(name: string): any;
    inferMapping(name: string): DataAssociationMapping;
    validateForUpdate(obj: any): Promise<any>;
    validateForInsert(obj: any): Promise<any>;
    levels(value: number): DataQueryableBase;
    getSubTypes(): Promise<string>;
    getReferenceMappings(deep?: boolean): Array<any>;
    getAttribute(name: string): DataField;
    getTypedItems(): Promise<DataObjectBase|any>;
    getTypedItems<T>(): Promise<T>;
    getItems(): Promise<any>;
    getTypedList():Promise<any>;
}

export declare interface DataContextBase {
    model(name: string): DataModelBase;
    db: DataAdapter;
    getConfiguration(): ConfigurationBase;
    finalize(callback?: (err?: Error) => void): void
}

export declare interface DataObjectBase {
    context:DataContextBase;
    silent(value?:boolean):this;
    selector(name:string, selector:Function):this;
    is(selector:string):Promise<any>;
    getType():string;
    getId():any;
    query(attr:string):DataQueryableBase;
    save(context?: DataContextBase, callback?:(err:Error) => void):Promise<any>|void;
    remove(context?: DataContextBase, callback?:(err:Error) => void):Promise<any>|void;
    getModel(): any;
    getAdditionalModel():Promise<any>;
    getAdditionalObject():Promise<DataObjectBase|any>;
    attr(name: string, callback?:(err?: Error,res?: any) => void): any;
    property(name: string): any;
}

export declare interface DataQueryableBase {
    
    readonly model: DataModelBase;
    clone(): DataQueryableBase;
    where(attr: string): DataQueryableBase;
    search(text: string): DataQueryableBase;
    join(model: string): DataQueryableBase;
    and(attr: string): DataQueryableBase;
    or(attr: string): DataQueryableBase;
    is(value: any): DataQueryableBase;
    equal(value: any): DataQueryableBase;
    notEqual(value: any): DataQueryableBase;
    greaterThan(value: any): DataQueryableBase;
    greaterOEqual(value: any): DataQueryableBase;
    bit(value: any, result?:number): DataQueryableBase;
    lowerThan(value: any): DataQueryableBase;
    lowerOrEqual(value: any): DataQueryableBase;
    startsWith(value: any): DataQueryableBase;
    endsWith(value: any): DataQueryableBase;
    contains(value: any): DataQueryableBase;
    notContains(value: any): DataQueryableBase;
    between(value1: any, value2: any): DataQueryableBase;
    select(...attr: any[]): DataQueryableBase;
    orderBy(attr: any): DataQueryableBase;
    orderByDescending(attr: any): DataQueryableBase;
    thenBy(attr: any): DataQueryableBase;
    thenByDescending(attr: any): DataQueryableBase;
    groupBy(...attr: any[]): DataQueryableBase;
    skip(n:number): DataQueryableBase;
    take(n:number): DataQueryableBase;
    getItem(): Promise<any>;
    getItems(): Promise<Array<any>>;
    getTypedItem(): Promise<any>;
    getTypedItems(): Promise<Array<any>>;
    getList(): Promise<any>;
    getTypedList(): Promise<any>;
    getAllItems(): Promise<Array<any>>;
    count(): Promise<number>;
    value(): Promise<any>;
    min(): Promise<any>;
    max(): Promise<any>;
    average(): Promise<any>;
    migrate(callback:(err?: Error) => void);
    silent(value?: boolean): DataQueryableBase;
    flatten(value?: boolean): DataQueryableBase;
    cache(value?: boolean): DataQueryableBase;
    data(name: string, value?: any): DataQueryableBase|any;
    title(value?: string): DataQueryableBase|string;
    toMD5(): string;
    expand(...attr: any[]): DataQueryableBase;
    hasExpand(attr: any): boolean;
    add(x: any): DataQueryableBase;
    subtract(x: any): DataQueryableBase;
    multiply(x: any): DataQueryableBase;
    divide(x: any): DataQueryableBase;
    round(n?:number): DataQueryableBase;
    substr(start: number, length?:number): DataQueryableBase;
    indexOf(s: string): DataQueryableBase;
    concat(s: string): DataQueryableBase;
    trim(): DataQueryableBase;
    length(): DataQueryableBase;
    getDate(): DataQueryableBase;
    getYear(): DataQueryableBase;
    getMonth(): DataQueryableBase;
    getDay(): DataQueryableBase;
    getFullYear(): DataQueryableBase;
    getMinutes(): DataQueryableBase;
    getSeconds(): DataQueryableBase;
    getHours(): DataQueryableBase;
    floor(): DataQueryableBase;
    ceil(): DataQueryableBase;
    toLowerCase(): DataQueryableBase;
    toLocaleLowerCase(): DataQueryableBase;
    toUpperCase(): DataQueryableBase;
    toLocaleUpperCase(): DataQueryableBase;
    levels(n:number): DataQueryableBase;
    getLevels(): number;
    toExpand(): string;
    ensureContext: void;
}
