import React from 'react';
import './App.scss';
import { AsyncPagedTypeahead, SuperListInfinite } from './common/components';

function App() {
  return (
    <div className="App">
      <AsyncPagedTypeahead />
      <SuperListInfinite batchSize={100} isLoadMoreCacheReset={true} scrollThreshold={60}/>
    </div>
  );
}

export default App;
