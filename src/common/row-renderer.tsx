import React from 'react';
import { ListRowProps } from 'react-virtualized';

interface RowRendererProps {
    listRowProps: ListRowProps;
    item: any;
    style: React.CSSProperties;
    onClick: (item:any)=>void;
}

const RowRenderer: React.FC<RowRendererProps> = ({listRowProps,item,style,onClick})=> {
    const newStyle = {...style, width: 'auto', borderBottom: '1px solid #bfbdbd'};
    return <div key={item.id} style={newStyle}><pre className='hover' onClick={()=> onClick(item)}>{item.fullName} - {item.sex} {item.title}</pre></div>
}
export default RowRenderer;
