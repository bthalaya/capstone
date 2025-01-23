import React, { useState, useEffect} from 'react';

const serverURL = "http://localhost:5000";

import React, { useState } from 'react';
function Landing() {
  const [companyName, setCompanyName] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportType, setReportType] = useState('');
  const [companies, setCompanies] = useState([]);
  const [reportYears, setReportYears] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [serverLocation, setServerLocation] = useState('');
  const [localLocation, setLocalLocation] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestButtonClick = async () => {
    if (!companyName || !reportYear || !reportType) {
      alert('Please select all options before testing.');
      return;
    }

    try {
      const response = await fetch(
        `${serverURL}/api/server-location?companyName=${encodeURIComponent(companyName)}&reportYear=${reportYear}&reportType=${encodeURIComponent(reportType)}`
      );
      if (!response.ok) {
        throw new Error('No matching document found.');
      }
      const data = await response.json();
      setServerLocation(data.serverLocation);
    } catch (error) {
      console.error("Error fetching server location:", error);
      setServerLocation(error.message);
    }
  };

  const handleUpload = async () => {
    if (!localLocation) {
      alert('Server location is required. Fetch it first.');
      return;
    }

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: localLocation }),
      });

      const data = await response.json();  // Parse the JSON response
      console.log(data.content);  // This will log "YES" if that's the response
  
      // Extract the "YES" value
      const content = data.content;
      console.log('Extracted content:', content); 
      setResponseMessage(content);
    } catch (error) {
      console.error('Error uploading file:', error);
      setResponseMessage(`Error: ${error.message}`);
    }
  };

  // Fetch unique company names
  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await fetch(`${serverURL}/api/companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data); // Log the API response
      setCompanies(data);
    };

    fetchCompanies();
  }, []);

  // Fetch unique report years when a company is selected
  useEffect(() => {
    if (companyName) {
      const fetchReportYears = async () => {
        const response = await fetch(`${serverURL}/api/report-years?companyName=${encodeURIComponent(companyName)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setReportYears(data);
        setReportTypes([]); // Reset report types
      };

      fetchReportYears();
    }
  }, [companyName]);

  // Fetch unique report types when a report year is selected
  useEffect(() => {
    if (companyName && reportYear) {
      const fetchReportTypes = async () => {
        const response = await fetch(
          `${serverURL}/api/report-types?companyName=${encodeURIComponent(companyName)}&reportYear=${encodeURIComponent(reportYear)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setReportTypes(data);
      };

      fetchReportTypes();
    }
  }, [companyName, reportYear]);

  const handleDownloadFile = async (filePath) => {
    setLoading(true);
    setError(null);
    console.log(filePath);
  
    try {
      const response = await fetch('/api/get-file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),  // Sending file path to backend
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
  
      const data = await response.json();
      localLocation = setLocalLocation(data.content);
      console.log(data.content);  // Assuming server returns content
      // Now handle the content (pass it to the GPT model)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <label>Company:</label>
      <select
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      >
        <option value="">Select a Company</option>
        {companies.map((company) => (
          <option key={company.company_name} value={company.company_name}>
            {company.company_name}
          </option>
        ))}
      </select>

      <label>Report Year:</label>
      <select
        value={reportYear}
        onChange={(e) => setReportYear(e.target.value)}
        disabled={!companyName}
      >
        <option value="">Select a Year</option>
        {reportYears.map((year) => (
          <option key={year.report_year} value={year.report_year}>
            {year.report_year}
          </option>
        ))}
      </select>

      <label>Report Type:</label>
      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        disabled={!reportYear}
      >
        <option value="">Select a Report Type</option>
        {reportTypes.map((type) => (
          <option key={type.report_type} value={type.report_type}>
            {type.report_type}
          </option>
        ))}
      </select>

      <button onClick={handleTestButtonClick}>Fetch Server Location</button>

      {/* Display server location */}
      {serverLocation && <p>Server Location: {serverLocation}</p>}

      <button onClick={() => handleDownloadFile(serverLocation)}>Download File</button>

      {localLocation && <p>Local Location: {localLocation}</p>}

      <button onClick={handleUpload} disabled={!serverLocation}>
        Upload and Summarize
      </button>

      {/* Display response message */}
      {responseMessage && <p>{responseMessage}</p>}

    </div>
  );
};

/*function Landing() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to summarize the file.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Upload a PDF for Summary</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Summarize"}
      </button>
      {summary && (
        <div style={{ marginTop: "20px" }}>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};*/

export default Landing;

