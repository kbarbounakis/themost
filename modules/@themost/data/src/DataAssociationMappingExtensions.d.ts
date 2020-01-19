import { DataQueryableBase, DataModelBase } from "./DataModelBase";

/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export declare interface DataAssociationMappingExtend {
    for(dataQueryable: DataQueryableBase): DataAssociationMappingExtend;
    getChildModel(): DataModelBase;
    getParentModel(): DataModelBase;
    getParents_v1(items: Array<any>): Promise<any>;
    getParents(items: Array<any>): Promise<any>;
    getChildren_v1(items: Array<any>): Promise<any>;
    getChildren(items: Array<any>): Promise<any>;
    getAssociatedParents_v1(items: Array<any>): Promise<any>;
    getAssociatedParents(items: Array<any>): Promise<any>;
    getAssociatedChildren_v1(items: Array<any>): Promise<any>;
    getAssociatedChildren(items: Array<any>): Promise<any>;
}

export declare class DataAssociationMappingExtensions {
    static extend(mapping: any): DataAssociationMappingExtend;
}