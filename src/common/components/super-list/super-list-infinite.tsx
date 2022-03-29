// import faker from 'faker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { AutoSizer, IndexRange, InfiniteLoader, List, ListRowProps } from 'react-virtualized';
// import wait from 'waait';
// import { SuperProps } from './super-props';
// import faker from 'faker';
import faker, { GenderType } from '@faker-js/faker';

const wait = (n: number) => new Promise(resolve => setTimeout(resolve, n));

export interface SuperListProps {
    /**
     * Minimum number of rows to be loaded at a time. This property can be used to batch requests to reduce HTTP
     * requests. Defaults to 10.
     */
    batchSize?: number,
    /**
     * Threshold at which to pre-fetch data. A threshold X means that data will start loading when a user scrolls
     * within X rows. Defaults to 15.
     */
    scrollThreshold?: number,
    /**
     * Reset any cached data about already-loaded rows. This method should be called if any/all loaded data needs to be
     * re-fetched (eg a filtered list where the search criteria changes).
     */
    isLoadMoreCacheReset?: boolean,
}

const SuperListInfinite = (props: SuperListProps) => {
    const [list, setList] = useState<any[]>([]);
    const [count, setCount] = useState<number>(1);
    const [rowCount, setRowCount] = useState<number>(1);

    // memorizes the next value unless the list or count changes.
    const hasNext = useMemo<boolean>(() => {
        return count > list.length;
    }, [count, list]);

    /**
     * Is The Row loaded
     *
     * This function is responsible for tracking the loaded state of each row.
     *
     * We chose Boolean() instead of !!list[index] because it's more performant AND clear.
     * See: https://jsperf.com/boolean-conversion-speed
     */
    const isRowLoaded = useCallback(({ index }) => {
        return Boolean(list[index]);
    }, [list]);

    /**
     * Load More Rows Implementation
     *
     * Callback to be invoked when more rows must be loaded. It should implement the following signature:
     * ({ startIndex: number, stopIndex: number }): Promise. The returned Promise should be resolved once row data has
     * finished loading. It will be used to determine when to refresh the list with the newly-loaded data. This
     * callback
     * may be called multiple times in reaction to a single scroll event.
     *
     * We wrap it in useCallback because we don't want the method signature to change from render-to-render unless one
     * of the dependencies changes.
     */
    const loadMoreRows = useCallback(({ startIndex, stopIndex }: IndexRange): Promise<any> => {
        const batchSize = stopIndex - startIndex;
        const offset = stopIndex;

        if (batchSize !== 0 || offset !== 0) {
            return new Promise<any>((resolve) => {
                wait(500).then(() => {
                    const newList: any[] = [];
                    for (let i = offset; i < batchSize; i++) {
                        const maleFemale: GenderType = i % 2 === 0 ? 0 : 1;
                        newList.push({
                            id: i + 1,
                            name: `${faker.name.firstName(maleFemale)} ${faker.name.lastName(maleFemale)}`,
                            title: faker.name.title().toString(),
                            date: faker.date.past().toDateString(),
                            version: faker.random.uuid().toString(),
                            color: faker.commerce.color(),
                        });
                    }
                    const newLists = list.concat(newList.filter((newItem) => {
                        return list.findIndex((item) => item.id === newItem.id) === -1;
                    }));

                    // If there are more items to be loaded then add an extra row to hold a loading indicator.
                    setRowCount(hasNext
                        ? newLists.length + 1
                        : newLists.length);
                    setList(newLists);

                    resolve({});
                });
            });
        } else {
            return Promise.resolve();
        }
    }, [list, hasNext, setList, setRowCount]);

    /** Responsible for rendering a single row, given its index. */
    const rowRenderer = useCallback(({ key, index, style }: ListRowProps) => {
        if (!isRowLoaded({ index })) {
            return (
                <Row key={key} style={style}>
                    <Col xs={12}><span className="text-muted">Loading...</span></Col>
                </Row>
            );
        } else {
            return (
                <Row key={key} style={style}>
                    <Col xs={1}><strong>Id</strong>: {list[index].id}</Col>
                    <Col xs={2}><strong>Name</strong>: {list[index].name}</Col>
                    <Col xs={2}><strong>Title</strong>: {list[index].title}</Col>
                    <Col xs={2}><strong>Updated</strong>: {list[index].date}</Col>
                    <Col xs={2}><strong>Version</strong>: {list[index].version}</Col>
                    <Col xs={3}><strong>Color</strong>: {list[index].color}</Col>
                </Row>
            );
        }
    }, [list, isRowLoaded]);

    /** This effect will run on mount, and again only if the batch size changes. */
    useEffect(() => {
        wait(500).then(() => {
            const newList: any[] = [];
            console.log('FETCHING NEXT BATCH');
            let batchSize: number;
            if (props.batchSize !== undefined) {
                batchSize = props.batchSize;
            } else {
                batchSize = 50;
            }

            for (let i = 0; i < batchSize; i++) {
                const maleFemale: GenderType = i % 2 === 0 ? 0 : 1;
                newList.push({
                    id: i + 1,
                    name: `${faker.name.firstName(maleFemale)} ${faker.name.lastName(maleFemale)}`,
                    title: faker.name.title().toString(),
                    date: faker.date.past().toDateString(),
                    version: faker.random.uuid().toString(),
                    color: faker.commerce.color(),
                });
            }

            setList(newList);
            setCount(p => p + batchSize);
        });
    }, [props.batchSize, hasNext]);

    /** If there are more items to be loaded then add an extra row to hold a loading indicator. */
    useEffect(() => {
        setRowCount(hasNext
            ? list.length + 1
            : list.length);
    }, [hasNext, list, setRowCount]);

    return (
        <InfiniteLoader
            threshold={props.scrollThreshold}
            isRowLoaded={isRowLoaded}
            loadMoreRows={loadMoreRows}
            rowCount={count}
        >
            {({ onRowsRendered, registerChild }) => (
                <AutoSizer disableHeight>
                    {({ width }) => (
                        <List
                            height={500}
                            onRowsRendered={onRowsRendered}
                            ref={registerChild}
                            rowCount={rowCount}
                            rowHeight={100}
                            rowRenderer={rowRenderer}
                            width={width}
                        />
                    )}
                </AutoSizer>
            )}
        </InfiniteLoader>
    );
};

export default SuperListInfinite;