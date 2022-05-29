//#region IMPORTS
import { omit } from 'ramda';
import React, { FC, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { fromJson, toJson } from './helpers';
import { JsonTree } from './json-tree';
import { IJsonTreeNode } from './models';
//#endregion

//#region MODULE TYPES/FUNCS
interface JsonFormEditorProps {
    defaultOpen?: boolean;
    customParent?: React.FC;
    customChild?: React.FC;
    data: Array<any>;
    editName?:boolean;
    editValue?: boolean;
    ref:any;
    // onExpandToggle: (node: IJsonTreeNode) => void;
}
interface IState {
    defaultOpen: boolean;
    nodes: Array<IJsonTreeNode>;
    customParent?: React.FC;
    customChild?: React.FC;
    editName?:boolean;
    editValue?: boolean;
    // onExpandToggle: (node: IJsonTreeNode) => void;
}
//#endregion

export const JsonFormEditor: FC<JsonFormEditorProps> = forwardRef((props,ref) => {
    const [state, setState] = useState<IState>();
    

    useEffect(() => {
        setState({
            ...omit(['data'], props),
            defaultOpen: props.defaultOpen ?? false,            
            nodes: fromJson(props.data || []),
        });
    }, [props, setState]);

    useImperativeHandle(ref,()=>({
        getJson: ()=>  toJson(state!.nodes)
    }));

    if (!state) return <p></p>;

    return <JsonTree {...state} />;
});
