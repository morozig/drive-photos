import React from 'react';
import Home from './containers/home';
import Main from './containers/main';
import { useHadSignedIn } from './lib/hooks';

const App: React.FC = () => {
  const hadSignedIn = useHadSignedIn();

  return (
    hadSignedIn ?
      <Main/> :
      <Home/>
  );
}

export default App;
