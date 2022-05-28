import React, { FC } from 'react';
import { IJsonTreeNode } from './models';


interface HarryProps {
    node: IJsonTreeNode;
}

// Harry is expandable/collapsible (Parent) component 
export const Harry: FC<HarryProps> = ({node}) => {
    return <span style={{border: '1px solid',marginLeft: '1em'}}>{node.name} : {node.value}</span>
};