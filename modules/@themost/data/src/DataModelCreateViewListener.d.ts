import { AfterUpgradeEventListener, DataEventArgs } from "./types";
export declare class DataModelCreateViewListener implements AfterUpgradeEventListener {
    afterUpgrade(event: DataEventArgs, callback: (err?: Error) => void): void;
}
