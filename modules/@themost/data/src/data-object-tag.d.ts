/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DataQueryable} from "./data-queryable";
import {DataAssociationMapping} from "./DataAssociationMapping";
import {DataField} from './DataField';
import {DataModel} from "./data-model";
import {DataObject} from "./data-object";

export declare class DataObjectTag extends DataQueryable {
    parent: DataObject;
    mapping: DataAssociationMapping;
    getBaseModel(): DataModel;
    getObjectField(): string;
    getValueField(): string;
    insert(obj: any): Promise<any>;
    remove(obj: any): Promise<any>;
    removeAll(): Promise<any>;
    migrate(callback: (err?: Error) => void);
}