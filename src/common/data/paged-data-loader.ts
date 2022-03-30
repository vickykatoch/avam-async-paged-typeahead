import faker from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { head } from 'ramda';
import { AmpsPagedDataSubscriber, IAmpsConnectionInfo, IAmpsSubscriptionInfo } from '../amps';

interface DataSpec {
    currentPage: number;
    totalPages: number;
};
const getSingleRecord = (index: number): any => ({
    id: nanoid(12),
    firstName: faker.name.firstName(index % 2 === 0 ? 'male' : 'female'),
    lastName: faker.name.lastName(index % 2 === 0 ? 'male' : 'female'),
    title: faker.name.title().toString(),
    date: faker.date.past().toDateString(),
    version: nanoid(15),
    color: faker.commerce.color(),
})
const getData = (size: number): Array<any> => {
    return Array.from({ length: size }, (_, index) => getSingleRecord(index));
};


export function fetchData(pageSize: number) {
    let dataSpec: DataSpec;

    return (newQuery?: boolean): Promise<Array<any>> => {
        return new Promise<Array<any>>(resolve => {
            dataSpec = newQuery ? { currentPage: 1, totalPages: 1000 } : { ...dataSpec, currentPage: dataSpec.currentPage + 1 };
            console.log(`Loading Page : [${dataSpec.currentPage}]`);
            if (dataSpec.currentPage <= dataSpec.totalPages) {
                setTimeout(() => resolve(getData(pageSize)), 500);
            } else {
                resolve([]);
            }
        });
    };
}

//#region AMPS
const conInfo: IAmpsConnectionInfo = {
    name: 'DATA-FETCHER',
    url: ['ws://avam-ubnt:9028/amps/json']
};
const subInfo: IAmpsSubscriptionInfo = {
    name: 'NAMES-DATA-SERVICE',
    filter: '/firstName LIKE b',
    options: 'no_empties,oof,replace',
    topic: '/fake/names',
    keyField: 'id'
}

export function fetchAmpsData(pageSize: number) {
    const subscriber = new AmpsPagedDataSubscriber(conInfo, subInfo);
    let response: any;
    return (token: string, newQuery?: boolean): Promise<Array<any>> => {
        return new Promise<Array<any>>(async resolve => {
            if (newQuery) {                
                const splitTokens = token.split(' ').filter(t=>!!t);
                let query = '';
                if(splitTokens.length>1) {
                    // query = splitTokens.reduce((acc,cur)=> `${acc}${cur}.*`,'^'); When starts with is required
                    query = splitTokens.reduce((acc,cur)=> `${acc}${cur}.*`,'^');
                } else {
                    // query= `^${head(splitTokens)!}.*`; When starts with is required
                    query= `${head(splitTokens)!}.*`;
                }
                response = await subscriber.fetch(`/fullName LIKE "(?i)${query}$"`, pageSize);
                resolve(response.data);
            } else if (!response.done) {
                const { done, data } = await response.next();
                resolve(data);
                done && (response.done = true);
            } else {
                resolve([]);
            }
        });
    };
}



//#endregion