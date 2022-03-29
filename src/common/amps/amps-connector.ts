import { Client } from 'amps';
import { head } from 'ramda';
import { BehaviorSubject, first } from 'rxjs';
import { IAmpsConnectionInfo } from './models';

export interface IAmpsConnection {
    client: Client;
    onDisconnected: () => void;
    disconnect: () => void;
}
interface IInternalConInfo {
    connection?: IAmpsConnection;
    notifier: BehaviorSubject<Client | Error | undefined>,
    refCount: number;
}
class AmpsConnector {
    private readonly _connectionMap = new Map<string, IInternalConInfo>();

    async getClient(connectionInfo: IAmpsConnectionInfo, onDisconnected: (err: Error) => void, timeout?: number): Promise<IAmpsConnection> {
        const url = head(connectionInfo.url)!.toLowerCase();
        let conInfo = this._connectionMap.get(url);
        let notifier: BehaviorSubject<Client | Error | undefined>;
        if (!conInfo) {
            notifier = this._createAndConnectAmpsClient(connectionInfo.name, url);
            conInfo = { notifier, refCount: 1 };
            this._connectionMap.set(url, conInfo);
        } else {
            conInfo.refCount += 1;
            notifier = conInfo.notifier;
        }
        return new Promise<IAmpsConnection>((resolve, reject) => {
            notifier.pipe(
                first(c => !!c && c instanceof Client)
            ).subscribe(response => {
                if (response instanceof Client) {
                    conInfo!.connection = {
                        client: response,
                        onDisconnected: () => { },
                        disconnect: this.disconnect.bind(this, url)
                    };
                    this._connectionMap.set(url, conInfo!);
                    resolve(conInfo!.connection)
                }
            });
        });
    }

    private disconnect(url: string) {

    }

    private _createAndConnectAmpsClient(name: string, url: string): BehaviorSubject<Client | Error | undefined> {
        const notifier = new BehaviorSubject<Client | Error | undefined>(undefined);
        const ampsClient = new Client(name).disconnectHandler((client, err) => {
            console.error(err);
            setTimeout(() => client.connect(), 2000);
        });
        setTimeout(async () => {
            const message = await ampsClient.connect(url);
            notifier.next(ampsClient);
        }, 100);
        return notifier;
    }
}

export default new AmpsConnector();

