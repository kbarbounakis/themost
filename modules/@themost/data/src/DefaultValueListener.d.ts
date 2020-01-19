import { BeforeSaveEventListener, DataEventArgs } from "./types";
export declare class DefaultValueListener implements BeforeSaveEventListener {
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;
}
