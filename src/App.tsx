import React from 'react';
import Main from './pages/main';

export enum FitMode {
  Best = 1,
  Width,
  Height,
  Original
}

const App: React.FC = () => {
  return (
    <Main/>
  );
}

export default App;
