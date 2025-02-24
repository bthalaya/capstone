import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  ThemeProvider
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const serverURL = "http://localhost:5000"; // Your server URL

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ef9a9a',
    },
    secondary: {
      main: '#9BBB70',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h3: {
      fontSize: '2.5rem', // Example size, adjust as needed
    },
    // Add other typography styles as needed
  },
});
//#0A5541'

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCY2m9iLW6ETIHvSOK97cEGSo2XztfGmCY",
  authDomain: "capstone-bca8d.firebaseapp.com",
  projectId: "capstone-bca8d",
  storageBucket: "capstone-bca8d.firebasestorage.app",
  messagingSenderId: "508859134976",
  appId: "1:508859134976:web:df989b9e6e64252a7ed4e5",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const Home = () => {
  return (
<ThemeProvider theme={lightTheme}>
  <Box sx={{
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '20px',
    backgroundColor: theme => theme.palette.background.default
  }}>
    {/* First Section */}
    <Grid container spacing={2} alignItems="center" justifyContent="space-between" style={{ maxWidth: '1200px', width: '100%', margin: 'auto' }}>
      <Grid item xs={12} md={6}>
        <Typography variant="h3" component="h1" gutterBottom align="left" style={{ textAlign: 'left', fontSize: '4.0rem' }}>
          Bridging Data and<br />
          Transparency in<br />
          <span style={{ color: lightTheme.palette.secondary.main }}>Fossil Fuel<br />Sustainability<br /> Reporting</span>
        </Typography>
        <Button
          variant="contained"
          style={{
            backgroundColor: '#0A5541', 
            color: 'white',
            fontSize: '1.5rem',
            padding: '12px 24px',
            textTransform: 'none'
          }}
          onClick={() => window.location.href = '/signup'}
        >
          Register
        </Button>
      </Grid>
      <Grid item xs={12} md={6}>
        <img src="/images/example.jpg" alt="Descriptive Alt Text" style={{ width: '100%', height: 'auto', maxWidth: '600px' }}/>
      </Grid>
    </Grid>
    
    {/* Second Section */}
    <Grid container spacing={2} direction="column" alignItems="center" style={{ marginTop: '100px', maxWidth: '1200px', width: '100%' }}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          European Fossil Fuel Companies We Cover
        </Typography>
        <Typography variant="body1" gutterBottom align="center">
          A need exists to assess the validity of European fossil fuel companies' sustainability commitments by developing an effective data extraction and analysis process to evaluate their financial pledges and actual investments in carbon emission reduction initiatives.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justifyContent="center">
          {/* First row of images */}
          {["bp.png", "cepsa.png", "eni.png", "eq.png", "omv.png"].map((image, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <img src={`/images/${image}`} alt={`Logo of ${image.split('.')[0]}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
            </Grid>
          ))}
          {/* Second row of images */}
          {["puma.png", "rep.png", "shell.png", "TE.png"].map((image, index) => (
            <Grid item xs={12} sm={6} md={3} key={index + 5} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <img src={`/images/${image}`} alt={`Logo of ${image.split('.')[0]}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>

  </Box>
</ThemeProvider>


  );
};

export default Home;
