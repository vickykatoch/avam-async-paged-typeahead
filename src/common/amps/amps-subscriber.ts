import { filter } from 'rxjs/operators';
import { Client, Command, Message } from 'amps';
import AmpsConnectionService, { AmpsConnectionState } from './amps-connection-service';

import { IAmpsConnectionInfo, IAmpsSubscriptionInfo } from './models';

export class AmpsPagedDataSubscriber {

    constructor(private connectionInfo: IAmpsConnectionInfo, private subInfo: IAmpsSubscriptionInfo) {

    }

    async fetch(filterString: string, batchSize: number, timeout?: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const connector = AmpsConnectionService.getConnection(this.connectionInfo);
            connector.connecionStatus$.pipe(
                filter(status => status.state === AmpsConnectionState.Connected)
            ).subscribe(async () => {
                const recordCount = await this.getRecordCount(filterString, batchSize, connector.client);
                console.log(`Filter [${filterString}, Records : [${recordCount}]]`);
                if (recordCount > 0) {
                    const data = await this.fetchBatchData(connector.client, filterString, batchSize, 0);
                    let currentPage = 0;
                    resolve({
                        currentPage,
                        totalPages: Math.ceil(recordCount / batchSize),
                        data,
                        next: async (): Promise<any> => {
                            currentPage++;
                            return {
                                done: false,
                                currentPage,
                                data: await this.fetchBatchData(connector.client, filterString, batchSize, currentPage)
                            }
                        }
                    });
                } else {
                    resolve({
                        currentPage: 0,
                        totalPages: 0,
                        done: true,
                        data: []
                    });
                }
            });
        });
    }

    private buildCommand(filter: string, options: any, subId?: string): Command {
        const cmd = new Command('sow')
            .options(options)
            .topic(this.subInfo.topic)
            .filter(filter);
        return subId ? cmd.subId(subId) : cmd;
    }
    private getRecordCount(filter: string, batchSize: number, client: Client) {
        return new Promise<number>(async resolve => {
            const options = `${this.subInfo.options}, projection=[COUNT(/${this.subInfo.keyField}) as /count], grouping=[/count]`;
            const cmd = this.buildCommand(filter, options);
            let count = 0;
            const subId = await client.execute(cmd, (msg: Message) => {
                const { c, data } = msg;
                if (data) {
                    count = data.count;
                } else if (c === 'group_end') {
                    client.unsubscribe(subId);
                    resolve(count);
                }
            });
        });
    }
    private fetchBatchData(client: Client, filter: string, batchSize: number, pageIndex: number): Promise<any[]> {
        const options = `${this.subInfo.options}, skip_n=${pageIndex * batchSize}, top_n=${batchSize}`;
        const cmd = this.buildCommand(filter, options);
        return new Promise<any[]>(async (resolve) => {
            const collection: any[] = [];
            const subId = await client.execute(cmd, (msg: Message) => {
                const { c, data } = msg;
                if (data) {
                    collection.push(msg.data);
                } else if (c === 'group_end') {
                    client.unsubscribe(subId);
                    resolve(collection);
                }
            });
        });
    }
}
