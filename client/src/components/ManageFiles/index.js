import React, {useState} from "react";
import {  InputAdornment, TextField, Button, MenuItem, Select, FormControl, InputLabel} from "@mui/material";
import {  Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Search, ArrowDropDown, ArrowDropUp, } from "@mui/icons-material";
import { CloudUpload } from "@mui/icons-material";
import { initializeApp } from "firebase/app";
import { Notifications, Settings, AccountCircle } from "@mui/icons-material";
import { Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import "@fontsource/lato";  // Ensure this is added

const serverURL = "http://localhost:5000"; // Your server URL

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


const ManageFiles = () => {
  const [sortColumn, setSortColumn] = useState(null); // Track which column is being sorted
  const [sortDirection, setSortDirection] = useState("asc"); // Track sorting direction
  const [data, setData] = useState([
    { name: "BP", year: 2022, type: "Annual Report", date: "Dec 13, 2022" },
    { name: "Shell", year: 2022, type: "Sustainability Report", date: "Dec 12, 2022" },
    { name: "Exxon", year: 2021, type: "Financial Report", date: "Jan 8, 2022" },
    { name: "Chevron", year: 2023, type: "Annual Report", date: "Oct 22, 2023" },
  ]);

  const [openDialog, setOpenDialog] = useState(false); // For the popup
  const [companyName, setCompanyName] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportName, setReportName] = useState('');
  const [documentURL, setDocumentURL] = useState('');
  const [file, setFile] = useState(null); // File upload state

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleSubmit = () => {
    // Handle the form submission logic here (e.g., sending data to server)
    console.log("Form submitted", { companyName, reportYear, reportName, documentURL, file });
    setOpenDialog(false);
  };

  const handleSort = (column) => {
    // Set the sorting direction
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    // Sort the data
    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return newDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? <ArrowDropUp /> : <ArrowDropDown />;
    }
    return <ArrowDropDown />;
  };

  return (
    
    <div className="main-page" style={{ padding: "1rem" }}>

      {/* Header Section */}
      <Typography
      variant="h1"
      style={{
        color: "#004d00",
        margin: "0 0 0.5rem 0",
        fontFamily: 'Lato, sans-serif',  // Use Lato font
        fontWeight: 700,  // Font weight for h1
        fontSize: '2.5rem',  // Font size
      }}
    >
      Manage Files Page
    </Typography>

    {/* Welcome Message */}
    <Typography
      variant="h2"
      style={{
        color: "#838D94",
        margin: "0 0 0.5rem 0",
        fontFamily: 'Lato, sans-serif',  // Use Lato font
        fontWeight: 600,  // Font weight for h1
        fontSize: '1.5rem',  // Font size
      }}
    >
      Welcome! <span role="img" aria-label="waving">👋</span>
    </Typography>

      {/* Search Bar and Controls */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "1rem", 
        marginBottom: "1rem",
        marginTop: "1.5rem"
        }}>
        {/* Search Bar */}
        <TextField
          placeholder="Search by file name, company, year, or type"
          style={{
            width: "50%",
            height: "50px",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Add New Button */}
        <Button
          variant="contained"
          style={{
            backgroundColor: "#9BBB70",  
            color: "#004d00",
            padding: "0.5rem 2rem",
            marginLeft: "auto", // Pushes the button to the right
          }}
          onClick={handleDialogOpen}
        >
          + Add New
        </Button>
      </div>

      {/* Dropdown Menus */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <FormControl style={{ minWidth: 150, marginTop: "1rem"}}>
          <InputLabel>Report Type</InputLabel>
          <Select defaultValue="" label="Report Type">
            {["Type 1", "Type 2", "Type 3"].map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 150, marginTop: "1rem" }}>
          <InputLabel>Report Year</InputLabel>
          <Select defaultValue="" label="Report Year">
            {["2023", "2022", "2021"].map((year, index) => (
              <MenuItem key={index} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 150, marginTop: "1rem" }}>
          <InputLabel>Upload Date</InputLabel>
          <Select defaultValue="" label="Upload Date">
            {["Last Week", "Last Month", "Last Year"].map((date, index) => (
              <MenuItem key={index} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Popup for Adding New File */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New File</DialogTitle>
        <DialogContent>
          <TextField
            label="Company Name"
            fullWidth
            style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <TextField
            label="Report Year"
            fullWidth
            style={{ marginBottom: "1rem" }}
            value={reportYear}
            onChange={(e) => setReportYear(e.target.value)}
          />
          <TextField
            label="Report Name"
            fullWidth
            style={{ marginBottom: "1rem" }}
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
          <TextField
            label="Document URL"
            fullWidth
            style={{ marginBottom: "1rem" }}
            value={documentURL}
            onChange={(e) => setDocumentURL(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: "1rem" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Section */}
      <Typography
      variant="h2"
      style={{
        color: "#051F61",
        margin: "0 0 0.5rem 0",
        fontFamily: 'Lato, sans-serif', 
        fontWeight: 500,  
        fontSize: '1.5rem',  
        marginTop: 15
      }}
    >
      All Files
    </Typography>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{ textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #ccc", cursor: "pointer" }}
              onClick={() => handleSort("name")}
            >
              Name {renderSortIcon("name")}
            </th>
            <th
              style={{ textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #ccc", cursor: "pointer" }}
              onClick={() => handleSort("year")}
            >
              Report Year {renderSortIcon("year")}
            </th>
            <th
              style={{ textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #ccc", cursor: "pointer" }}
              onClick={() => handleSort("type")}
            >
              Report Type {renderSortIcon("type")}
            </th>
            <th
              style={{ textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #ccc", cursor: "pointer" }}
              onClick={() => handleSort("date")}
            >
              Upload Date {renderSortIcon("date")}
            </th>
            <th style={{ padding: "0.5rem", borderBottom: "2px solid #ccc" }}></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.name}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.year}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.type}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.date}</td>
              <td style={{ textAlign: "center", padding: "0.5rem", borderBottom: "1px solid #eee" }}>⋮</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageFiles;