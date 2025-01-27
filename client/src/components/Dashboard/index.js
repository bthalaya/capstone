import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
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

const Dashboard = () => {
  useEffect(() => {
    // Ensure the Tableau embed script is loaded
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    scriptElement.async = true;
    document.body.appendChild(scriptElement);
    return () => {
      // Clean up script if necessary
      document.body.removeChild(scriptElement);
    };
  }, []);

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to your dashboard! Here’s where you can manage your data and see insights.
        </Typography>

        {/* Embed Tableau Dashboard */}
        <div
          className="tableauPlaceholder"
          id="viz1737956560654"
          style={{ position: 'relative', width: '1200px', height: '900px', margin: '0 auto' }}
          dangerouslySetInnerHTML={{
            __html: `
              <noscript>
                <a href='#'>
                  <img alt='BP Test Dashboard' src='https://public.tableau.com/static/images/Bo/Book1_17375230550260/BPTestDashboard/1_rss.png' style='border: none' />
                </a>
              </noscript>
              <object class='tableauViz' style='width:1200px; height:900px;'>
                <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
                <param name='embed_code_version' value='3' />
                <param name='site_root' value='' />
                <param name='name' value='Book1_17375230550260&#47;BPTestDashboard' />
                <param name='tabs' value='no' />
                <param name='toolbar' value='yes' />
                <param name='static_image' value='https://public.tableau.com/static/images/Bo/Book1_17375230550260/BPTestDashboard/1.png' />
                <param name='animate_transition' value='yes' />
                <param name='display_static_image' value='yes' />
                <param name='display_spinner' value='yes' />
                <param name='display_overlay' value='yes' />
                <param name='display_count' value='yes' />
                <param name='language' value='en-US' />
                <param name='filter' value='publish=yes' />
              </object>
            `,
          }}
        ></div>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

