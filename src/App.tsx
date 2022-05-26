import React from 'react';
import './App.scss';
import { AmpsConnectionScratchPad } from './domain/scratch-pad';


function App() {

  return (
    <div className="d-flex flex-grow-1 flex-column " style={{marginTop: 200}}>
      <AmpsConnectionScratchPad />
    </div>
  );
}

export default App;
