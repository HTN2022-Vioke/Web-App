import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import { Main, ActualApp, Sing } from './pages'
import { LrcContext, lrc as lrcInit } from './utils/context'

export const App: React.FC = () => {
  const [lrc, setLrc] = useState('')
  
  return (
    <LrcContext.Provider value={lrc}>
      <Router>
        <Switch>
          <Route path="/app">
            <ActualApp setLrc={setLrc}/>
          </Route>
          <Route path="/sing">
            <Sing/>
          </Route>
          <Route path="/">
            <Main/>
          </Route>
          
        </Switch>
      </Router>
    </LrcContext.Provider>
  )
};

export default App;
