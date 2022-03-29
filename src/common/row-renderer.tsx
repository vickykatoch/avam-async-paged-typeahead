import React from 'react';


const RowRenderer: React.FC<any> = (props)=> {
    // return <div key={props.item.id} style={props.style}>Row : {props.index}</div>
    return <div key={props.item.id} style={props.style}><pre>{props.item.fullName} - {props.item.sex}</pre></div>
}
export default RowRenderer;
