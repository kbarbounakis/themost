/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DataQueryable} from "./DataQueryable";
import {DataObject} from "./DataObject";
import {DataAssociationMapping} from "./DataAssociationMapping";
import {DataModel} from "./DataModel";

export declare class HasParentJunction extends DataQueryable {
    parent: DataObject;
    mapping: DataAssociationMapping;
    getBaseModel(): DataModel;
    getValueField(): string;
    getObjectField(): string;
    insert(obj: any): Promise<any>;
    remove(obj: any): Promise<any>;
    migrate(callback: (err?: Error) => void): void;
}