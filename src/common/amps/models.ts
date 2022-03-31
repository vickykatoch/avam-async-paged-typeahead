import { Client } from "amps";
import { Observable } from "rxjs";

export interface IAmpsConnectionInfo {
    name: string;
    url: string[];    
}
export interface IAmpsSubscriptionInfo {
    name: string;
    topic: string;
    options: any;
    filter: string;
    keyField: string;
}
export interface PublicationInfo {
    topic: string;
    payload: any;
}
export enum AmpsConnectionState {
    None,
    Connecting,
    Connected,
    Disconnected
}
export interface IConnectionStatus {
    state: AmpsConnectionState,
    error?: string;
}
export interface IAmpsConnection {
    readonly connecionStatus$: Observable<IConnectionStatus>;
    readonly client: Client;
    dispose: (force?: boolean) => void;
}