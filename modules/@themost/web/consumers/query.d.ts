import {NextFunction, Request, RequestHandler, Response} from "express-serve-static-core";

declare interface IncomingMessage {
    query: any;
}

export default function query(): RequestHandler;
