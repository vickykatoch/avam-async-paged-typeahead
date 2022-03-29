import React from 'react';


const RowRenderer: React.FC<any> = (props)=> {
    return <div key={props.item.id} style={props.style}>Row : {props.index}</div>
}
export default RowRenderer;
