/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import { DataContext } from "./DataContext";
import {DataModel} from "./data-model";

export declare class FunctionContext {
    constructor(context?: DataContext, model?: DataModel, target?: any);
    context?: DataContext;
    model?: DataModel;
    target?: any;
    now(): Promise<Date>;
    today(): Promise<Date>;
    newid(): Promise<any>;
    newGuid(): Promise<string>;
    int(min?: number, max?: number): Promise<number>;
    numbers(length: number): Promise<string>;
    chars(length: number): Promise<string>;
    password(length: number): Promise<string>;
    user(): Promise<any>;
    me(): Promise<any>;
}