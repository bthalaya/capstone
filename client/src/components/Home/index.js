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
    backgroundColor: '#F5F7FA'
  }}>
    {/* First Section */}
    <Grid container spacing={2} alignItems="center" justifyContent="space-between" style={{ maxWidth: '1200px', width: '100%', margin: 'auto' }}>
      <Grid item xs={12} md={6}>
        <Typography variant="h3" component="h1" gutterBottom align="left" style={{ textAlign: 'left', fontSize: '4.0rem', fontWeight: 'bold' }}>
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
        <img src="/images/example.png" alt="Descriptive Alt Text" style={{ width: '100%', height: 'auto', maxWidth: '500px' }}/>
      </Grid>
    </Grid>
    
    {/* Second Section */}
    <Grid container spacing={4} direction="column" alignItems="center" style={{ marginTop: '100px', maxWidth: '1200px', width: '100%' }}>
      {/* Text Section */}
      <Grid item xs={12}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          European Fossil Fuel Companies We Cover
        </Typography>
        <Typography variant="body1" gutterBottom align="center">
          A need exists to assess the validity of European fossil fuel companies' sustainability commitments by developing an effective data extraction and analysis process to evaluate their financial pledges and actual investments in carbon emission reduction initiatives.
        </Typography>
      </Grid>
      {/* Images Section */}
      <Grid item xs={12}>
        <Grid container spacing={5} justifyContent="center"> {/* Adjusted spacing for better alignment and visibility */}
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


      {/* Third Section */}
      <Grid container spacing={4} direction="column" alignItems="center" style={{ marginTop: '100px', maxWidth: '1200px', width: '100%' }}>
        {/* Text Section */}
        <Grid item xs={12}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Join us in creating a future where sustainability reporting is clear, reliable, and impactful.
          </Typography>
          <Typography variant="body1" gutterBottom align="center">
            Our Solution        
          </Typography>
        </Grid>
        {/* Images Section */}
        <Grid item xs={12}>
          <Grid container spacing={5} justifyContent="center">
            {["ai.png", "tableau.png", "react.png"].map((image, index) => (
              <Grid item xs={12} sm={4} key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <img src={`/images/${image}`} alt={`Logo of ${image.split('.')[0]}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>



      {/* Fourth Section */}

      <Grid container spacing={4} alignItems="center" style={{ marginTop: '100px', maxWidth: '1200px', width: '100%' }}>
      {/* Photo on the Left */}
      <Grid item xs={12} md={6}>
        <img src="/images/lastPhoto.png" alt="Insightful Analysis" style={{ width: '100%', height: 'auto', borderRadius: '4px' }}/>
      </Grid>

      {/* Text and Button on the Right */}
      <Grid item xs={12} md={6}>
        <Typography variant="h4" component="h2" gutterBottom>
        EcoScan: AI-Powered Transparency in Fossil Fuel Sustainability
        </Typography>
        <Typography variant="body1" gutterBottom>
          EcoScan aims to address the critical challenge of ensuring transparency and accountability within the fossil fuel industry by creating an AI-powered platform to assess and compare the sustainability efforts of European fossil fuel companies. The platform will automate the extraction, standardization, and analysis of sustainability data from unstructured corporate reports, empowering stakeholders to make informed decisions about the authenticity of these companies’ environmental claims. EcoScan’s ultimate goal is to drive greater accountability in corporate sustainability reporting, promoting a faster transition to renewable energy.        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/signup'}
          style={{ marginTop: '20px', textTransform: 'none', marginBottom: '60px', backgroundColor: '#4CAF4F', color: 'white', }}
        >
          Learn More
        </Button>
      </Grid>
    </Grid>




  </Box>
</ThemeProvider>


  );
};

export default Home;
