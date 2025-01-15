import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import Home from '../Home';
import Landing from '../Landing'
import history from './history';

export default function PrivateRoute({
  //authenticated,
  //...rest
}) {
  return (

    <Router history={history}>
      <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/landing" exact component={Landing} />
      </Switch>
    </Router>
  );
}