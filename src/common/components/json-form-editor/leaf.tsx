import React, { FC, useState } from 'react';
import { EntryType, IJsonTreeNode } from './models';
import './leaf.css';

interface LeafProps {
    node: IJsonTreeNode;
    customChild?: React.FC;
    editName?: boolean;
    editValue?: boolean;
    isLast?: boolean;
}
interface IState {
    name: string;
    value: string;
}
export const Leaf: FC<LeafProps> = ({ node, editName, editValue }) => {
    const [state, setState] = useState<IState>({name: node.name || '', value: node.value as string || ''})

    const updateState = (propName: 'name' | 'value', propValue:any)=> {
        setState({...state,[propName]:propValue});
        if(node.type === EntryType.PrimitiveArray && propName==='value') {
            node[propName]= propValue.split(',');
        } else {
            node[propName]=propValue;
        }
    };

    return (
        <div className="d-flex flex-shrink-0 leaf">
            <div className="d-flex name flex-shrink-0">
                {editName ? <input value={state.name} style={{width:'100%'}} onChange={({target}:any)=>updateState('name', target.value)}/> : <span>{state.name}</span>}
            </div>
            <div className="d-flex flex-grow-1 value">
                {editValue ? <input value={state.value} style={{width:'100%'}} onChange={({target}:any)=>updateState('value', target.value)}/> : <span>{state.value}</span>}
            </div>
        </div>
    );
};
