import React, {useState, useEffect, useCallback} from "react";
import {  InputAdornment, TextField, Button, MenuItem, Select, FormControl, InputLabel} from "@mui/material";
import {  Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Search, ArrowDropDown, ArrowDropUp, } from "@mui/icons-material";
import { CloudUpload } from "@mui/icons-material";
import { initializeApp } from "firebase/app";
import { Notifications, Settings, AccountCircle } from "@mui/icons-material";
import { Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import store from '../../store';
import { useHistory } from 'react-router-dom';
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
  const [data, setData] = useState([]);

  const [openDialog, setOpenDialog] = useState(false); // For the popup
  const [companyName, setCompanyName] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportName, setReportName] = useState('');
  const [documentURL, setDocumentURL] = useState('');
  const [file, setFile] = useState(null); // File upload state
  const userId = 1; // Hardcoded user ID
  const [searchQuery, setSearchQuery] = useState("");
  const [reportYearQuery, setReportYearQuery] = useState("All years");
  const [uploadDateQuery, setUploadDateQuery] = useState("All time");
  const [reportTypeQuery, setReportTypeQuery] = useState("All reports");
  const [filteredDocuments, setFilteredDocuments] = useState(data);
  const history = useHistory();
  const [value, setValue] = React.useState(0);

    useEffect(() => {
      loadDocuments();
    }, []);

    let[profile,setProfile]=React.useState([]);

    useEffect(() => {
      loadApiGetProfiles();
    },[]);

    const handleChange = (newValue) => {
      history.push(`${newValue}`);
      console.log(newValue)
      setValue(newValue);
    };

    const loadApiGetProfiles = async () => {
      const userNameGlobal = store.getState().user.userNameGlobal;
    
      try {
        const checkResponse = await fetch(`${serverURL}/api/getProfile?username=${userNameGlobal}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const checkData = await checkResponse.json();
        console.log('Profile data:', checkData);
    
        // Update profile state with the fetched data
        if (checkResponse.status === 200) {
          setProfile(checkData);  // Set profile data
        } else {
          console.log('User not found or error fetching profile');
          handleChange("/SignIn");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };


    const filterDocuments = useCallback(() => {
      let filtered = [...data];
  
      if (searchQuery) {
        filtered = filtered.filter((doc) =>
          doc.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.report_year.toString().includes(searchQuery) ||
          doc.report_type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
  
      if (reportYearQuery && reportYearQuery !== "All years") {
        filtered = filtered.filter((doc) => doc.report_year.toString() === reportYearQuery);
      }
  
      if (uploadDateQuery && uploadDateQuery !== "All time") {
        const now = new Date();
        
        filtered = filtered.filter((doc) => {
          const uploadDate = new Date(doc.date);
          const daysDiff = (now - uploadDate) / (1000 * 60 * 60 * 24);
      
          if (uploadDateQuery === "Last Week") {
            return daysDiff <= 7;
          }
          if (uploadDateQuery === "Last Month") {
            return daysDiff <= 30;
          }
          if (uploadDateQuery === "Last Year") {
            return daysDiff <= 365;
          }
      
          return true;
        });
      }
  
      if (reportTypeQuery && reportTypeQuery !== "All reports") {
        filtered = filtered.filter((doc) => doc.report_type === reportTypeQuery);
      }
  
      setFilteredDocuments(filtered);
}, [data, searchQuery, reportYearQuery, uploadDateQuery, reportTypeQuery]);

useEffect(() => {
  filterDocuments();
}, [filterDocuments]);

    const loadDocuments = async () => {
      const response = await fetch(serverURL + "/api/getDocuments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setData(data.documents)
    };

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleSubmit = async () => {
    // Step 1: Check if the document exists in the system
    const checkResponse = await fetch(serverURL + "/api/checkDocument", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_name: companyName,
        report_year: reportYear,
        report_type: reportName, // Assuming reportType is the name of the report type
      }),
    });
  
    const checkData = await checkResponse.json();
    console.log("Response from /api/checkDocument:", checkData);
  
    if (checkData.exists) {
      // Document already exists
      alert(`This document already exists in the system: 
        Company: ${checkData.document.company_name}
        Year: ${checkData.document.report_year}
        Type: ${checkData.document.report_type}`);
    } else {
      // Step 2: Proceed with adding the document to the system if it doesn't exist
      const formattedDocumentSource = `${companyName}/${reportYear}/${reportName}.pdf`;
  
      const documentInfo = {
        company_name: companyName,
        report_year: reportYear,
        report_type: reportName,
        document_source_link: documentURL,
        server_location: formattedDocumentSource,
        user_id: userId,
      };
  
      // Assuming there is an endpoint for adding a document
      const submitResponse = await fetch(serverURL + "/api/addDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentInfo),
      });
  
      const submitData = await submitResponse.json();
      console.log("Document added:", submitData);

      try {
        const pages = [47,48,49,50]
        let extractedMarkdown = "";
        let answerText = "";
        // Step 1: Call /api/ocr to get the extracted markdown
        for (const page in pages){
          const ocrResponse = await fetch(serverURL + '/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentUrl: 'https://www.omv.com/downloads/2024/11/e7bc7980-ebf2-881c-ca8c-db7897754d9c/omv-sustainability-report-2023.pdf',
              pages : page
            })
          });
        
          const ocrData = await ocrResponse.json();
          console.log("ocrData: " + ocrData.markdown)
          
          if (!ocrData || !ocrData.markdown) {
            console.error('Error: No markdown data received from OCR. Response:', ocrData);
            return;
          }
          extractedMarkdown += ocrData.markdown + "\n"; 
          // Step 2: Call /api/chat with the extracted markdown and the desired question
        const question = `Extract all data related to OMV's climate change initiatives and progress from the document's markdown text : ${ocrData.markdown}. Organize the information into two tables: one for achievements in 2023 with as much detail as provided in markdown text and another for planned initiatives for 2024 also with as much detail as possible. Each table should include the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each row in the tables specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action.
        `; // Your question here
        
          const answerResponse = await fetch(serverURL + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: question,
              markdownText: extractedMarkdown
            })
          });
        
          const answerData = await answerResponse.json();
          answerText += answerData.answer + "\n";
        }
        if (answerText) {
          console.log('Answer:', answerText);
        } else {
          console.error('Error: No answer received from the question API. Response:', answerText);
        }

      
        // Extracted markdown text
      
      
      } catch (error) {
        console.error('Error processing document or question:', error);
      }
  
      if (submitData.success) {
        alert("Document successfully added to the system!");
        // Reset form values after submission
        setCompanyName('');
        setReportYear('');
        setReportName('');
        setDocumentURL('');
        setFile(null);
        setOpenDialog(false);
      } else {
        alert("An error occurred while adding the document. Please try again.");
      }
    }
  };

  const handleSort = (column) => {
    // Determine sorting direction
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
  
    // Sorting logic
    const sortedData = [...filteredDocuments].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];
  
      // Handle null or undefined values (push them to the end)
      if (valA == null) return newDirection === "asc" ? 1 : -1;
      if (valB == null) return newDirection === "asc" ? -1 : 1;
  
      // Special handling for date columns
      if (column === "date") {
        valA = new Date(valA);
        valB = new Date(valB);
        return newDirection === "asc" ? valA - valB : valB - valA;
      }
  
      // Convert text values to lowercase for case-insensitive sorting
      if (column === 'type' || column === 'name') {
        return newDirection === "asc"
          ? valA.localeCompare(valB) // Ascending order
          : valB.localeCompare(valA); // Descending order
      }
  
      // Numeric comparison for other cases
      return newDirection === "asc" ? valA - valB : valB - valA;
    });
  
    setFilteredDocuments(sortedData);
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
      Manage Files
    </Typography>

    {/* Welcome Message */}
    <Typography
      variant="h2"
      style={{
        color: "#838D94",
        margin: "0 0 0.5rem 0",
        fontFamily: 'Lato, sans-serif',
        fontWeight: 600,
        fontSize: '1.5rem',
      }}
    >
      {profile && profile.profile && profile.profile.first_name 
        ? `Welcome, ${profile.profile.first_name.charAt(0).toUpperCase() + profile.profile.first_name.slice(1)}! `
        : 'Welcome! '}
      <span role="img" aria-label="waving">👋</span>
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
          value={searchQuery}
          onChange = {(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
  {/* Refresh Button */}
      <Button 
        variant="contained"
        style={{ backgroundColor: "#7F9E50", color: "white" }}
        onClick={() => {
          setReportYearQuery("All years");
          setReportTypeQuery("All reports");
          setSearchQuery("");
          setUploadDateQuery("All time");
        }}
      >
        Refresh
      </Button>
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
          <Select 
            label="Report Type"
            value={reportTypeQuery}
            onChange={(e) => setReportTypeQuery(e.target.value)}
          >
            {["All reports", "Factbook", "Form 20", "Progress Report", "URD", "CDP", "Annual Report & Form 20", "Sustainability Report", "Advancing The Energy Transition", "ESG Datasheet", "Net Zero Report", "Sustainability Performance", "Annual Report", "Path to Decarbonization", "Carbon Neutrality", "Just Transition", "Climate Review", "Energy Transition", "Financial Statements", "Results", "Financial Report", "ESG Report"].map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 150, marginTop: "1rem" }}>
          <InputLabel>Report Year</InputLabel>
          <Select 
            label="Report Year"
            value={reportYearQuery}
            onChange={(e) => setReportYearQuery(e.target.value)}
          >
            {["All years", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014"].map((year, index) => (
              <MenuItem key={index} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 150, marginTop: "1rem" }}>
          <InputLabel>Upload Date</InputLabel>
          <Select 
            label="Upload Date"
            value={uploadDateQuery}
            onChange={(e) => setUploadDateQuery(e.target.value)}
          >
            {["All time", "Last Week", "Last Month", "Last Year"].map((date, index) => (
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
          {filteredDocuments.map((row, index) => (
            <tr key={index}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.company_name}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.report_year}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{row.report_type}</td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>{new Date(row.date).toISOString().split('T')[0]}</td>
              <td style={{ textAlign: "center", padding: "0.5rem", borderBottom: "1px solid #eee" }}>⋮</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageFiles;