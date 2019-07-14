import {IncomingMessage, ServerResponse, RequestListener} from "http";
import {HttpContext} from "./context";
import {SequentialEventEmitter} from "@themost/common/emitter";
import {ConfigurationBase} from "@themost/common";
import {RequestHandler} from "express";

declare interface ApplicationOptions {
    port?: number|string;
    bind?: string;
    cluster?: number|string;
}

export declare interface HttpControllerConfiguration {
    configure(app:HttpApplication);
}


export declare class HttpApplication extends SequentialEventEmitter {
    constructor (executionPath?:string);
    getConfiguration():ConfigurationBase;
    getExecutionPath(): string;
    mapExecutionPath(arg: string): string;
    createContext(request: IncomingMessage, response: ServerResponse): HttpContext;
    runtime(): RequestHandler;
    useController(name: string, controllerCtor: Function);
    useStrategy(serviceCtor: Function, strategyCtor: Function);
    useService(serviceCtor: Function);
    hasStrategy(serviceCtor: Function);
    hasService(serviceCtor: Function);
    getStrategy(serviceCtor: Function);
    getService(serviceCtor: Function);
}
