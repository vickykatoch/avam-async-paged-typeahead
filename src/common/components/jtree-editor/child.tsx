import React, { FC } from 'react';



interface ChildProps {
    data: any;
    onChildClick: (data: any) => void;
    CustomChild?: React.FC;
}


export const Child: FC<ChildProps> = ({ CustomChild, data, onChildClick }) => {
    return (
        <div onClick={() => onChildClick(data)}>
            {CustomChild ? <CustomChild {...data} /> :
                <div className="tree-child-component">
                    {data.name}
                </div>}
        </div>
    );
};
