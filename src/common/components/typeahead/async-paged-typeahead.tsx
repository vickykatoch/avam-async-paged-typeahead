import React from 'react';
import { fromEvent, Subscription, timer } from 'rxjs';
import { debounce, map } from 'rxjs/operators';
import { AutoSizer, IndexRange, InfiniteLoader, List, ListRowProps } from 'react-virtualized';

export interface IAsyncData {
    done?: boolean;
    data: Array<any>;
    error?: string;
}

export interface AsyncPagedTypeaheadProps {
    scrollThreshold: number;
    minChars?: number;
    rowHeight: number;
    resultWidth?: number;
    fetchNext: (token: string, newQuery?: boolean) => Promise<IAsyncData>;
    RowItemRenderer: React.FunctionComponent<{ listRowProps: ListRowProps; item: any; onClick: (item: any) => void; style: React.CSSProperties }>;
    onItemSelected?: (item: any) => void;
    value: any;
    itemToString?: (item: any) => string;
}

const AsyncPagedTypeahead: React.FC<AsyncPagedTypeaheadProps> = ({ rowHeight, minChars, scrollThreshold, resultWidth,
    fetchNext, RowItemRenderer, onItemSelected, value, itemToString }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [rowCount, setRowCount] = React.useState<number>(0);
    const [dataList, setDataList] = React.useState<Array<any>>([]);
    const [hasMore, setHasMore] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');

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
    }, [setSearchText]);

    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = value ? itemToString ? itemToString(value) : value : '';
        }
    }, [value, itemToString]);

    const setData = React.useCallback((searchResult?: IAsyncData) => {
        if (searchResult) {
            setLoading(false);
            if (searchResult.error) {
                setError(searchResult.error);
                setDataList([]);
                setRowCount(0);
                setHasMore(false);
            } else {
                const recCount = searchResult.done ? searchResult.data.length : searchResult.data.length + 1;
                setRowCount(recCount);
                setError('');
                setDataList(searchResult.data);
                setHasMore(!searchResult.done);
            }
        } else {
            setError('');
            setLoading(false);
            setDataList([]);
            setRowCount(0);
            setHasMore(false);
        }
    }, [setLoading, setDataList, setRowCount, setHasMore]);

    React.useEffect(() => {
        const fn = async () => {
            setLoading(true);
            const data = await fetchNext(searchText, true);
            setData(data);
        };
        if (searchText) {
            setLoading(true);
            setData()
            const shudSearch = searchText.length >= (minChars || 0);
            if (shudSearch) {
                fn();
            }
        } else {
            setData();
        }
    }, [searchText, setData, setLoading, minChars]);

    const isRowLoaded = React.useCallback(({ index }) => {
        return Boolean(dataList[index]);
    }, [dataList]);

    const loadMoreRows = React.useCallback(async (params: IndexRange) => {
        if (hasMore) {
            setLoading(true);
            const result = await fetchNext(searchText);
            if (result.error) {
                setError(result.error);
                setDataList([]);
                setRowCount(0);
                setHasMore(false);
            } else {
                const resolvedData = [...dataList, ...result.data];
                const recCount = result.done ? resolvedData.length : resolvedData.length + 1;
                setDataList(resolvedData);
                setRowCount(recCount);
                setHasMore(!result.done);
            }
            setLoading(false);
        }
    }, [dataList, hasMore, setLoading, setRowCount, searchText]);

    const onItemClick = React.useCallback((item) => {
        onItemSelected && onItemSelected(item);
        setData();
    }, [setData]);

    return <div className='d-flex justify-content-center mt-3'>
        <div style={{ width: 200 }} className="d-flex pos-rel">
            <input ref={inputRef} style={{ width: '100%', backgroundColor: error ? 'red' : '' }} title={error} />
            {loading && <div style={{ position: 'absolute', right: 0 }}>Loading...</div>}
            {rowCount > 0 && <div className='layer' style={{ width: resultWidth || 'auto' }}>
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