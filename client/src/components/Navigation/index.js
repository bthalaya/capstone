import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, Button, Drawer, ListItemIcon, List, ListItem, ListItemText, IconButton, Toolbar, Divider } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';  // Add this line
import FileCopyIcon from '@mui/icons-material/FileCopy';  // Add this line
import DashboardIcon from '@mui/icons-material/Dashboard';  // Add this line
import HelpIcon from '@mui/icons-material/Help';  // Add this line
import ApiIcon from '@mui/icons-material/Api';  // Add this line
import InfoIcon from '@mui/icons-material/Info';  // Add this line
import { Notifications, Settings, AccountCircle, Menu } from "@mui/icons-material";
import "./Navbar.css";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Typography } from '@mui/material';

const theme = createTheme({
  typography: {
    h1: {
      fontFamily: '"Lato", sans-serif',  // Use your desired font here
      fontWeight: 700,  // Customize font weight
      fontSize: '2.5rem',  // Customize font size
    },
    h2: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 500,
      fontSize: '2rem',
    },
    // You can add more headers (h3, h4, etc.) here if needed
  },
});

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle the drawer open and closed
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  // Navigation links and their icons
  const navItems = [
    { name: 'Home', to: '/', icon: <HomeIcon /> },
    { name: 'Manage Files', to: '/managefiles', icon: <FileCopyIcon /> },
    { name: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Help', to: '/help', icon: <HelpIcon /> },
    { name: 'API Test', to: '/APITest', icon: <ApiIcon /> },
    { name: 'About', to: '/about', icon: <InfoIcon /> }
  ];

  // Drawer content (links inside the drawer)
  const list = () => (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
      style={{ width: 250 }}
    >
      {/* Logo at the top */}
      <div className="navbar-logo">
        <img 
          src={"/ecoscan.jpg"} 
          alt="Ecoscan Logo" 
          style={{ height: 60, width: 'auto', display: 'block', margin: '0 auto' }} // Adjust size and center
        />
      </div>

      <List>
        {navItems.map((item) => (
          <ListItem button key={item.name} component={Link} to={item.to}>
            <ListItemIcon>{item.icon}</ListItemIcon> {/* Display the icon */}
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
    </div>
  );

  return (
    
    <div>
      {/* Top Navbar */}
      <AppBar position="sticky" style={{ backgroundColor: "white" }}>
        <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
          {/* Menu icon button to toggle the Drawer */}
          <IconButton
            onClick={toggleDrawer(true)}
            edge="start"
            className="menu-icon"
            style={{ color: "#004d00" }}
          >
            <MenuIcon />
          </IconButton>

          {/* Right-aligned icons (Notification, Settings, Profile) */}
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
        </Toolbar>
      </AppBar>

      {/* The Drawer that slides in and out */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
      >
        {list()}
      </Drawer>
    </div>
  );
};

export default Navigation;