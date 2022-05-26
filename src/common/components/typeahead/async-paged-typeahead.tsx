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
    resultHeight?:number;
    resultWidth?: number;
    fetchNext: (token: string, newQuery?: boolean) => Promise<IAsyncData>;
    RowItemRenderer: React.FunctionComponent<{ selected: boolean, listRowProps: ListRowProps; item: any; onClick: (item: any) => void; style: React.CSSProperties }>;
    onItemSelected?: (item: any) => void;
    value: any;
    itemToString?: (item: any) => string;
}
const isInView = (container: Element, element: Element): boolean => {
    const containerRect = container.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();
    return (elemRect.top >= containerRect.y && elemRect.bottom <= containerRect.bottom)
};

const AsyncPagedTypeahead: React.FC<AsyncPagedTypeaheadProps> = ({ rowHeight, minChars, scrollThreshold,resultHeight, resultWidth,
    fetchNext, RowItemRenderer, onItemSelected, value, itemToString }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const resultElemRef = React.useRef<HTMLDivElement>(null);

    const [rowCount, setRowCount] = React.useState<number>(0);
    const [dataList, setDataList] = React.useState<Array<any>>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');
    const [selectedIndex, setSelectedindex] = React.useState<number>(-1);

    React.useEffect(() => {
        let sub: Subscription;
        if (inputRef.current) {
            setSelectedindex(-1);
            inputRef.current.focus();
            sub = fromEvent(inputRef.current, 'input').pipe(
                debounce(() => timer(300)),
                map(({ target }: any) => (target.value || '').trim()),
            ).subscribe(setSearchText);
        }
        return () => {
            sub?.unsubscribe();
        };
    }, [setSearchText, setSelectedindex]);

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
                setSelectedindex(-1);
            } else {
                const recCount = searchResult.done ? searchResult.data.length : searchResult.data.length + 1;
                setRowCount(recCount);
                setError('');
                setDataList(searchResult.data);
                setSelectedindex(-1);
            }
        } else {
            setError('');
            setLoading(false);
            setDataList([]);
            setRowCount(0);
            setSelectedindex(-1);
        }
    }, [setLoading, setDataList, setRowCount, setSelectedindex]);

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
    }, [searchText, setData, setLoading, fetchNext, minChars]);

    const isRowLoaded = React.useCallback(({ index }) => {
        return Boolean(dataList[index]);
    }, [dataList]);

    const loadMoreRows = React.useCallback(async (params: IndexRange) => {
        if (!dataList.length) return;
        setLoading(true);
        const result = await fetchNext(searchText);
        if (result.error) {
            setError(result.error);
            setDataList([]);
            setRowCount(0);
        } else {
            const resolvedData = [...dataList, ...result.data];
            const recCount = result.done ? resolvedData.length : resolvedData.length + 1;
            setDataList(resolvedData);
            setRowCount(recCount);
        }
        setLoading(false);
    }, [dataList, setLoading, setRowCount, searchText, fetchNext]);

    const onItemClick = React.useCallback((item) => {
        onItemSelected && onItemSelected(item);
        setData();
    }, [setData, onItemSelected]);

    const handleKeydown = (evt: any) => {
        if (rowCount > 0) {
            const key = evt.key;
            const scrollDiv = document.querySelector('.ReactVirtualized__Grid');
            if (key === "ArrowDown") {
                const index = selectedIndex + 1;
                if (index < rowCount) {
                    setSelectedindex(index);
                    const rowItem = scrollDiv?.querySelector(`#searchItem-${index}`);
                    const insideView = isInView(scrollDiv!, rowItem!);
                    console.info('Is Inside 1 : ', insideView);
                    !insideView && scrollDiv!.scrollBy({ top: rowHeight });
                }
            } else if (key === "ArrowUp") {
                const index = selectedIndex - 1;
                if (index >= 0) {
                    setSelectedindex(index);
                    const rowItem = scrollDiv?.querySelector(`#searchItem-${index}`);
                    const insideView = isInView(scrollDiv!, rowItem!);
                    console.info('Is Inside 2 : ', insideView);
                    !insideView && scrollDiv!.scrollBy({ top: -rowHeight });
                }
            } else if (key === "Escape") {
                setData();
            } else if (key === "Enter") {
                if (onItemSelected && selectedIndex >= 0) {
                    onItemSelected(dataList[selectedIndex]);
                    setData();
                }
            }
        }
        console.log(evt.key);
    };
    const handleBlur = (evt: any) => {
        setTimeout(()=> {
            inputRef.current!.value = value ? itemToString ? itemToString(value) : value : '';
            // setData();
        }, 200);
    }


    return <div className='d-flex justify-content-center mt-3'>
        <div style={{ width: 200 }} className="d-flex pos-rel">
            <input ref={inputRef} style={{ width: '100%', backgroundColor: error ? 'red' : '' }}
                title={error}
                onKeyDown={handleKeydown}
                onBlur={handleBlur}
            />
            {loading && <div style={{ position: 'absolute', right: 0 }}>Loading...</div>}
            {rowCount > 0 && <div className='layer' style={{ width: resultWidth || 'auto', height: resultHeight || 200 }} ref={resultElemRef}>
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
                                            return <RowItemRenderer selected={selectedIndex === props.index} key={props.key} style={props.style} listRowProps={props} item={dataList[props.index]} onClick={onItemClick} />
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