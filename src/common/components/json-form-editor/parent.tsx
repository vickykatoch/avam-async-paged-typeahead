import React, { FC, useState } from 'react';
import { JsonTree } from './json-tree';
import { EntryType, IJsonTreeNode } from './models';

interface TopProps {
    open?:boolean;
    node: IJsonTreeNode;
    parentComponent?: React.FC;
    childComponent?: React.FC;
    onExpandToggle?: (node: IJsonTreeNode) => void;
}


export const Tom: FC<TopProps> = ({open, node, parentComponent, childComponent, onExpandToggle }) => {
    const [isOpen, setIsOpen] = useState<boolean>(open ?? false);
    debugger;
    return (
        <div className='d-flex flex-column' style={{marginLeft: '1em'}}>
            <strong onClick={()=> {
               
                setIsOpen(!isOpen);
                onExpandToggle && onExpandToggle(node);
            }}>{isOpen ? '-' : '+'}{node.name}</strong>
            {isOpen && <JsonTree nodes={node.value as Array<IJsonTreeNode>} open={isOpen}/>}
        </div>
    );
};
