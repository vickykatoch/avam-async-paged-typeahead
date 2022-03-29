import { Client, Command, CommandParams, Message } from 'amps';
import AmpsConnector from './amps-connector';
import { IAmpsConnectionInfo, IAmpsSubscriptionInfo } from './models';

export class AmpsPagedDataSubscriber {

    constructor(private connectionInfo: IAmpsConnectionInfo, private subInfo: IAmpsSubscriptionInfo) {

    }

    async fetch(filter: string, batchSize: number, timeout?: number) {
        const connection = await AmpsConnector.getClient(this.connectionInfo, (err: Error) => {
            console.error(err);
        }, timeout);
        const recordCount = await this.getRecordCount(filter, batchSize, connection.client);
        console.log(`Filter [${filter}, Records : [${recordCount}]]`);
        if (recordCount > 0) {
            const data = await this.fetchBatchData(connection.client, filter, batchSize, 0);
            let currentPage = 0;
            return {
                currentPage,
                totalPages: Math.ceil(recordCount / batchSize),
                data,
                next: async (): Promise<any> => {
                    currentPage++;
                    return {
                        done: false,
                        currentPage,
                        data: await this.fetchBatchData(connection.client, filter, batchSize,currentPage)
                    }
                }
            };
        } else {
            return {
                currentPage:0,
                totalPages:0,
                done: true,
                data:[]
            };
        }
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
            let count=0;
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
        const options = `${this.subInfo.options}, skip_n=${pageIndex*batchSize}, top_n=${batchSize}`;
        const cmd = this.buildCommand(filter, options);
        return new Promise<any[]>(async (resolve) => {
            const collection:any[] = [];
            const subId = await  client.execute(cmd, (msg: Message) => {
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
