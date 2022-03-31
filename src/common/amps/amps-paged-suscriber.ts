import { Client, Command, Message } from "amps";
import { throwError } from "rxjs";
import { first, timeout as rxTimeout } from "rxjs/operators";
import AmpsConnectionService from "./amps-connection-service";
import { IAmpsConnectionInfo, IAmpsSubscriptionInfo, AmpsConnectionState, IAmpsConnection } from "./models";


export interface IPagedData {
    currentPage: number;
    totalPages: number;
    done?: boolean;
    data?: Array<any>;
    error?: Error;
}
export type PageIterator = {
    error?: string;
    next: () => Promise<IPagedData>;
    dispose?: () => void;
};


export class AmpsPagedDataSubscriber {
    constructor(private connectionInfo: IAmpsConnectionInfo, private subInfo: IAmpsSubscriptionInfo) {

    }

    fetchData(filterQuery: string, batchSize: number, timeout?: number): Promise<PageIterator> {
        return new Promise<PageIterator>((resolve, reject) => {
            const connection = AmpsConnectionService.getConnection(this.connectionInfo);
            connection.connecionStatus$.pipe(
                first(s => s.state === AmpsConnectionState.Connected),
                rxTimeout({ first: timeout || Number.MIN_SAFE_INTEGER, with: () => throwError(() => new Error('timedout')) })
            ).subscribe({
                next: async () => {
                    try {
                        const recordCount = await this.getRecordCount(filterQuery, batchSize, connection.client);
                        console.log(`Filter [${filterQuery}, Records : [${recordCount}]]`);
                        resolve(this.getPageIterator(filterQuery, batchSize, recordCount, connection));
                    } catch (err) {
                        connection.dispose();
                        resolve({ error: (err as Error).message, next: () => Promise.resolve({} as any) });
                    }
                }, error: (err: Error) => {
                    connection.dispose();
                    resolve({ error: err.message, next: () => Promise.resolve({} as any) });
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

    private getPageIterator(filterQuery: string, batchSize: number, totalRecords: number, connection: IAmpsConnection): PageIterator {
        let currentPage = 0;
        const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / batchSize);
        let done = totalRecords === 0;

        const next = (): Promise<IPagedData> => new Promise<IPagedData>(async resolve => {
            if (done) {
                resolve({ currentPage, totalPages, done });
            }
            try {
                const { client } = connection;
                const data = await this.fetchPageData(filterQuery, currentPage, batchSize, client);
                currentPage++;
                done = currentPage === totalPages;
                resolve({
                    currentPage,
                    totalPages,
                    done,
                    data
                });
            } catch (err) {
                done = true;
                resolve({ currentPage, totalPages, done: true, error: err as Error });
            } finally {
                done && connection.dispose();
            }
        });
        return { next, dispose: () => connection.dispose() }
    }

    private fetchPageData(filterQuery: string, pageIndex: number, batchSize: number, client: Client) {
        const options = `${this.subInfo.options}, skip_n=${pageIndex * batchSize}, top_n=${batchSize}`;
        const cmd = this.buildCommand(filterQuery, options);
        return new Promise<any[]>(async (resolve, reject) => {
            const collection: any[] = [];
            const subId = await client.execute(cmd, (msg: Message) => {
                const { c, data } = msg;
                if (data) {
                    collection.push(msg.data);
                } else if (c === 'group_end') {
                    subId && client.unsubscribe(subId);
                    resolve(collection);
                }
            }).catch(reject);
        });
    }

    private getRecordCount(filter: string, batchSize: number, client: Client) {
        return new Promise<number>(async (resolve, reject) => {
            const options = `${this.subInfo.options}, projection=[COUNT(/${this.subInfo.keyField}) as /count], grouping=[/count]`;
            const cmd = this.buildCommand(filter, options);
            let count = 0;
            const subId = await client.execute(cmd, (msg: Message) => {
                const { c, data } = msg;
                if (data) {
                    count = data.count;
                } else if (c === 'group_end') {
                    subId && client.unsubscribe(subId);
                    resolve(count);
                }
            }).catch(reject);
        });
    }
}


