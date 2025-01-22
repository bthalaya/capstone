import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, TextField, FormHelperText, Grid, FormLabel } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const serverURL = "http://localhost:5000"; // Your server URL

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: "#ffffff"
    },
    primary: {
      main: '#ef9a9a',
    },
  },
});

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard! Here’s where you can manage your data and see insights.</p>
    </div>
  );
}

export default Dashboard;