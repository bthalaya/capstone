import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#9BBB70', padding: '0.5rem 0' }}>
      <Toolbar>
        {/* App Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          EcoScan
        </Typography>

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
