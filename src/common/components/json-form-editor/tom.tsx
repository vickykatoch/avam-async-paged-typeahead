import React, { FC } from 'react';
import { JsonTree } from './json-tree';
import { EntryType, IJsonTreeNode } from './models';

interface TopProps {
    node: IJsonTreeNode;
    parentComponent?: React.FC;
    childComponent?: React.FC;
    onExpandToggle?: (node: IJsonTreeNode) => void;
}

// Tom is expandable/collapsible (Parent) component
export const Tom: FC<TopProps> = ({ node, parentComponent, childComponent, onExpandToggle }) => {
    return (
        <div className='d-flex flex-column' style={{marginLeft: '1em'}}>
            <strong>{node.name}</strong>
            {node.expanded && <JsonTree nodes={node.value as Array<IJsonTreeNode>}/>}
        </div>
    );
};
