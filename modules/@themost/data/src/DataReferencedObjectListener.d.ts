/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {BeforeRemoveEventListener, DataEventArgs} from "./types";

export declare class DataReferencedObjectListener implements BeforeRemoveEventListener{
    beforeRemove(event: DataEventArgs, callback: (err?: Error) => void): void;

}