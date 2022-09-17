import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import { Main, ActualApp, Sing } from './pages'

export const App: React.FC = () => {
  
  return (
    <Router>
      <Switch>
        <Route path="/app">
          <ActualApp/>
        </Route>
        <Route path="/sing">
          <Sing/>
        </Route>
        <Route path="/">
          <Main/>
        </Route>
        
      </Switch>
    </Router>
  )
};

export default App;
