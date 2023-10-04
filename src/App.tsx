import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import { Main, ActualApp, Sing } from './pages'
import { DataContext, data as dataInit } from './utils/context'
import { serverUrl } from './utils/constants';

export const App: React.FC = () => {
  const [data, setData] = useState(dataInit)

  return (
    <DataContext.Provider value={data}>
      <Router>
        <Switch>
          <Route path="/app">
            <ActualApp setData={setData}/>
          </Route>
          <Route path="/sing">
            <Sing setData={setData}/>
          </Route>
          <Route path="/">
            <Main/>
          </Route>
          
        </Switch>
      </Router>
    </DataContext.Provider>
  )
};

export default App;
