import React, { useState, useEffect } from "react";
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
import { Provider } from "react-redux";
import store from "../../store";
import { setUsernameGlobal } from "../../actions/user";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

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

const serverURL = "http://localhost:5000";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const userNameGlobal = useSelector((state) => state.user.userNameGlobal);
  const dispatch = useDispatch();
  const history = useHistory();
  const [value, setValue] = React.useState(0);

  const [localUserName, setLocalUserName] = useState("");

  //updates the global username when it changes
  useEffect(() => {
    setLocalUserName(userNameGlobal);
  }, [userNameGlobal]);

  //sets the new global username
  useEffect(() => {
    dispatch(setUsernameGlobal(""));
  }, []);

  const handleChange = (newValue) => {
    history.push(`${newValue}`);
    console.log(newValue);
    setValue(newValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let valid = true;

    // Clear previous errors
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
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

    const checkUser = await fetch(serverURL + "/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const checkData = await checkUser.json();
    console.log("Response from /api/login:", checkData);

    if (checkData.exists) {
      console.log("Login successful");
      dispatch(setUsernameGlobal(username));
      handleChange("/managefiles"); // Change this to /About once all pages have moved over
      setUsername("");
      setPassword("");
    } else {
      setPasswordError("Username and password do not match our records"); // Display error message in UI
      console.log(username);
      console.log(password);
      setUsername("");
      setPassword("");
    }
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
              <Typography variant="body2" color="secondary" mt={1}>
                <a href="/SignUp">Create an account</a>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default SignIn;
