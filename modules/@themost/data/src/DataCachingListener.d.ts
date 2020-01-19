import { AfterExecuteEventListener, BeforeExecuteEventListener, DataEventArgs } from "./types";
export declare class DataCachingListener implements BeforeExecuteEventListener, AfterExecuteEventListener {
    afterExecute(event: DataEventArgs, callback: (err?: Error) => void): void;
    beforeExecute(event: DataEventArgs, callback: (err?: Error) => void): void;
}
