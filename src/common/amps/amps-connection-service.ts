import { Client, DefaultServerChooser } from "amps";
import { Observable, BehaviorSubject } from "rxjs";
import { AmpsConnectionState, IAmpsConnection, IAmpsConnectionInfo, IConnectionStatus } from "./models";

const RECONNECT_DELAY = 5000;
const SWEEP_INTERVAL = 60 * 5 * 1000; //5 mins


class AmpsConnector implements IAmpsConnection {
    private readonly _client: Client;
    private readonly _connectionStatusNotifer = new BehaviorSubject<IConnectionStatus>({ state: AmpsConnectionState.None });

    constructor(private connectionInfo: IAmpsConnectionInfo, private onDisposed: (force?: boolean) => void) {
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

    dispose(force?: boolean) {
        this.onDisposed(force);
    }

    private connect(delay?: number) {
        setTimeout(async () => {
            this._connectionStatusNotifer.next({ state: AmpsConnectionState.Connecting });
            try {
                const message = await this._client.connect();
                console.log('Connection succeeded');
                this._connectionStatusNotifer.next({ state: AmpsConnectionState.Connected });
            } catch (err) {
                console.error('Connection failed',err);
                // Ignore the error as error handler will pick up and 
            }
        }, delay || RECONNECT_DELAY);
    }
}

class AmpsConnectionService {
    private _connectionMap = new Map<string, { refCount: number, connector: IAmpsConnection, marked?: boolean, timerHandle?: any }>();

    getConnection(connectionInfo: IAmpsConnectionInfo): IAmpsConnection {
        const urlKey = connectionInfo.url.join('.').toLowerCase();
        if (!this._connectionMap.has(urlKey)) {
            this._connectionMap.set(urlKey, {
                refCount: 1,
                connector: new AmpsConnector(connectionInfo, this.onConnectionDisposed.bind(this, urlKey))
            });
        } else {
            const conInfo = this._connectionMap.get(urlKey)!;
            conInfo.refCount++;
            conInfo.marked = false;
            conInfo.timerHandle && clearTimeout(conInfo.timerHandle);
            conInfo.timerHandle=undefined;
            console.log(`Connection : [${urlKey}] has [${conInfo.refCount}] references running`);
            this._connectionMap.set(urlKey, conInfo);
        }
        return this._connectionMap.get(urlKey)!.connector;
    }

    private onConnectionDisposed(urlKey: string, force?: boolean) {
        if (this._connectionMap.has(urlKey)) {
            const conInfo = this._connectionMap.get(urlKey)!;
            if (conInfo.refCount <= 1) {
                conInfo.refCount--;
                conInfo.marked = true;
                if (force) {
                    this._connectionMap.delete(urlKey);
                    conInfo.connector.client.disconnect();
                    console.log(`Connection : [${urlKey}] has been forcefully disposed`);
                } else {
                    conInfo.timerHandle = setTimeout(() => this.disposeConnection(urlKey), SWEEP_INTERVAL);
                    this._connectionMap.set(urlKey, conInfo);
                }
            } else {
                conInfo.refCount--;
                this._connectionMap.set(urlKey, conInfo);
                console.log(`Connection : [${urlKey}] has [${conInfo.refCount}] references running`);
            }
        }
    }
    private disposeConnection(urlKey: string) {
        const conInfo = this._connectionMap.get(urlKey)!;
        if (conInfo && conInfo.marked) {
            this._connectionMap.delete(urlKey);
            conInfo.connector.client.disconnect();
            console.log(`Connection : [${urlKey}] has been disposed`);
        }
    }
}

export default new AmpsConnectionService();
