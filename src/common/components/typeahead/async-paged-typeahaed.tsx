import React from 'react';
import {} from 'react-virtualized';


interface AsyncPagedTypeaheadProps {

}

const AsyncPagedTypeahead: React.FC<AsyncPagedTypeaheadProps> = ({ }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return <div>
        <input ref={inputRef}/>
    </div>
};

export default AsyncPagedTypeahead;