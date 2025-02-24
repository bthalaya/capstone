import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Button,
  Drawer,
  ListItemIcon,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Toolbar,
  Divider
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpIcon from '@mui/icons-material/Help';
import ApiIcon from '@mui/icons-material/Api';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { Notifications, Settings, AccountCircle } from "@mui/icons-material";
import "./Navbar.css";  // Ensure your CSS path is correct

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const isHomePage = location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/signin';

  // Navigation items including icons for drawer
  const navItems = [
    { name: 'Home', to: '/', icon: <HomeIcon /> },
    { name: 'Manage Files', to: '/managefiles', icon: <FileCopyIcon /> },
    { name: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Help', to: '/help', icon: <HelpIcon /> },
    { name: 'API Test', to: '/APITest', icon: <ApiIcon /> },
    { name: 'About', to: '/about', icon: <InfoIcon /> },
  ];

  return (
    <AppBar position="sticky" style={{ backgroundColor: isHomePage ? "transparent" : "white" }}>
      <Toolbar style={{ display: "flex", justifyContent: isHomePage ? "flex-end" : "space-between" }}>
      {isHomePage && (
          <div style={{ flexGrow: 1 }}>
            <img src="/ecoscan.jpg" alt="Logo" style={{ height: '50px', marginLeft: '20px' }} />
          </div>
        )}
        {!isHomePage && (
          <IconButton
            onClick={toggleDrawer(true)}
            edge="start"
            className="menu-icon"
            style={{ color: "#004d00" }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {isHomePage ? (
          <>
            <Button color="inherit" component={Link} to="/signin" style={{ color: "#004d00" }}>Sign In</Button>
            <Button color="inherit" component={Link} to="/signup" style={{ color: "#004d00" }}>Register</Button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton style={{ color: "#004d00", marginRight: "1rem" }}>
              <Notifications />
            </IconButton>
            <IconButton style={{ color: "#004d00", marginRight: "1rem" }}>
              <Settings />
            </IconButton>
            <IconButton style={{ color: "#004d00" }}>
              <AccountCircle />
            </IconButton>
          </div>
        )}
      </Toolbar>
      
      {!isHomePage && (
        <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
      >
        <div
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          style={{ width: 250 }}
        >
          <div className="navbar-logo">
            <img 
              src={"/ecoscan.jpg"} // Ensure the path to your logo is correct
              alt="Ecoscan Logo" 
              style={{ height: 60, width: 'auto', display: 'block', margin: '0 auto', padding: '10px 0' }} // Adjust size and centering as needed
            />
          </div>
            <List>
              {navItems.map((item) => (
                <ListItem button key={item.name} component={Link} to={item.to}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
            </List>
            <Divider />
          </div>
        </Drawer>
      )}
    </AppBar>
  );
};

export default Navigation;
