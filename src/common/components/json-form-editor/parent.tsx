import React, { FC, useState } from 'react';
import { JsonTree } from './json-tree';
import {  IJsonTreeNode } from './models';
import './parent.css';

interface ParentProps {
    defaultOpen: boolean;
    node: IJsonTreeNode;
    customParent?: React.FC;
    customChild?: React.FC;
    editName?: boolean;
    editValue?: boolean;
}

export const Parent: FC<ParentProps> = (props) => {
    const { defaultOpen, node, customParent } = props;
    const [open, setOpen] = useState<boolean>(defaultOpen);
    
    return (
        <div className="d-flex flex-column parent" style={{ marginLeft: '1em' }}>
            <div className="d-flex flex-shrink-0">
                <strong className="flex-shrink-0 expCollapse" onClick={() => setOpen(!open)}>
                    {open ? '-' : '+'}
                </strong>
                <span className="flex-grow-1">{node.name}</span>
                {/* <span className="d-flex flex-shrink-0">
                    <strong className="expCollapse mx-1" title="Add node" >
                        +
                    </strong>
                    <strong className="expCollapse" title="Delete node">
                        -
                    </strong>
                </span> */}
            </div>
            {open && <JsonTree {...props} nodes={node.value as Array<IJsonTreeNode>} defaultOpen={defaultOpen} />}
        </div>
    );
};
