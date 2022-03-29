import React, { useEffect } from 'react';
import './App.scss';
import { AsyncPagedTypeahead } from './common/components';
import { fetchAmpsData } from './common/data';
import RowRenderer from './common/row-renderer';

const dataLoader = fetchAmpsData(20);
const getRowRender = (props: any) => <RowRenderer {... props} />;
function App() {
  useEffect(()=> {
    fetchAmpsData(50);
  },[]);
  return (
    <div className="App">
      <AsyncPagedTypeahead fetchNext={dataLoader} scrollThreshold={15} rowRenderer={getRowRender} rowHeight={25} minChars={3}/>
    </div>
  );
}

export default App;
