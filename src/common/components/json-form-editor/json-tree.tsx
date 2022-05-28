import { FC } from 'react';
import { Harry } from './harry';
import { EntryType, IJsonTreeNode } from './models';
import { Tom } from './tom';

interface JsonTreeProps {
    open?: boolean;
    nodes: Array<IJsonTreeNode>;
}

export const JsonTree: FC<JsonTreeProps> = ({ nodes }) => {
    if (!nodes.length) return <p></p>;

    return (
        <>
            {nodes.map((node) => {
                if (![EntryType.Primitive, EntryType.PrimitiveArray].includes(node.type)) {
                    return <Tom node={node} key={node.id} />;
                } else {
                    return <Harry node={node} key={node.id} />;
                }
            })}
        </>
    );
};
