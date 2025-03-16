import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Select, MenuItem, Card, CardContent,IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

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

const FunFactsCarousel = ({ apiCall }) => {
  const [funFacts, setFunFacts] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [filteredFacts, setFilteredFacts] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const CARDS_VISIBLE = 7;
  const ROTATION_INTERVAL = 5000;

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchFunFacts = async () => {
      try {
        const response = await fetch(apiCall);
        const data = await response.json();
        setFunFacts(shuffleArray(data.funFacts));
      } catch (error) {
        console.error("Error fetching fun facts:", error);
      }
    };
    fetchFunFacts();
  }, [apiCall]);

  useEffect(() => {
    if (funFacts.length === 0) return;
    const interval = setInterval(() => {
      setVisibleIndex((prevIndex) => (prevIndex + 1) % filteredFacts.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [filteredFacts.length]);

  useEffect(() => {
    let filtered = funFacts.filter(
      (fact) => (selectedYear === "All" || fact.year === selectedYear) &&
                (selectedType === "All" || fact.type === selectedType)
    );
    setFilteredFacts(filtered);
    setVisibleIndex(0);
  }, [selectedYear, selectedType, funFacts]);

  const getVisibleFacts = () => {
    if (filteredFacts.length === 0) return [];
    return filteredFacts
      .slice(visibleIndex, visibleIndex + CARDS_VISIBLE)
      .concat(filteredFacts.slice(0, Math.max(0, visibleIndex + CARDS_VISIBLE - filteredFacts.length)));
  };

  const getCardColor = (type) => {
    switch (type) {
      case "Action": return "#81C784";
      case "Progress": return "#DDEAF6";
      case "Target": return "#E9D8F4";
      default: return "#E0E0E0";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "left", width: "100%" }}>
  {/* Filter Controls */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2, justifyContent: "flex-start", width: "100%" }}>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <MenuItem value="All">All Years</MenuItem>
          {[...new Set(funFacts.map(fact => fact.year))].sort().map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
        <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <MenuItem value="All">All Types</MenuItem>
          {[...new Set(funFacts.map(fact => fact.type))].map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Carousel - Ensure it's placed directly below */}
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <IconButton onClick={() => setVisibleIndex((prevIndex) => (prevIndex === 0 ? filteredFacts.length - 1 : prevIndex - 1))}>
          <ArrowBackIos />
        </IconButton>

        <Box sx={{ display: "flex", gap: 1, overflow: "hidden", width: "100%", justifyContent: "center" }}>
          {getVisibleFacts().map((fact, index) => (
            <Card
              key={`${fact.id}-${index}`}
              sx={{
                minWidth: 180,
                maxWidth: 180,
                height: 140,
                backgroundColor: getCardColor(fact.type),
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 0.5,
                margin: 0,
              }}
            >
              <CardContent
                sx={{
                  transition: "font-size 0.3s ease",
                  fontSize: "8px",
                  padding: "4px",
                  "&:hover": { fontSize: "12px", whiteSpace: "normal" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "16px",
                    lineHeight: "1.2",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    textAlign: "left",
                    "&:hover": {
                      fontSize: "12px",
                      lineHeight: "1.1",
                      WebkitLineClamp: "unset",
                      whiteSpace: "normal",
                    },
                  }}
                >
                  {fact.text}
                </Typography>
                <br />
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>Year: </Typography>
                <Typography variant="caption">{fact.year}</Typography>
                <br />
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>Type: </Typography>
                <Typography variant="caption">{fact.type}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <IconButton onClick={() => setVisibleIndex((prevIndex) => (prevIndex + 1) % filteredFacts.length)}>
          <ArrowForwardIos />
        </IconButton>
      </Box>
    </Box>
  );
};


const TABLEAU_SCRIPT_URL = "https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js";

// Define company-specific Tableau dashboard links
const dashboardLinks = {
  "Total Energies": "https://public.tableau.com/views/TEMetrics_17418767531310/Dashboard1",
  "BP": "https://public.tableau.com/views/BPMetrics/Dashboard1",
  "Shell": "https://public.tableau.com/views/ShellMetrics/Dashboard1",
  "Cepsa": "https://public.tableau.com/views/CepsaMetrics/Dashboard1",
  "Puma": "https://public.tableau.com/views/PumaMetrics/Dashboard1",
  "Eni": "https://public.tableau.com/views/EniMetrics/Dashboard1",
  "OMV": "https://public.tableau.com/views/OMVMetrics/Dashboard1",
  "Equinor": "https://public.tableau.com/views/EquinorMetrics/Dashboard1",
  "Repsol": "https://public.tableau.com/views/RepsolMetrics/Dashboard1",
};

const Dashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState("BP");
  const vizRef = useRef(null); // Reference to <tableau-viz>

  // ✅ Load Tableau API v3 script ONCE when component mounts
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

  // ✅ Update the Tableau visualization when `selectedCompany` changes
  useEffect(() => {
    if (vizRef.current) {
      vizRef.current.setAttribute("src", dashboardLinks[selectedCompany]); // Update src dynamically
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

      <br></br>
      <FunFactsCarousel apiCall={"/api/getTE"}></FunFactsCarousel>
      <br></br>

      <Typography variant="body1" paragraph>
        Select a company to view its Tableau dashboard:
      </Typography>

      {/* Dropdown to select the company */}
      <Select
        value={selectedCompany}
        onChange={(e) => setSelectedCompany(e.target.value)}
        sx={{ mb: 2, width: "300px" }}
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
            justifyContent: "center", // Centers horizontally
            alignItems: "center", // Centers vertically (if needed)
            width: "100vw", // Full width of viewport
            height: "100vh", // Full height of viewport
            overflow: "hidden", // Prevents scrollbars if Tableau resizes weirdly
          }}
        >
          <tableau-viz
            ref={vizRef}
            src={dashboardLinks[selectedCompany]}
            toolbar="bottom"
            hide-tabs
            style={{
              width: "90vw", // Makes it more responsive
              maxWidth: "1400px", // Adjust as needed
              height: "100vh", // Ensures visibility
            }}
          ></tableau-viz>
        </Box>
    </Box>
  );
};

export default Dashboard;


{/* Rotating Fun Facts - Circular Loop */}
        //<FunFactsCarousel apiCall={apiCall} />