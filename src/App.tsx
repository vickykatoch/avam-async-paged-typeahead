import React, { useEffect } from 'react';
import './App.scss';
import { AsyncPagedTypeahead } from './common/components';
import RowRenderer from './common/row-renderer';
import { AmpsConnectionScratchPad } from './domain/scratch-pad';


function App() {
  const [item, setItem] = React.useState<any>();

  return (
    <div className="d-flex flex-grow-1 flex-column">
      {/* <AsyncPagedTypeahead value={item} fetchNext={dataLoader} 
      itemToString={item=> item.fullName}
      onItemSelected={setItem}
      scrollThreshold={15} RowItemRenderer={RowRenderer} rowHeight={20} minChars={3} resultWidth={400}/> */}
      <AmpsConnectionScratchPad />
    </div>
  );
}

export default App;
