import { AmpsPagedDataSubscriber, IAmpsConnectionInfo, IAmpsSubscriptionInfo, IPagedData, PageIterator } from "../../../common/amps";
import { IAsyncData } from "../../../common/components";

type FetchDataFn = (searchToken: string, newQuery?: boolean) => Promise<IAsyncData>;
const QUERY_TIMEOUT = 2000;

export function getAmpsDataLoader(connectionInfo: IAmpsConnectionInfo,
    subInfo: IAmpsSubscriptionInfo,
    pageSize: number,
    buildFilter: (searchText: string) => string): FetchDataFn {
    const dataSubscriber = new AmpsPagedDataSubscriber(connectionInfo, subInfo);
    let iterator: PageIterator;
    let pagedData: IPagedData | undefined;

    return async (searchToken: string, newQuery?: boolean): Promise<IAsyncData> => {
        const queryFilter = buildFilter(searchToken);
        if (newQuery) {
            iterator?.dispose && iterator.dispose();
            iterator = await dataSubscriber.fetchData(queryFilter, pageSize, QUERY_TIMEOUT);
            pagedData = undefined;
        }
        if (iterator.error) {
            return { done: true, data: [], error: iterator.error };
        }
        if (pagedData?.done) {
            return { done: true, data: [] }
        }
        pagedData = await iterator.next();
        return {
            done: pagedData.done,
            data: pagedData.data ? pagedData.data : [],
            error: pagedData.error?.message
        };
    };
}