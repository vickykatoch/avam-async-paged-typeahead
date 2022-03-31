import React from 'react';
import './App.scss';
import { AmpsConnectionScratchPad } from './domain/scratch-pad';


function App() {

  return (
    <div className="d-flex flex-grow-1 flex-column">
      <AmpsConnectionScratchPad />
    </div>
  );
}

export default App;
