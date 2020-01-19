import { BeforeSaveEventListener, DataEventArgs } from "./types";
export declare class UniqueConstraintListener implements BeforeSaveEventListener {
    beforeSave(event: DataEventArgs, callback: (err?: Error) => void): void;
}
