import { BeforeSaveEventListener, DataEventArgs } from "./types";
export declare class CalculatedValueListener implements BeforeSaveEventListener {
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;
}
