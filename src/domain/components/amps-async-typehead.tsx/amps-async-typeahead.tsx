import React from 'react';
import { IAmpsConnectionInfo, IAmpsSubscriptionInfo } from '../../../common/amps';
import { AsyncPagedTypeahead, AsyncPagedTypeaheadProps } from '../../../common/components/typeahead';
import { getAmpsDataLoader } from './amps-data-loader';

interface AmpsAsyncPagedTypeaheadProps extends Omit<AsyncPagedTypeaheadProps, 'fetchNext'> {
    connectionInfo: IAmpsConnectionInfo;
    subInfo: IAmpsSubscriptionInfo;
    pageSize: number;
    buildFilter: (searchText: string)=> string;
}

const AmpsAsyncPagedTypeahead: React.FC<AmpsAsyncPagedTypeaheadProps> = (props) => {
    const [asyncProps] = React.useState<AsyncPagedTypeaheadProps>({
        ...props,
        fetchNext: getAmpsDataLoader(props.connectionInfo, props.subInfo, props.pageSize, props.buildFilter)
    });

    return <AsyncPagedTypeahead {...asyncProps} value={props.value}/>
};

export default AmpsAsyncPagedTypeahead;

