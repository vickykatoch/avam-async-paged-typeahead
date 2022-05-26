import React, { FC, useState } from 'react';
import JsonTree from './json-tree-editor';



interface ParentProps {
    data: any;
    readonly?: boolean;
    parentComponent?: React.FC,
    childComponent?: React.FC,
    noLeftMargin?: boolean;
    isDefaultOpen?: boolean;
    onChildClick: (data: any) => void;
}


export const Parent: FC<ParentProps> = (props) => {
    const { parentComponent: CustomParent, data, isDefaultOpen } = props;
    const [open, toggleOpen] = useState<boolean>(isDefaultOpen ? true : false);
    return <>
        <div onClick={() => toggleOpen(!open)}>
            {CustomParent ?
                <CustomParent {...data} open={open} /> :
                <div className="tree-parent-component">
                    <span >{open ? '-' : '+'}</span>
                    <span>{data.name}</span>
                </div>}
        </div>
        {open && <JsonTree {...props} data={data.child} />}
    </>
};
