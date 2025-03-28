import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
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
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HelpIcon from "@mui/icons-material/Help";
import ApiIcon from "@mui/icons-material/Api";
import InfoIcon from "@mui/icons-material/Info";
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Icon for sign out
import { setUsernameGlobal } from "../../actions/user"; // Ensure this is the correct path to your action
import "./Navbar.css"; // Ensure your CSS path is correct

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
  };

  const signOut = () => {
    dispatch(setUsernameGlobal("")); // Clear username from global state
    localStorage.removeItem("userNameGlobal"); // Clear local storage if used
    history.push("/signin"); // Redirect to sign-in page
  };

  const navItems = [
    { name: "Home", to: "/", icon: <HomeIcon /> },
    { name: "Manage Files", to: "/managefiles", icon: <FileCopyIcon /> },
    { name: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
    { name: "Help", to: "/help", icon: <HelpIcon /> },
    { name: "API Test", to: "/APITest", icon: <ApiIcon /> },
    { name: "About", to: "/about", icon: <InfoIcon /> },
    { name: "Sign Out", to: "#", icon: <ExitToAppIcon />, action: signOut }, // Add Sign Out to the list
  ];

  return (
    <AppBar position="sticky" style={{ backgroundColor: "#FFF" }}>
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          onClick={toggleDrawer(true)}
          edge="start"
          className="menu-icon"
          style={{ color: "#004d00" }}
        >
          <MenuIcon />
        </IconButton>

        <div style={{ flexGrow: 1 }}>
          <img
            src="/ecoscan.jpg"
            alt="Logo"
            style={{ height: "50px", marginLeft: "20px" }}
          />
        </div>

        <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
          <div
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
            style={{ width: 250 }}
          >
            <div className="navbar-logo">
              <img
                src="/ecoscan.jpg" // Ensure the path to your logo is correct
                alt="Ecoscan Logo"
                style={{
                  height: 60,
                  width: "auto",
                  display: "block",
                  margin: "0 auto",
                  padding: "10px 0",
                }} // Adjust size and centering as needed
              />
            </div>
            <List>
              {navItems.map((item) => (
                <ListItem
                  button
                  key={item.name}
                  component={Link}
                  to={item.to}
                  onClick={item.action}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
            </List>
            <Divider />
          </div>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
