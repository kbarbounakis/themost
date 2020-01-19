import { AfterUpgradeEventListener, DataEventArgs } from "./types";
export declare class DataModelSeedListener implements AfterUpgradeEventListener {
    afterUpgrade(event: DataEventArgs, callback: (err?: Error) => void): void;
}
