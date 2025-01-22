import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Home from '../Home';
import ManageFiles from '../ManageFiles';
import Dashboard from '../Dashboard';
import Navigation from '../Navigation';
import Help from '../Help';
import APITest from '../APITest';
import About from '../About';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  componentDidMount() {
    this.listener = () => {
      console.log('Listener active');
    };
  
    // Simulating adding an event listener
    document.addEventListener('click', this.listener);
  }
  
  componentWillUnmount() {
    // Ensure the listener is removed if it's set
    if (this.listener) {
      document.removeEventListener('click', this.listener);
    }
  }

  render() {
    return (
      <Router>
        <div>
          <Navigation />
          <Route exact path="/" component={Home} />
          <Route path="/managefiles" component={ManageFiles} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/help" component={Help} />
          <Route path="/APITest" component={APITest} />
          <Route path="/about" component={About} />
        </div>
      </Router>
    );
  }
}

export default App;

