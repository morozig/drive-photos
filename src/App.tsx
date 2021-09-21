import React from 'react';
import Home from './containers/home';
import View from './containers/view';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path='/view'>
          <View />
        </Route>
        <Route path='/'>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
