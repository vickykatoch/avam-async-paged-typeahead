import React from 'react';
import { fromEvent, Subscription, timer } from 'rxjs';
import { debounce, map } from 'rxjs/operators';
import { AutoSizer, IndexRange, InfiniteLoader, List, ListRowProps } from 'react-virtualized';

interface AsyncPagedTypeaheadProps {
    scrollThreshold: number;
    minChars?: number;
    rowHeight: number;
    resultWidth?:number;
    fetchNext: (token: string, newQuery?: boolean) => Promise<Array<any>>;
    RowItemRenderer:React.FunctionComponent<{listRowProps: ListRowProps;item:any; onClick: (item:any)=> void; style: React.CSSProperties}>;
}

const AsyncPagedTypeahead: React.FC<AsyncPagedTypeaheadProps> = ({ rowHeight, minChars, scrollThreshold,resultWidth, fetchNext, RowItemRenderer }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [rowCount, setRowCount] = React.useState<number>(0);
    const [dataList, setDataList] = React.useState<Array<any>>([]);
    const [hasMore, setHasMore] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState<string>('');

    React.useEffect(() => {
        let sub: Subscription;
        if (inputRef.current) {
            inputRef.current.focus();
            sub = fromEvent(inputRef.current, 'input').pipe(
                debounce(() => timer(300)),
                map(({ target }: any) => (target.value || '').trim()),
            ).subscribe(setSearchText);
        }
        return () => {
            sub?.unsubscribe();
        };
    }, [fetchNext, setSearchText]);

    const setData = React.useCallback((data?: Array<any>) => {
        if (Array.isArray(data)) {
            setLoading(false);           
            if (data.length) {
                setRowCount(data.length + 1);
                setDataList(data);
                setHasMore(true);
            } else {
                setDataList([]);
                setRowCount(0);
                setHasMore(false);
            }
        } else {
            setLoading(false);
            setDataList([]);
            setRowCount(0);
            setHasMore(false);
        }
    }, [setLoading, setDataList, setRowCount, setHasMore]);

    React.useEffect(() => {
        const fn = async () => {
            const data = await fetchNext(searchText, true);
            setData(data);
        };
        if (searchText) {
            setLoading(true);
            const shudSearch = searchText.length >= (minChars || 0);
            if (shudSearch) {
                fn();
            } else {
                setData();
            }
        } else {
            setData();
        }
    }, [searchText, setData, setLoading,minChars]);

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
    
    const onItemClick = React.useCallback((item)=> {
        console.log('Item Clicked',item);
    },[]);

    return <div className='d-flex justify-content-center mt-3'>
        <div style={{ width: 200 }} className="d-flex pos-rel">
            <input ref={inputRef} style={{ width: '100%' }} />
            
            {loading && <div style={{ position: 'absolute', right: 0 }}>Loading...</div>}
            {rowCount > 0 && <div className='layer' style={{width: resultWidth || 'auto'}}>
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
                                            return <RowItemRenderer key={props.key} style={props.style} listRowProps={props} item={dataList[props.index]} onClick={onItemClick} />
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