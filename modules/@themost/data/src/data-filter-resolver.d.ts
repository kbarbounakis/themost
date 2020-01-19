/**
 * @license
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
export declare class DataFilterResolver {
    resolveMember(member: string, callback: (err?: Error, res?: any) => void);
    resolveMethod(name: string, args: Array<any>, callback: (err?: Error, res?: any) => void);
    me(callback: (err?: Error, res?: any) => void);
    user(callback: (err?: Error, res?: any) => void);
    now(callback: (err?: Error, res?: Date) => void);
    today(callback: (err?: Error, res?: Date) => void);
    lang(callback: (err?: Error, res?: string) => void);

}