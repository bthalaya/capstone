import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import Home from "../Home";
import Landing from "../Landing";
import history from "./history";
import SignIn from "../SignIn";
import SignUp from "../SignUp";
import ManageFiles from "../ManageFiles";

export default function PrivateRoute({ authenticated, ...rest }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/landing" exact component={Landing} />
        <Route path="/SignIn" exact component={SignIn} />
        <Route path="/managefiles" exact component={ManageFiles} />
        <Route path="/SignUp" exact component={SignUp} />
      </Switch>
    </Router>
  );
}
