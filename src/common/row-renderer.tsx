import React from 'react';
import { ListRowProps } from 'react-virtualized';

interface RowRendererProps {
    selected: boolean;
    listRowProps: ListRowProps;
    item: any;
    style: React.CSSProperties;
    onClick: (item: any) => void;
}

const RowRenderer: React.FC<RowRendererProps> = ({ selected, listRowProps, item, style, onClick }) => {
    const newStyle = { ...style, width: 'auto', borderBottom: '1px solid #bfbdbd' };
    const elemRef = React.useRef<HTMLDivElement>(null);

    return <div key={listRowProps.key} style={newStyle} className={selected ? 'selected' : ''} ref={elemRef} id={`searchItem-${listRowProps.index}`}>
        <pre className='px-1 hover' onClick={() => onClick(item)}>[{listRowProps.index}]: {item.fullName} - {item.sex} {item.title}</pre>
    </div>
}
export default RowRenderer;
