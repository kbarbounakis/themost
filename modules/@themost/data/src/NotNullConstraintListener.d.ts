import { BeforeSaveEventListener, DataEventArgs } from "./types";
export declare class NotNullConstraintListener implements BeforeSaveEventListener {
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;
}
