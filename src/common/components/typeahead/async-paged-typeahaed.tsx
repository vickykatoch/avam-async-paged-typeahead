import React from 'react';
import { AutoSizer, IndexRange, InfiniteLoader, List, ListRowProps } from 'react-virtualized';

interface AsyncPagedTypeaheadProps {
    scrollThreshold: number;
    rowHeight: number;
    fetchNext: (newQuery?: boolean) => Promise<Array<any>>;
    rowRenderer: (props: ListRowProps & { item: any }) => React.ReactNode;
}

const AsyncPagedTypeahead: React.FC<AsyncPagedTypeaheadProps> = ({ rowHeight, scrollThreshold, fetchNext, rowRenderer }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [rowCount, setRowCount] = React.useState<number>(0);
    const [dataList, setDataList] = React.useState<Array<any>>([]);
    const [hasMore, setHasMore] = React.useState<boolean>(false);

    React.useEffect(() => {
        setTimeout(async () => {
            const data = await fetchNext(true);
            if (data.length) {
                setHasMore(true);
                setDataList(data);
                setRowCount(data.length + 1);
            }
        }, 1000);
    }, [fetchNext]);

    const onNext = React.useCallback(async () => {
        const data = await fetchNext();
        if (data.length) {
            setHasMore(true);
            setDataList(data);
            setRowCount(count => {
                console.log('Another set of data received : ', count + data.length);
                return count + data.length;
            });
        } else {
            setHasMore(false);
            console.log('No More data available');
        }
    }, [fetchNext, setRowCount, setDataList, setHasMore]);

    const isRowLoaded = React.useCallback(({ index }) => {
        return Boolean(dataList[index]);
    }, [dataList]);

    const loadMoreRows = React.useCallback(async (params: IndexRange) => {
        const data = await fetchNext();
        if (data.length) {
            const resolvedData = [...dataList, ...data];
            setHasMore(true);
            setDataList(resolvedData);
            setRowCount(resolvedData.length +1);
        } else {
            setHasMore(false);
            setRowCount(dataList.length);
            console.log('No More data available');
        }
    }, [dataList,hasMore]);

    return <div className='d-flex justify-content-center mt-3'>
        <div style={{ width: 200 }} className="d-flex pos-rel">
            <input ref={inputRef} style={{ width: '100%' }} />
            <button onClick={onNext} disabled={!hasMore}>Next</button>
            <div className='layer'>
                <InfiniteLoader
                    threshold={scrollThreshold}
                    isRowLoaded={isRowLoaded}
                    loadMoreRows={loadMoreRows}
                    rowCount={rowCount}
                >
                    {({ onRowsRendered, registerChild }) => (
                        <AutoSizer>
                            {({ width, height }) => {
                                return <List
                                    height={height}
                                    onRowsRendered={onRowsRendered}
                                    ref={registerChild}
                                    rowCount={rowCount}
                                    rowHeight={rowHeight}
                                    rowRenderer={props => {
                                        if (!isRowLoaded(props)) {
                                            return <span key={props.key} style={props.style}>Loading...</span>;
                                        } else {
                                        return rowRenderer({ ...props, item: dataList[props.index] })
                                        }
                                    }}
                                    width={width}
                                />
                            }}
                        </AutoSizer>
                    )}
                </InfiniteLoader>
            </div>
        </div>
    </div>
};

export default AsyncPagedTypeahead;