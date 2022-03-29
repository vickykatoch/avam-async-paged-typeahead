import faker from '@faker-js/faker';
import { nanoid } from 'nanoid';

interface IData {
    pageIndex: number;
    data: Array<any>;
    hasMore: boolean;
}

interface DataSpec {
    currentPage: number;
    totalPages: number;
};
const getSingleRecord = (index: number): any => ({
    id: nanoid(12),
    firstName: faker.name.firstName(index%2===0 ? 'male' : 'female'),
    lastName: faker.name.lastName(index%2===0 ? 'male' : 'female'),
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
            dataSpec = newQuery ? {currentPage:1, totalPages:10} : {...dataSpec, currentPage:dataSpec.currentPage+1};
            console.log(`Loading Page : [${dataSpec.currentPage}]`);
            if( dataSpec.currentPage <= dataSpec.totalPages) {
                setTimeout(()=>  resolve(getData(pageSize)),2000);
            } else {
                resolve([]);
            }            
        });
    };
}