//#region IMPORTS
import React, { FC, useEffect, useState } from 'react';
import { fromJson } from './helpers';
import { JsonTree } from './json-tree';
import {  IJsonTreeNode } from './models';
//#endregion

//#region MODULE TYPES/FUNCS
interface JsonFormEditorProps {
    defaultOpen?: boolean;
    parentComponent?: React.FC;
    childComponent?: React.FC;
    data: Array<any>;
    onExpandToggle: (node: IJsonTreeNode) => void;
}
interface IState {
    defaultOpen: boolean;
    nodes: Array<IJsonTreeNode>;
}
//#endregion

export const JsonFormEditor: FC<JsonFormEditorProps> = ({ defaultOpen, data }) => {
    const [state, setState] = useState<IState>({ defaultOpen: false, nodes: [] });

    useEffect(() => {
        setState({ defaultOpen: defaultOpen ?? false, nodes: fromJson(data || []) });
    }, [data, setState, defaultOpen]);

    if(!state.nodes.length) return <p></p>;

    return <JsonTree {...state}/>;
};
