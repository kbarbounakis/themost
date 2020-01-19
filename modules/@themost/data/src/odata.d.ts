/**
 * MOST Web Framework 3.0 Codename Zero Gravity
 * Copyright (c) 2014-2020, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {ConfigurationBase} from "@themost/common";
import { DataContextBase, DataModelBase } from "./DataModelBase";
import {DataAdapter} from "./DataAdapter";

export declare interface SystemQueryOptions {
    $filter?: string;
    $select?: string;
    $expand?: string;
    $top?: number;
    $skip?: number;
    $orderby?: string;
    $groupby?: string;
    $inlinecount?:any;
    $count?: any;
}

export declare class EdmType {
    static EdmBinary: string;
    static EdmBoolean: string;
    static EdmByte: string;
    static EdmDate: string;
    static EdmDateTimeOffset: string;
    static EdmDouble: string;
    static EdmDecimal: string;
    static EdmDuration: string;
    static EdmGuid: string;
    static EdmInt16: string;
    static EdmInt32: string;
    static EdmInt64: string;
    static EdmSByte: string;
    static EdmSingle: string;
    static EdmStream: string;
    static EdmString: string;
    static EdmTimeOfDay: string;
    static CollectionOf(type: string): string;
    static IsCollection(type: string): boolean;
}

export declare class EdmMultiplicity {
    static Many: string;
    static One: string;
    static Unknown: string;
    static ZeroOrOne: string;
    static parse(value: string): string;
}


export declare class EntitySetKind {
    static EntitySet: string;
    static Singleton: string;
    static FunctionImport: string;
    static ActionImport: string;
}

export declare class EdmMapping {
    static entityType(name: string): void;
    static action(name: string, returnType: any): void;
    static func(name: string, returnType: any): void;
    static param(name: string, type: string, nullable?: boolean, fromBody?: boolean): void;
    static navigationProperty(name: string, type: string, multiplicity: string): void;
    static property(name: string, type: string, nullable?: boolean): void;
    static hasOwnAction(obj: any, name: string): Function;
    static hasOwnNavigationProperty(obj: any, name: string): any;
    static hasOwnFunction(obj: any, name: string): Function;
    static getOwnFunctions(obj: any): Array<Function>;
    static getOwnActions(obj: any): Array<Function>;
}

export declare interface ProcedureParameter {
    name: string;
    type: string;
    nullable?: boolean;
    fromBody?: boolean;
}

export declare interface EntityTypeProperty {
    name: string;
    type: string;
    nullable?: boolean;
}

export declare interface EntityTypeNavigationProperty {
    name: string;
    type: string;
}

export declare interface EntityContainerConfiguration {
    name: string;
    entitySet: Array<EntitySetConfiguration>;
}

export declare interface SchemaConfiguration {
    namespace?: string;
    entityType: Array<EntityTypeConfiguration>;
    entityContainer: EntityContainerConfiguration;
}


export declare class ProcedureConfiguration {
    name: string;
    parameters:Array<ProcedureParameter>;
    isBound?: boolean;
    isComposable?: boolean;
}

export declare class ActionConfiguration extends ProcedureConfiguration {

}

export declare class FunctionConfiguration extends ProcedureConfiguration {

}

export declare class EntityCollectionConfiguration {
    actions: Array<ActionConfiguration>;
    functions: Array<FunctionConfiguration>;
    addAction(name: string): ActionConfiguration;
    hasAction(name: string): ActionConfiguration;
    addFunction(name: string): FunctionConfiguration;
    hasFunction(name: string): FunctionConfiguration;

}

export declare class EntityTypeConfiguration {
    constructor(builder: any, name: string);
    getBuilder(): any;
    readonly name: string;
    property: Array<EntityTypeProperty>;
    ignoredProperty: Array<any>;
    navigationProperty: Array<EntityTypeNavigationProperty>;
    actions: Array<ActionConfiguration>;
    functions: Array<FunctionConfiguration>;
    collection: any;
    ignore(name: string): EntityTypeConfiguration;
    derivesFrom(name: string): EntityTypeConfiguration;
    addAction(name: string): ActionConfiguration;
    hasAction(name: string): ActionConfiguration;
    addFunction(name: string): FunctionConfiguration;
    hasFunction(name: string): FunctionConfiguration;
    addProperty (name: string, type: string, nullable?: boolean): EntityTypeConfiguration;
    removeProperty(name: string): EntityTypeConfiguration;
    addNavigationProperty(name: string, type: string, multiplicity: string): EntityTypeConfiguration;
    removeNavigationProperty(name: string): EntityTypeConfiguration;
    hasKey(name: string, type: string): EntityTypeConfiguration;
    removeKey(name: string): EntityTypeConfiguration;
    mapInstance(context: DataContextBase, any: any): any;
    mapInstanceSet(context: DataContextBase, any: any): any;

}

export declare class EntitySetConfiguration {
    constructor(builder: any, entityType: string, name: string);
    name: string;
    kind: string;
    url: string;
    readonly entityType: EntityTypeConfiguration;
    hasUrl(url: string): any;
    getUrl(): string;
    getBuilder(): any;
    getEntityTypePropertyList(): Map<string, EntityTypeProperty>;
    getEntityTypeProperty(name: boolean, deep?: boolean): EntityTypeProperty;
    getEntityTypeIgnoredPropertyList():Array<string>;
    getEntityTypeNavigationProperty(name: string, deep?: boolean): EntityTypeNavigationProperty;
    getEntityTypeNavigationPropertyList(): Map<string, EntityTypeNavigationProperty>;
    hasContextLink(contextLinkFunc: (context: DataContextBase) => string): void;
    hasIdLink(idLinkFunc: (context: DataContextBase) => string): void;
    hasReadLink(readLinkFunc: (context: DataContextBase) => string): void;
    hasEditLink(editLinkFunc: (context: DataContextBase) => string): void;
    mapInstance(context: DataContextBase, any: any): any;
    mapInstanceSet(context: DataContextBase, any: any): any;
    mapInstanceProperty(context: DataContextBase, any: any): any;
}

export declare class SingletonConfiguration extends EntitySetConfiguration {
    constructor(builder: any, entityType: string, name: string);
}

export declare interface ModelBuilderJsonFormatterOptions {
    addContextAttribute?: boolean;
    addCountAttribute?: boolean;
}

export declare class ODataModelBuilder {
    constructor(configuration: ConfigurationBase);
    serviceRoot: string;
    getEntity(name: string): EntityTypeConfiguration;
    addEntity(name: string): EntityTypeConfiguration;
    addSingleton(entityType: string, name: string): SingletonConfiguration;
    getSingleton(name: string): SingletonConfiguration;
    hasSingleton(name: string): boolean;
    hasEntitySet(name: string): boolean;
    addEntitySet(entityType: string, name: string): EntitySetConfiguration;
    removeEntitySet(name: string): boolean;
    getEntitySet(name: string): EntitySetConfiguration;
    getEntityTypeEntitySet(entityName: string): EntitySetConfiguration;
    ignore(name: string): ODataModelBuilder;
    hasEntity(name: string): boolean;
    getEdm(): Promise<SchemaConfiguration>;
    clean(all?: boolean): ODataModelBuilder;
    getEdmDocument(): Promise<any>;
    hasContextLink(contextLinkFunc: (context: DataContextBase) => string): void;
    hasJsonFormatter(jsonFormatterFunc: (context: DataContextBase, 
        entitySet: EntitySetConfiguration, 
        instance: any, options?: ModelBuilderJsonFormatterOptions)=> any): void;
}

export declare class EntityDataContext implements DataContextBase {
    model(name: string):DataModelBase;
    db: DataAdapter;
    getConfiguration(): ConfigurationBase;
    finalize(callback?: (err?: Error) => void): void;
}

export declare class ODataConventionModelBuilder extends ODataModelBuilder {

}

export declare function defineDecorator(proto: Object|Function, key: string, decorator:Function): void;
