
/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import { DataModelBase, DataObjectBase } from "./DataModelBase";

export declare function DataAdapterCallback(err?:Error, result?:any);

export declare class DataEventArgs {
    model: DataModelBase;
    target: DataObjectBase;
    state: number;
    emitter?: any;
    query?: any;
    previous?: any
}

export declare interface BeforeSaveEventListener {
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface AfterSaveEventListener {
    afterSave(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface BeforeRemoveEventListener {
    beforeRemove(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface AfterRemoveEventListener {
    afterRemove(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface BeforeUpgradeEventListener {
    beforeUpgrade(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface AfterUpgradeEventListener {
    afterUpgrade(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface BeforeExecuteEventListener {
    beforeExecute(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface AfterExecuteEventListener {
    afterExecute(event: DataEventArgs, callback: (err?: Error) => void): void;
}

export declare interface TypeParser {
    parseInteger(val: any): number;
    parseCounter(val: any): number;
    parseFloat(val: any): number;
    parseNumber(val: any): number;
    parseDateTime(val: any): Date;
    parseDate(val: any): Date;
    parseBoolean(val: any): boolean;
    parseText(val: any): string;

}

export declare const parsers: TypeParser;
