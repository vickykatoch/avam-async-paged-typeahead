import { head } from 'ramda';
import React from 'react';
import { IAmpsConnectionInfo, IAmpsSubscriptionInfo } from '../../common/amps';
import RowRenderer from '../../common/row-renderer';
import { AmpsAsyncPagedTypeahead } from '../components';

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
};
const buildFilter  =(searchText: string): string => {
    const splitTokens = searchText.split(' ').filter(t=>!!t);
    let query = '';
    if(splitTokens.length>1) {
        query = splitTokens.reduce((acc,cur)=> `${acc}${cur}.*`,'^');
    } else {
        query = `${head(splitTokens)!}.*`;
    }
    return `/fullName LIKE "(?i)${query}$"`;
};


const AmpsConnectionScratchPad: React.FC = () => {
    const [item, setItem] = React.useState<any>();

    return <div className="d-flex flex-column flex-grow-1">
        <AmpsAsyncPagedTypeahead
            connectionInfo={conInfo}
            subInfo={subInfo}
            value={item}
            pageSize={50}
            buildFilter={buildFilter}
            itemToString={item => item.fullName}
            onItemSelected={setItem}
            scrollThreshold={15} RowItemRenderer={RowRenderer} rowHeight={20} minChars={3} 
            resultHeight={100}
            resultWidth={400}
        />
    </div>
};
export default AmpsConnectionScratchPad;
