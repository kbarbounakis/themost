/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DataAssociationMapping} from "./DataAssociationMapping";
import {DataField} from './DataField';
import {SequentialEventEmitter} from "@themost/common";
import { DataModelBase, DataContextBase, DataQueryableBase, DataObjectBase } from "./DataModelBase";

export declare class DataModel extends SequentialEventEmitter implements DataModelBase {
    constructor(obj:any);

    hidden?: boolean;
    sealed?: boolean;
    abstract?: boolean;
    version: string;
    caching?: string;
    fields: Array<DataField>;
    eventListeners?: Array<any>;
    constraints?: Array<any>;
    views?: Array<any>;
    privileges?: Array<any>;
    context: DataContextBase;
    readonly sourceAdapter?: string;
    readonly viewAdapter?: string;
    silent(value?: boolean): DataModel;
    readonly attributes?: Array<DataField>;
    readonly primaryKey: any;
    readonly attributeNames: Array<string>;
    readonly constraintCollection: Array<any>;

    getPrimaryKey(): DataField;
    isSilent(): boolean;
    getDataObjectType(): any;
    initialize(): void;
    clone(): DataModel;
    join(model: string): DataModel;
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
    base(): DataModel;
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
    levels(value: number);
    getSubTypes(): Promise<string>;
    getReferenceMappings(deep?: boolean): Array<any>;
    getAttribute(name: string);
    getTypedItems(): Promise<DataObjectBase|any>;
    getTypedItems<T>(): Promise<T>;
    getItems(): Promise<any>;
    getTypedList():Promise<any>;
}
