import { DataContextBase, DataObjectBase, DataQueryableBase } from "./DataModelBase";

export declare class DataObject implements DataObjectBase {
    context:DataContextBase;
    silent(value?:boolean):this;
    selector(name:string, selector:Function):this;
    is(selector:string):Promise<any>
    getType():string
    getId():any
    query(attr:string):DataQueryableBase;
    save(context?: DataContextBase, callback?:(err:Error) => void):Promise<any>|void;
    remove(context?: DataContextBase, callback?:(err:Error) => void):Promise<any>|void;
    getModel(): any;
    getAdditionalModel():Promise<any>;
    getAdditionalObject():Promise<DataObject|any>;
    attr(name: string, callback?:(err?: Error,res?: any) => void): any;
    property(name: string): any;
}