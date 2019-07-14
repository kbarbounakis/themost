import {IApplication, IApplicationService} from "@themost/common";
import {IncomingMessage, ServerResponse} from "http";
import {HttpContext} from "./context";
import {HttpApplication} from "./app";

export declare class HttpApplicationService implements IApplicationService {
    constructor(app: IApplication);
    application: IApplication;

    getApplication(): IApplication;
}


export declare class HttpContextProvider {
    constructor (app:HttpApplication);
    create(req:IncomingMessage, res: ServerResponse):HttpContext;
}
