import { Client, DefaultServerChooser } from "amps";
import { Observable, BehaviorSubject } from "rxjs";
import { IAmpsConnectionInfo } from "./models";

const RECONNECT_DELAY = 5000;


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
class AmpsConnector {
    private readonly _client: Client;
    private readonly _connectionStatusNotifer = new BehaviorSubject<IConnectionStatus>({ state: AmpsConnectionState.None });

    constructor(private connectionInfo: IAmpsConnectionInfo, private onDisposed: () => void) {
        const serverChooser = new DefaultServerChooser();
        connectionInfo.url.forEach(url => serverChooser.add(url));
        this._client = new Client(connectionInfo.name).disconnectHandler((client, err) => {
            console.error(err);
            this._connectionStatusNotifer.next({ state: AmpsConnectionState.Disconnected, error: err.message });
            this.connect();
        });
        this._client.serverChooser(serverChooser);
        this.connect(10);
    }

    get connecionStatus$(): Observable<IConnectionStatus> {
        return this._connectionStatusNotifer.asObservable();
    }
    get client(): Client {
        return this._client;
    }

    dispose() {
        this.onDisposed();
    }

    private connect(delay?: number) {
        setTimeout(async () => {
            this._connectionStatusNotifer.next({ state: AmpsConnectionState.Connecting });
            try {
                const message = await this._client.connect();
                console.log(message);
                this._connectionStatusNotifer.next({ state: AmpsConnectionState.Connected });
            } catch (err) {
                // Ignore the error as error handler will pick up and 
            }
        }, delay || RECONNECT_DELAY);
    }
}

class AmpsConnectionService {
    private _connectionMap = new Map<string, { refCount: number, connector: AmpsConnector }>();

    getConnection(connectionInfo: IAmpsConnectionInfo): AmpsConnector {
        const urlKey = connectionInfo.url.join('.').toLowerCase();
        if (!this._connectionMap.has(urlKey)) {
            this._connectionMap.set(urlKey, {
                refCount: 1,
                connector: new AmpsConnector(connectionInfo, this.onConnectionDisposed.bind(this, urlKey))
            });
        } else {
            const conInfo = this._connectionMap.get(urlKey)!;
            conInfo.refCount++;
            console.log(`Connection : [${urlKey}] has [${conInfo.refCount}] references running`);
            this._connectionMap.set(urlKey,conInfo);
        }
        return this._connectionMap.get(urlKey)!.connector;
    }

    private onConnectionDisposed(urlKey: string) {
        if (this._connectionMap.has(urlKey)) {
            const conInfo = this._connectionMap.get(urlKey)!;
            if (conInfo.refCount <= 1) {
                this._connectionMap.delete(urlKey);
                conInfo.connector.client.disconnect();
                console.log(`Connection : [${urlKey}] has been disposed`);
            } else {
                conInfo.refCount--;
                this._connectionMap.set(urlKey, conInfo);
                console.log(`Connection : [${urlKey}] has [${conInfo.refCount}] references running`);
            }
        }
    }
}

export default new AmpsConnectionService();
