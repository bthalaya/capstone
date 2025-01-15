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

const Home = () => {
  const [companyName, setCompanyName] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportType, setReportType] = useState('');
  const [documentURL, setDocumentURL] = useState('');
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [submissionCheck, setSubmissionCheck] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const userId = 1; // Hardcoded user ID

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, companyFilter, yearFilter, typeFilter, searchText]);

  const loadDocuments = async () => {
    const response = await fetch(serverURL + "/api/getDocuments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setDocuments(data.documents);
  };

  const filterDocuments = () => {
    let filtered = [...documents];
    
    if (companyFilter) {
      filtered = filtered.filter(doc => doc.company_name.toLowerCase().includes(companyFilter.toLowerCase()));
    }
    
    if (yearFilter) {
      filtered = filtered.filter(doc => doc.report_year.toString().includes(yearFilter));
    }
    
    if (typeFilter) {
      filtered = filtered.filter(doc => doc.report_type.toLowerCase().includes(typeFilter.toLowerCase()));
    }
    
    if (searchText) {
      filtered = filtered.filter(doc => 
        doc.company_name.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.report_year.toString().includes(searchText) ||
        doc.report_type.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleSubmissionValidation = async (event) => {
    event.preventDefault();
    if (!companyName || !reportYear || !reportType || !documentURL || !file) {
      setSubmissionCheck(true);
      return;
    }

    // Check if the document exists in the system
    const checkResponse = await fetch(serverURL + "/api/checkDocument", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_name: companyName,
        report_year: reportYear,
        report_type: reportType,
      }),
    });

    const checkData = await checkResponse.json();

    if (checkData.exists) {
      alert(`This document already exists in the system: 
        Company: ${checkData.document.company_name}
        Year: ${checkData.document.report_year}
        Type: ${checkData.document.report_type}`);
    } else {
      // Proceed with adding the document if it doesn't exist
      const formattedDocumentSource = `${companyName}/${reportYear}/${reportType}.pdf`;

      const documentInfo = {
        company_name: companyName,
        report_year: reportYear,
        report_type: reportType,
        document_source_link: documentURL,
        server_location: formattedDocumentSource,
        user_id: userId,
      };

      await fetch(serverURL + "/api/addDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentInfo),
      });
    }
    setCompanyName('');
    setReportYear('');
    setReportType('');
    setDocumentURL('');
    setFile(null);
    loadDocuments();
    setSubmissionCheck(false);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Document Management
        </Typography>
        <FormControl fullWidth>
          <form autoComplete="off" onSubmit={handleSubmissionValidation}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <CompanySelection
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  submissionCheck={submissionCheck}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ReportYearInput
                  reportYear={reportYear}
                  setReportYear={setReportYear}
                  submissionCheck={submissionCheck}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ReportTypeInput
                  reportType={reportType}
                  setReportType={setReportType}
                  submissionCheck={submissionCheck}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <URLInput
                  documentURL={documentURL}
                  setDocumentURL={setDocumentURL}
                  submissionCheck={submissionCheck}
                />
              </Grid>
              <Grid item xs={12}>
                <FileUpload
                  setFile={setFile}
                  submissionCheck={submissionCheck}
                />
              </Grid>
            </Grid>
            <Button variant="contained" color="primary" type="submit" sx={{ marginTop: 2 }}>
              Submit
            </Button>
          </form>
        </FormControl>

        {submissionCheck && (
          <Typography variant="h5" color="error">
            Please fill out all fields.
          </Typography>
        )}

        {/* Filters Section */}
        <Box sx={{ marginTop: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormLabel>Filter by Company</FormLabel>
              <TextField
                fullWidth
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                label="Company Name"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormLabel>Filter by Year</FormLabel>
              <TextField
                fullWidth
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Report Year"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormLabel>Filter by Report Type</FormLabel>
              <TextField
                fullWidth
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Report Type"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Search Bar */}
        <Box sx={{ marginTop: 2 }}>
          <TextField
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            label="Search Documents"
          />
        </Box>

        {/* Documents Table */}
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Report Year</TableCell>
                <TableCell>Report Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredDocuments) && filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.document_id}>
                    <TableCell>{doc.company_name}</TableCell>
                    <TableCell>{doc.report_year}</TableCell>
                    <TableCell>{doc.report_type}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No documents available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ThemeProvider>
  );
};

const CompanySelection = ({ companyName, setCompanyName, submissionCheck }) => {
  const [focus, setFocus] = useState(false); // Track focus state

  return (
    <div>
      <FormLabel htmlFor="company-select" sx={{ marginBottom: 1 }}>Company Name</FormLabel>
      <Select
        labelId="company-select-label"
        id="company-select"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        onFocus={() => setFocus(true)} // Set focus onSelect
        onBlur={() => setFocus(false)}  // Remove focus onBlur
        sx={{
          width: '100%',
          borderColor: submissionCheck && companyName === '' ? 'red' : 'inherit',
          '&.Mui-focused': {
            borderColor: 'blue', // Add custom color when focused
          },
          outline: focus ? '2px solid blue' : 'none', // Manage focus outline
        }}
      >
        <MenuItem value="BP">BP</MenuItem>
        <MenuItem value="Cepsa">Cepsa</MenuItem>
        <MenuItem value="Eni">Eni</MenuItem>
        <MenuItem value="Equinor">Equinor</MenuItem>
        <MenuItem value="OMV">OMV</MenuItem>
        <MenuItem value="Puma">Puma</MenuItem>
        <MenuItem value="Repsol">Repsol</MenuItem>
        <MenuItem value="Shell">Shell</MenuItem>
        <MenuItem value="TotalEnergies">TotalEnergies</MenuItem>
        <MenuItem value="Wintershall">Wintershall</MenuItem>
      </Select>
      <FormHelperText error={submissionCheck && companyName === ''}>
        {submissionCheck && companyName === '' ? '*Please select a company. It is a mandatory field!' : 'Select a company'}
      </FormHelperText>
    </div>
  );
};

const ReportYearInput = ({ reportYear, setReportYear, submissionCheck }) => (
  <div>
    <FormLabel htmlFor="report-year" sx={{ marginBottom: 1 }}>Report Year</FormLabel>
    <TextField
      id="report-year"
      label="Report Year"
      value={reportYear}
      onChange={(e) => setReportYear(e.target.value)}
      required
      sx={{ width: '100%' }}
    />
    {reportYear === '' && submissionCheck && (
      <div><em style={{ color: 'red' }}>*Please enter a report year. It is a mandatory field!</em></div>
    )}
  </div>
);

const ReportTypeInput = ({ reportType, setReportType, submissionCheck }) => {
  const [focus, setFocus] = useState(false); // Track focus state

  return (
    <div>
      <FormLabel htmlFor="report-select" sx={{ marginBottom: 1 }}>Report Name</FormLabel>
      <Select
        labelId="report-select-label"
        id="report-select"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        onFocus={() => setFocus(true)} // Set focus onSelect
        onBlur={() => setFocus(false)}  // Remove focus onBlur
        sx={{
          width: '100%',
          borderColor: submissionCheck && reportType === '' ? 'red' : 'inherit',
          '&.Mui-focused': {
            borderColor: 'blue', // Add custom color when focused
          },
          outline: focus ? '2px solid blue' : 'none', // Manage focus outline
        }}
      >
        <MenuItem value="Factbook">Factbook</MenuItem>
        <MenuItem value="Form 20">Form 20</MenuItem>
        <MenuItem value="Progress Report">Progress Report</MenuItem>
        <MenuItem value="URD">URD</MenuItem>
        <MenuItem value="CDP">CDP</MenuItem>
        <MenuItem value="Annual Report & Form 20">Annual Report & Form 20</MenuItem>
        <MenuItem value="Sustainability Report">Sustainability Report</MenuItem>
        <MenuItem value="Advancing The Energy Transition">Advancing The Energy Transition</MenuItem>
        <MenuItem value="ESG Datasheet">ESG Datasheet</MenuItem>
        <MenuItem value="Net Zero Report">Net Zero Report</MenuItem>
        <MenuItem value="Sustainability Performance">Sustainability Performance</MenuItem>
        <MenuItem value="Annual Report">Annual Report</MenuItem>
        <MenuItem value="Path to Decarbonization">Path to Decarbonization</MenuItem>
        <MenuItem value="Carbon Neutrality">Carbon Neutrality</MenuItem>
        <MenuItem value="Just Transition">Just Transition</MenuItem>
        <MenuItem value="Climate Review">Climate Review</MenuItem>
        <MenuItem value="Energy Transition">Energy Transition</MenuItem>
        <MenuItem value="Financial Statements">Financial Statements</MenuItem>
        <MenuItem value="Results">Results</MenuItem>
        <MenuItem value="Financial Report">Financial Report</MenuItem>
        <MenuItem value="ESG Report">ESG Report</MenuItem>
      </Select>
      <FormHelperText error={submissionCheck && reportType === ''}>
        {submissionCheck && reportType === '' ? '*Please select a report type. It is a mandatory field!' : 'Select a report type'}
      </FormHelperText>
    </div>
  );
};

const URLInput = ({ documentURL, setDocumentURL, submissionCheck }) => (
  <div>
    <FormLabel htmlFor="url" sx={{ marginBottom: 1 }}>Document URL</FormLabel>
    <TextField
      id="url"
      label="Document URL"
      value={documentURL}
      onChange={(e) => setDocumentURL(e.target.value)}
      required
      sx={{ width: '100%' }}
    />
    {documentURL === '' && submissionCheck && (
      <div><em style={{ color: 'red' }}>*Please enter a document URL. It is a mandatory field!</em></div>
    )}
  </div>
);

const FileUpload = ({ file, setFile, submissionCheck }) => (
  <div>
    <FormLabel htmlFor="file-upload" sx={{ marginBottom: 1 }}>File Upload</FormLabel>
    <input
      type="file"
      id="file-upload"
      onChange={(e) => setFile(e.target.files[0])}
      required
    />
    {!file && submissionCheck && (
      <div><em style={{ color: 'red' }}>*Please upload a file. It is a mandatory field!</em></div>
    )}
  </div>
);

export default Home;




