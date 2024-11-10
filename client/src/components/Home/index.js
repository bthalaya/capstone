import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, TextField, FormHelperText } from '@mui/material';
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
  const [documents, setDocuments] = useState([]);
  const [submissionCheck, setSubmissionCheck] = useState(false);
  const userId = 1; // Hardcoded user ID

  useEffect(() => {
    loadDocuments();
  }, []);

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

  const handleSubmissionValidation = async (event) => {
    event.preventDefault();
    if (!companyName || !reportYear || !reportType) {
      setSubmissionCheck(true);
      return;
    }

    const formattedDocumentSource = `${companyName}/${reportYear}/${reportType}.pdf`;

    const documentInfo = {
      companyName,
      reportYear,
      reportType,
      documentSource: formattedDocumentSource,
      userId,
    };

    await fetch(serverURL + "/api/addDocument", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(documentInfo)
    });

    setCompanyName('');
    setReportYear('');
    setReportType('');
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
            <CompanySelection
              companyName={companyName}
              setCompanyName={setCompanyName}
              submissionCheck={submissionCheck}
            />
            <ReportYearInput
              reportYear={reportYear}
              setReportYear={setReportYear}
              submissionCheck={submissionCheck}
            />
            <ReportTypeInput
              reportType={reportType}
              setReportType={setReportType}
              submissionCheck={submissionCheck}
            />
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </form>
        </FormControl>

        {submissionCheck && (
          <Typography variant="h5" color="error">
            Please fill out all fields.
          </Typography>
        )}

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
              {Array.isArray(documents) && documents.length > 0 ? (
                documents.map((doc) => (
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

const CompanySelection = ({ companyName, setCompanyName, submissionCheck }) => (
  <div>
    <InputLabel id="company-select-label">Company Name</InputLabel>
    <Select
      labelId="company-select-label"
      id="company-select"
      value={companyName}
      label="Company Name"
      onChange={(e) => setCompanyName(e.target.value)}
      sx={{ width: 400 }}
    >
      <MenuItem value="Company A">Company A</MenuItem>
      <MenuItem value="Company B">Company B</MenuItem>
      <MenuItem value="Company C">Company C</MenuItem>
    </Select>
    <FormHelperText>Select a company</FormHelperText>
    {companyName === '' && submissionCheck && (
      <div><em style={{ color: 'red' }}>*Please select a company. It is a mandatory field!</em></div>
    )}
  </div>
);

const ReportYearInput = ({ reportYear, setReportYear, submissionCheck }) => (
  <div>
    <TextField
      label="Report Year"
      value={reportYear}
      onChange={(e) => setReportYear(e.target.value)}
      required
      sx={{ margin: 1 }}
    />
    {reportYear === '' && submissionCheck && (
      <div><em style={{ color: 'red' }}>*Please enter a report year. It is a mandatory field!</em></div>
    )}
  </div>
);

const ReportTypeInput = ({ reportType, setReportType, submissionCheck }) => (
  <div>
    <TextField
      label="Report Type"
      value={reportType}
      onChange={(e) => setReportType(e.target.value)}
      required
      sx={{ margin: 1 }}
    />
    {reportType === '' && submissionCheck && (
      <div><em style={{ color: 'red' }}>*Please enter a report type. It is a mandatory field!</em></div>
    )}
  </div>
);

export default Home;


