import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormHelperText,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
    },
    primary: {
      main: "#2e7d32",
    },
    secondary: {
      main: "#1b5e20",
    },
  },
  shape: {
    borderRadius: 16,
  },
});

const About = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    if (!valid) return;

    console.log("Signing in with", email, password);
  };

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
          <Typography variant="h3" fontWeight="bold">
            EcoScan
          </Typography>
          <Typography variant="h6" textAlign="center" mt={1} maxWidth="300px">
            Bridging Data and Transparency in Fossil Fuel Sustainability
            Reporting.
          </Typography>
        </Box>

        {/* Right Login Form */}
        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              borderRadius: 4,
              width: 350,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Sign In
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormControl error={!!emailError}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormHelperText>{emailError}</FormHelperText>
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
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>{passwordError}</FormHelperText>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ borderRadius: 8 }}
              >
                Sign In
              </Button>
              <Typography variant="body2" color="secondary" mt={1}>
                Forgot password?
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default About;
