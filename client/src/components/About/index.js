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

const About = () => {
  return (
    <div>
      <h1>About</h1>
    </div>
  );
}

export default About;