import { AfterUpgradeEventListener, DataEventArgs } from "./types";
export declare class DataModelSubTypesListener implements AfterUpgradeEventListener {
    afterUpgrade(event: DataEventArgs, callback: (err?: Error) => void): void;
}
