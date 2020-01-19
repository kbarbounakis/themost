/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DataModel} from "./DataModel";
import {DataQueryable} from "./DataQueryable";
import {BeforeExecuteEventListener, BeforeRemoveEventListener, BeforeSaveEventListener, DataEventArgs} from "./types";

export declare class DataPermissionEventArgs {
    model: DataModel;
    query: any;
    mask: number;
    privilege: string;
    emitter?: DataQueryable;
}

export declare class PermissionMask {
    static Read: number;
    static Create: number;
    static Update: number;
    static Delete: number;
    static Execute: number;
    static Owner: number;
}

export declare class DataPermissionEventListener implements BeforeSaveEventListener,
    BeforeRemoveEventListener,
    BeforeExecuteEventListener
{
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;

    beforeRemove(event: DataEventArgs, callback: (err?: Error) => void): void;

    beforeExecute(event: DataEventArgs, callback: (err?: Error) => void): void;

    validate(event: DataEventArgs, callback: (err?: Error) => void): void;
}