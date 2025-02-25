import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, FormControl, FormHelperText, Paper, IconButton, InputAdornment 
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useHistory } from 'react-router-dom';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: "#f5f5f5"
    },
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#1b5e20',
    },
  },
  shape: {
    borderRadius: 16,
  },
});

const serverURL = "http://localhost:5000";

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const history = useHistory();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    let valid = true;
    
    // Clear previous errors
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      valid = false;
    }
  
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      valid = false;
    }
  
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      valid = false;
    }

    if (!username.trim()) {
      setUsernameError('Username is required');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }
  
    if (!valid) return;

    const createUser = await fetch(serverURL + "/api/addProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email_address: email,
        username: username,
        password: password,
      }),
    });
  
    const createData = await createUser.json();
    console.log("Response from /api/signup:", createData);
    console.log(email)
    if (createData.success) {
      console.log("Sign-up successful");
      history.push('/SignIn'); // Redirect to login page
    } else {
      setUsernameError("Username already exists or an error occurred.");
    };
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Box display="flex" height="100vh">
        
        {/* Left Branding Section */}
        <Box 
          flex={1} 
          bgcolor="primary.main" 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center"
          color="white"
          p={4}
        >
          <Typography variant="h3" fontWeight="bold">EcoScan</Typography>
          <Typography variant="h6" textAlign="center" mt={1} maxWidth="300px">
            Bridging Data and Transparency in Fossil Fuel Sustainability Reporting.
          </Typography>
        </Box>

        {/* Right Sign Up Form */}
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Paper elevation={3} sx={{ padding: 4, borderRadius: 4, width: 350, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">Sign Up</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              <FormControl error={!!firstNameError}>
                <TextField 
                  label="First Name" 
                  variant="outlined" 
                  fullWidth 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
                <FormHelperText>{firstNameError}</FormHelperText>
              </FormControl>

              <FormControl error={!!lastNameError}>
                <TextField 
                  label="Last Name" 
                  variant="outlined" 
                  fullWidth 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
                <FormHelperText>{lastNameError}</FormHelperText>
              </FormControl>

              <FormControl error={!!emailError}>
                <TextField 
                  label="Email Address" 
                  type="email"
                  variant="outlined" 
                  fullWidth 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                <FormHelperText>{emailError}</FormHelperText>
              </FormControl>

              <FormControl error={!!usernameError}>
                <TextField 
                  label="Username" 
                  variant="outlined" 
                  fullWidth 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
                <FormHelperText>{usernameError}</FormHelperText>
              </FormControl>

              <FormControl error={!!passwordError}>
                <TextField 
                  label="Password" 
                  type={showPassword ? "text" : "password"} 
                  variant="outlined" 
                  fullWidth 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <FormHelperText>{passwordError}</FormHelperText>
              </FormControl>

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ borderRadius: 8 }}>
                Sign Up
              </Button>
              <Typography variant="body2" color="secondary" mt={1}>
                Already have an account? <a href="/SignIn">Login</a>
              </Typography>
            </Box>
          </Paper>
        </Box>

      </Box>
    </ThemeProvider>
  );
};

export default SignUp;
