import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button } from "@mui/material";
import "./Navbar.css";

const Navigation = () => {
  return (
    <AppBar position="static" style={{ backgroundColor: "#558B2F" }}>
      <Toolbar>
        {/* Navigation Links */}
        <Button
          color="inherit"
          component={Link}
          to="/"
          sx={{
            '&:hover': {
              backgroundColor: '#7F9E50',
            },
          }}
        >
          Home
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/managefiles"
          sx={{
            '&:hover': {
              backgroundColor: '#7F9E50',
            },
          }}
        >
          Manage Files
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/dashboard"
          sx={{
            '&:hover': {
              backgroundColor: '#7F9E50',
            },
          }}
        >
          Dashboard
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/help"
          sx={{
            '&:hover': {
              backgroundColor: '#7F9E50',
            },
          }}
        >
          Help
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/APITest"
          sx={{
            '&:hover': {
              backgroundColor: '#7F9E50',
            },
          }}
        >
          API Test
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/about"
          sx={{
            '&:hover': {
              backgroundColor: '#7F9E50',
            },
          }}
        >
          About
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

