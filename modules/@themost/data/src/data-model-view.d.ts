/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DataModel} from "./data-model";
import {DataField} from "./types";

export declare class DataModelView {
    constructor(model:DataModel);
    model: DataModel;
    title?: string;
    name?: string;
    public?: boolean;
    sealed?: boolean;
    filter?: string;
    order?: string;
    group?: string;
    fields?: Array<DataField>;
    readonly attributes: Array<DataField>;

    cast(obj: any): any;

}