import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Home from "../Home";
import Landing from "../Landing";
import PrivateRoute from "../Navigation/PrivateRoute.js";
import Navigation from "../Navigation";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  componentDidMount() {
    //
  }

  componentWillUnmount() {
    this.listener();
  }

  render() {
    return (
      <Router>
        <div>
          <Navigation></Navigation>
          <Route exact path="/" component={Home} />
          <Route path="/landing" component={Landing} />
        </div>
      </Router>
    );
  }
}

export default App;
