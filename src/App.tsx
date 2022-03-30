import React, { useEffect } from 'react';
import './App.scss';
import { AsyncPagedTypeahead } from './common/components';
import { fetchAmpsData } from './common/data';
import RowRenderer from './common/row-renderer';

const dataLoader = fetchAmpsData(20);

function App() {
  useEffect(()=> {
    fetchAmpsData(50);
  },[]);
  return (
    <div className="App">
      <AsyncPagedTypeahead fetchNext={dataLoader} scrollThreshold={15} RowItemRenderer={RowRenderer} rowHeight={20} minChars={3} resultWidth={400}/>
    </div>
  );
}

export default App;
