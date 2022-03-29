import React from 'react';
import { fromEvent, Subscription, timer } from 'rxjs';
import { debounce, map } from 'rxjs/operators';
import { AutoSizer, IndexRange, InfiniteLoader, List, ListRowProps } from 'react-virtualized';

interface AsyncPagedTypeaheadProps {
    scrollThreshold: number;
    rowHeight: number;
    fetchNext: (token: string, newQuery?: boolean) => Promise<Array<any>>;
    rowRenderer: (props: ListRowProps & { item: any }) => React.ReactNode;
}

const AsyncPagedTypeahead: React.FC<AsyncPagedTypeaheadProps> = ({ rowHeight, scrollThreshold, fetchNext, rowRenderer }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [rowCount, setRowCount] = React.useState<number>(0);
    const [dataList, setDataList] = React.useState<Array<any>>([]);
    const [hasMore, setHasMore] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState<string>('');

    React.useEffect(() => {
        console.log('CALLED');
        let sub: Subscription;
        if (inputRef.current) {
            inputRef.current.focus();
            sub = fromEvent(inputRef.current, 'input').pipe(
                debounce(() => timer(300)),
                map(({ target }: any) => target.value),
            ).subscribe(async (token) => {
                setSearchText(token);
                setLoading(false);
                setDataList([]);
                setRowCount(0);
                setHasMore(false);
                if (token) {
                    setLoading(true);
                    const data = await fetchNext(token, true);
                    if (data.length) {
                        setHasMore(true);
                        setDataList(data);
                        setRowCount(data.length + 1);
                        setLoading(false);
                    } else {
                        setLoading(false);
                        setHasMore(false);
                    }
                }
            });
        }
        return () => {
            sub?.unsubscribe();
        };
    }, [fetchNext, setHasMore, setDataList, setRowCount, setLoading, setSearchText]);

    const isRowLoaded = React.useCallback(({ index }) => {
        return Boolean(dataList[index]);
    }, [dataList]);

    const loadMoreRows = React.useCallback(async (params: IndexRange) => {
        if (hasMore) {
            setLoading(true);
            const data = await fetchNext(searchText);
            if (data.length) {
                const resolvedData = [...dataList, ...data];
                setHasMore(true);
                setDataList(resolvedData);
                setRowCount(resolvedData.length + 1);
            } else {
                setHasMore(false);
                setRowCount(dataList.length);
                console.log('No More data available');
            }
            setLoading(false);
        }
    }, [dataList, hasMore, setLoading, searchText]);

    return <div className='d-flex justify-content-center mt-3'>
        <div style={{ width: 200 }} className="d-flex pos-rel">
            <input ref={inputRef} style={{ width: '100%' }} />
            {loading && <div style={{ position: 'absolute', right: 0 }}>Loading...</div>}
            {rowCount > 0 && <div className='layer'>
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
            </div>}
        </div>
    </div>
};

export default AsyncPagedTypeahead;