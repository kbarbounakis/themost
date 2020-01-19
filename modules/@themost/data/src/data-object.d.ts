import {DataQueryable} from "./data-queryable";
import {DataContext} from "./types";

export declare class DataObject {
    context:DataContext;
    silent(value?:boolean):DataObject;
    selector(name:string, selector:Function):DataObject;
    is(selector:string):Promise<any>
    getType():string
    getId():any
    query(attr:string):DataQueryable;
    save(context?: DataContext, callback?:(err:Error) => void):Promise<any>|void;
    remove(context?: DataContext, callback?:(err:Error) => void):Promise<any>|void;
    getModel(): any;
    getAdditionalModel():Promise<any>;
    getAdditionalObject():Promise<DataObject|any>;
    attr(name: string, callback?:(err?: Error,res?: any) => void);
    property(name: string);
}