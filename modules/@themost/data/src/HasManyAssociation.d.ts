/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {DataQueryable} from "./DataQueryable";
import {DataAssociationMapping} from "./DataAssociationMapping";
import {DataObject} from "./DataObject";

export declare class HasManyAssociation extends DataQueryable{
    constructor(parent: any, association: DataAssociationMapping);
    parent: DataObject;
    mapping: DataAssociationMapping;
}