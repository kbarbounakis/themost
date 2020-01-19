/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {BeforeSaveEventListener, DataEventArgs} from "./types";
import { DataContext } from "./DataContext";

export declare interface DataValidationResult {
    code: string;
    message: string;
    innerMessage?: string;
}

export declare class DataValidator {
    setContext(context: DataContext);
    getContext(): DataContext;
    target: any;
}

export declare class PatternValidator extends DataValidator {
    constructor(pattern: string);
    pattern: number;
    message?: string;
    validateSync(val:any): DataValidationResult;
}

export declare class MinLengthValidator extends DataValidator {
    constructor(length: number);
    minLength: number;
    message?: string;
    validateSync(val:any): DataValidationResult;
}

export declare class MaxLengthValidator extends DataValidator {
    constructor(length: number);
    maxLength: number;
    message?: string;
    validateSync(val:any): DataValidationResult;
}


export declare class MinValueValidator extends DataValidator {
    constructor(min: any);
    minValue: any;
    message?: string;
    validateSync(val:any): DataValidationResult;
}

export declare class MaxValueValidator extends DataValidator {
    constructor(max: any);
    maxValue: any;
    message?: string;
    validateSync(val:any): DataValidationResult;
}


export declare class RangeValidator extends DataValidator {
    constructor(min: any,max: any);
    minValue: any;
    maxValue: any;
    message?: string;
    validateSync(val:any): DataValidationResult;
}

export declare class DataTypeValidator extends DataValidator {
    constructor(type: string);
    type: string;
    message?: string;
    validateSync(val:any): DataValidationResult;
}

export declare class RequiredValidator extends DataValidator {
    constructor();
    validateSync(val:any): DataValidationResult;
}

export declare class DataValidatorListener implements  BeforeSaveEventListener {
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;

}