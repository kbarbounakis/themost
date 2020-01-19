import { DataModelBase, DataContextBase } from "./DataModelBase";
import { ConfigurationBase, SequentialEventEmitter } from "@themost/common";
import { DataAdapter } from "./DataAdapter";
export declare class DataContext extends SequentialEventEmitter implements DataContextBase  {
    model(name: string): DataModelBase;
    db: DataAdapter;
    getConfiguration(): ConfigurationBase;
    finalize(callback?: (err?: Error) => void): void
}
