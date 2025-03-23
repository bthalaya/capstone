import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Select, ToggleButton, ToggleButtonGroup, MenuItem, Card, CardContent,IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const serverURL = "http://localhost:5000";

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
const tileColors = ["#0A5541", "#9BBB70", "#37A58E", "#24788C"]; 


const FunFactsCarousel = ({ apiCall }) => {
  const [funFacts, setFunFacts] = useState([]);
  const [viewType, setViewType] = useState("tiles"); 
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedType, setSelectedType] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;  
  


  useEffect(() => {

    console.log("Calling API:", apiCall);
    
    const fetchFunFacts = async () => {
      try {
        const response = await fetch(apiCall);
        const data = await response.json();
  
        const shuffled = data
          .map((item) => ({ sort: Math.random(), value: item }))
          .sort((a, b) => a.sort - b.sort)
          .map((obj) => obj.value);
  
        const withColors = shuffled.map((fact) => ({
          ...fact,
          color: tileColors[Math.floor(Math.random() * tileColors.length)],
        }));
  
        setFunFacts(withColors);
      } catch (error) {
        console.error("Error fetching fun facts:", error);
      }
    };
    fetchFunFacts();
  }, [apiCall]);

  const years = [...new Set(funFacts.map((fact) => fact.year))];
  const types = [...new Set(funFacts.map((fact) => fact.type))];

  const filteredFacts = funFacts.filter((fact) => 
    (selectedYear === "All Years" || fact.year === selectedYear) &&
    (selectedType === "All Types" || fact.type === selectedType)
  );

  const pageCount = Math.ceil(filteredFacts.length / itemsPerPage);
  const paginatedFacts = filteredFacts.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  const expandedStates = useRef({});
const textRefs = useRef({});
const [isTruncatedMap, setIsTruncatedMap] = useState({});

useEffect(() => {
  const updated = {};
  filteredFacts.forEach((fact, index) => {
    const el = textRefs.current[index];
    if (el) {
      updated[index] = el.scrollHeight > el.clientHeight;
    }
  });
  setIsTruncatedMap(updated);
}, [filteredFacts]);


  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Ecoscan Smart Highlights
      </Typography>

      {/* View Toggle Buttons */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
      <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewChange}
          aria-label="view toggle"
        >
          <ToggleButton value="tiles" aria-label="view as tiles" sx={{textTransform: "none"}}>
            View as Tiles
          </ToggleButton>
          <ToggleButton value="table" aria-label="view as table" sx={{textTransform: "none"}}>
            View as Table
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Dropdown Filters */}
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          sx={{ minWidth: 150 }}
        >
        <MenuItem value="All Years">All Years</MenuItem>
        {[...years].sort((a, b) => b - a).map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
        </Select>

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All Types">All Types</MenuItem>
          {types.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, gap: 2 }}>
        <IconButton
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          <ArrowBackIos />
        </IconButton>
        <Typography>
          Page {currentPage + 1} of {pageCount}
        </Typography>
        <IconButton
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount - 1))}
          disabled={currentPage >= pageCount - 1}
        >
          <ArrowForwardIos />
        </IconButton>
      </Box>

     {/* Tile View */}
      {viewType === "tiles" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 2,
          }}
        >
          {paginatedFacts.map((fact, index) => (
            <Card
              key={index}
              onClick={() => {
                if (isTruncatedMap[index]) {
                  expandedStates.current[index] = !expandedStates.current[index];
                  setIsTruncatedMap({ ...isTruncatedMap }); // force re-render
                }
              }}
              sx={{
                backgroundColor: fact.color,
                color: "white",
                padding: 2,
                height: "150px",
                overflow: "hidden",
                position: "relative",
                transition: "all 0.3s ease",
                cursor: isTruncatedMap[index] ? "pointer" : "default",
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  gap: 1,
                  padding: 1.5,
                }}
              >
                <Typography
                  ref={(el) => (textRefs.current[index] = el)}
                  variant="h6"
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: expandedStates.current[index] ? "unset" : 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: expandedStates.current[index] ? "1rem" : "1.25rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  {fact.text}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                  Year: {fact.year} | Type: {fact.type}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      {/* Table View (Optional) */}
      {viewType === "table" && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr style={{ background: "#0A5541", color: "white", textAlign: "left" }}>
              <th style={{ padding: 8, borderBottom: "2px solid #999" }}>Year</th>
              <th style={{ padding: 8, borderBottom: "2px solid #999" }}>Type</th>
              <th style={{ padding: 8, borderBottom: "2px solid #999" }}>Smart Highlight</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFacts.map((fact, index) => (
              <tr key={index}>
                <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>{fact.year}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>{fact.type}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #ddd" }}>{fact.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Box>
  );
};

const TABLEAU_SCRIPT_URL = "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";

const dashboardLinks = {
  "TE": "https://public.tableau.com/views/TEMetrics_17418767531310/Story1",
  "BP": "https://public.tableau.com/views/BPMetrics/Story1",
  "Shell": "https://public.tableau.com/views/ShellMetrics/Story1",
  "Cepsa": "https://public.tableau.com/views/CepsaMetrics/Story1",
  "Puma": "https://public.tableau.com/views/PumaMetrics/Story1",
  "Eni": "https://public.tableau.com/views/EniMetrics/Story1",
  "OMV": "https://public.tableau.com/views/OMVMetrics/Story1",
  "Equinor": "https://public.tableau.com/views/EquinorMetrics/Story1",
  "Repsol": "https://public.tableau.com/views/RepsolMetrics/Story1",
};

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState("BP");
  const vizRef = useRef(null); 
  const [apiCall, setApiCall] = useState(`/api/getBP`);

  useEffect(() => {
    setApiCall(`/api/get${selectedCompany.replace(/\s/g, "")}`);
  }, [selectedCompany]);
  
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = TABLEAU_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (vizRef.current) {
      vizRef.current.setAttribute("src", dashboardLinks[selectedCompany]); 
    }
  }, [selectedCompany]);

  return (
    <Box sx={{ padding: 3 }}>
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
      Dashboard
    </Typography>

      <Typography variant="body1" paragraph>
        Select a company to view its Tableau dashboard:
      </Typography>

    {/* Dropdown to select the company */}
    <Select
      value={selectedCompany}
      onChange={(e) => setSelectedCompany(e.target.value)}
      sx={{ mb: 2, width: "200px" }} 
    >
      {Object.keys(dashboardLinks).map((company) => (
        <MenuItem key={company} value={company}>
          {company}
        </MenuItem>
      ))}
    </Select>

      <Box
          sx={{
            display: "flex",
            justifyContent: "center", 
            alignItems: "center", 
            width: "100vw", 
            height: "100vh", 
            overflow: "hidden", 
          }}
        >
          <tableau-viz
            ref={vizRef}
            src={dashboardLinks[selectedCompany]}
            toolbar="bottom"
            hide-tabs
            style={{
              width: "90vw", 
              maxWidth: "1400px", 
              height: "100vh", 
            }}
          ></tableau-viz>
        </Box>
        <FunFactsCarousel apiCall={apiCall} />    
    </Box>


  );
};

export default Dashboard;
