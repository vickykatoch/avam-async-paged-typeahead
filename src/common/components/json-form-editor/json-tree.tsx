import { FC } from 'react';
import { Leaf } from './leaf';
import { EntryType, IJsonTreeNode } from './models';
import { Parent } from './parent';

interface JsonTreeProps {
    defaultOpen: boolean;
    nodes: Array<IJsonTreeNode>;
    customParent?: React.FC;
    customChild?: React.FC;
    editName?:boolean;
    editValue?: boolean;
}

export const JsonTree: FC<JsonTreeProps> = (props) => {
    if (!props.nodes.length) return <p></p>;

    return (
        <>
            {props.nodes.map((node, index) => {
                if (![EntryType.Primitive, EntryType.PrimitiveArray].includes(node.type)) {
                    return <Parent {...props} node={node} key={node.id}  />;
                } else {
                    return <Leaf node={node} key={node.id} customChild={props.customChild} editName={props.editName} editValue={props.editValue}/>;
                }
            })}
        </>
    );
};
