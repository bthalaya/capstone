import React, { useState, useEffect, useCallback } from "react";
import {
  InputAdornment,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Search,
  ArrowDropDown,
  ArrowDropUp,
  CommitOutlined,
} from "@mui/icons-material";
import { CloudUpload } from "@mui/icons-material";
import { initializeApp } from "firebase/app";
import { Notifications, Settings, AccountCircle } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import store from "../../store";
import { useHistory } from "react-router-dom";
import "@fontsource/lato";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadPdf } from "./openaiService";

const serverURL = "http://localhost:5000"; // Your server URL
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // Load from .env.local

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
  const [companyName, setCompanyName] = useState("");
  const [reportYear, setReportYear] = useState("");
  const [reportName, setReportName] = useState("");
  const [documentURL, setDocumentURL] = useState("");
  const [file, setFile] = useState(null); // File upload state
  const userId = 1; // Hardcoded user ID
  const [searchQuery, setSearchQuery] = useState("");
  const [reportYearQuery, setReportYearQuery] = useState("All years");
  const [uploadDateQuery, setUploadDateQuery] = useState("All time");
  const [reportTypeQuery, setReportTypeQuery] = useState("All reports");
  const [filteredDocuments, setFilteredDocuments] = useState(data);
  const history = useHistory();
  const [value, setValue] = React.useState(0);
  const [localFile, setLocalFile] = useState(null);
  const [fileURL, setFileURL] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  let [profile, setProfile] = React.useState([]);

  useEffect(() => {
    loadApiGetProfiles();
  }, []);

  const handleChange = (newValue) => {
    history.push(`${newValue}`);
    console.log(newValue);
    setValue(newValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLocalFile(file); // Store file in state

    // Create a local object URL to preview the file
    const url = URL.createObjectURL(file);
    setFileURL(url);
  };

  const loadApiGetProfiles = async () => {
    const userNameGlobal = store.getState().user.userNameGlobal;

    try {
      const checkResponse = await fetch(
        `${serverURL}/api/getProfile?username=${userNameGlobal}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = await checkResponse.json();
      console.log("Profile data:", checkData);

      // Update profile state with the fetched data
      if (checkResponse.status === 200) {
        setProfile(checkData); // Set profile data
      } else {
        console.log("User not found or error fetching profile");
        handleChange("/SignIn");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const filterDocuments = useCallback(() => {
    let filtered = [...data];

    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.report_year.toString().includes(searchQuery) ||
          doc.report_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (reportYearQuery && reportYearQuery !== "All years") {
      filtered = filtered.filter(
        (doc) => doc.report_year.toString() === reportYearQuery
      );
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
    setData(data.documents);
  };

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleSubmit = async () => {
    if (!localFile) {
      alert("Please select a file before submitting.");
      return;
    }

    const storage = getStorage();
    const fileRef = ref(
      storage,
      `uploads/${companyName}_${reportYear}_${reportName}.pdf`
    );

    let firebaseFileURL = "";
    try {
      // ✅ Step 1: Upload to Firebase Storage
      const snapshot = await uploadBytes(fileRef, localFile);
      console.log("📂 Uploaded to Firebase:", snapshot);

      // ✅ Step 2: Get the Firebase URL
      const firebaseFileURL = await getDownloadURL(fileRef);
      console.log("🔗 File available at:", firebaseFileURL);

      // ✅ Step 3: Upload the actual file to OpenAI for processing
      try {
        console.log("🚀 Uploading file to OpenAI for summarization...");
        await uploadPdf(localFile);
        alert("File uploaded & sent to OpenAI successfully! ✅");
      } catch (error) {
        console.error("OpenAI file upload failed:", error);
        alert("Failed to summarize file.");
      }

      // alert("File uploaded & sent to OpenAI successfully! ✅");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed.");
    }

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

      //i removed/hardcoded for testing purposes u can change it back
      if (companyName === "OMV") {
        try {
          let extractedMarkdown = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 50; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}.
You will be creating 3 tables: Actions, Progress, and Targets. These tables will capture a company's sustainability and climate change initiatives. Please follow the guidelines below to ensure accurate and relevant data extraction.

Task 1: Create the Actions Table

Focus: Identify current initiatives or activities the company is undertaking right now towards sustainability, specifically related to climate change mitigation.
Content: Include actions such as reducing Scope 1, 2, and 3 emissions, improving energy efficiency, lowering carbon emissions, and implementing green data practices.
Format:
Action_ID: Auto-generate
Action: Exact wording of the action from the report, focusing strictly on climate-related initiatives.
Task 2: Create the Progress Table

Focus: Extract achievements or efforts made by the company in the year of the report specifically related to sustainability and climate change.
Content: Include progress related to reducing Scope 1, 2, and 3 emissions, enhancing energy efficiency, decreasing carbon emissions, and advancing green data initiatives.
Format:
Progress_ID: Auto-generate
Progress Description: Exact wording of the progress description, adapted to a neutral perspective, focusing on climate-related progress.
Task 3: Create the Targets Table

Focus: Identify future goals or objectives the company aims to achieve in upcoming years regarding sustainability and climate change.
Content: Include targets related to reducing Scope 1, 2, and 3 emissions, improving energy efficiency, lowering carbon emissions, and implementing green data practices.
Format:
Target_ID: Auto-generate
Target Description: Exact wording of the target as listed in the report, focusing on climate-related targets.
Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}.  

General Guidelines:

Ensure all extracted information is verbatim from the report to maintain accuracy.
Avoid using possessive terms like "our" or "we"; instead, use "they" or the company's name.
This template is designed to be used for any company's sustainability report, with a focus on climate change initiatives.
Do not repeat information across tables. Place each point in only one of the three buckets.
NOTE: Include only the most relevant and most important points related only to green initiatives and climate change, do not include other irrelevant stuff please!
Do not make up any information. If the report lacks information in these tables, keep it blank. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
DO NOT give any additional details other than just the JSON object, to be clear JSON object only with no additional info/text for context`; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            // const answerData = await answerResponse.json();
            // answerText += answerData.answer + "\n";
            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            // ✅ Remove triple backticks (` ```json ... ``` `) and parse JSON
            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "BP" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; 

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "ENI" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          let answerText = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "Equinor" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          let answerText = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "Puma" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          let answerText = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "Repsol" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          let answerText = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }
      if (companyName === "TotalEnergies" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          let answerText = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "Shell" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          // Step 1: Call /api/ocr to get the extracted markdown
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (companyName === "Cepsa" && reportName === "Sustainability Report") {
        try {
          let extractedMarkdown = "";
          for (let page = 50; page <= 54; page++) {
            const ocrResponse = await fetch(serverURL + "/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                documentUrl: documentURL,
                pages: [page],
              }),
            });

            const ocrData = await ocrResponse.json();
            console.log("ocrData: " + ocrData.markdown);

            if (!ocrData || !ocrData.markdown) {
              console.error(
                "Error: No markdown data received from OCR. Response:",
                ocrData
              );
              return;
            }
            extractedMarkdown += ocrData.markdown + "\n";
            // Step 2: Call /api/chat with the extracted markdown and the desired question
            const question = `Extract all data related to OMV's climate change initiatives and progress from the provided markdown text ${ocrData.markdown}. Organize the information into two JSON objects: one for cliamte change achievements and another for planned climate change initiatives for the future. Each JSON object should include categories such as the following categories: Carbon Emissions Reduction, Leak Detection and Repair, Energy Efficiency and Renewable Energy, Low- and Zero-Carbon Products, Carbon Capture and Storage, and Offsetting Emissions. Ensure that each entry in the JSON objects specifies the category, even if it is repetitive. Each entry should include the category, initiative, and its corresponding achievement or planned action with as much detail as possible. Format the response in a way that is easy to input into an SQL database, using a clear structure with fields for category, initiative, and details. 
          `; // Your question here

            const answerResponse = await fetch(serverURL + "/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: question,
                markdownText: extractedMarkdown,
              }),
            });

            const answerData = await answerResponse.json();

            if (!answerData || !answerData.answer) {
              console.error(`No answer received for Page ${page}. Skipping...`);
              continue;
            }

            const cleanedAnswer = answerData.answer
              .replace(/```json\n?/, "")
              .replace(/\n?```/, "");

            try {
              const parsedAnswer = JSON.parse(cleanedAnswer);

              const actionsArray = parsedAnswer.Actions;
              const progressArray = parsedAnswer.Progress;
              const targetsArray = parsedAnswer.Targets; // Extracting Actions array

              for (const action of actionsArray) {
                const actions = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: action.Action// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertActions",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(actions),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "Action added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add action:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of progressArray) {
                const progress = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Progress // Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertProgress",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(progress),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "progress added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error(
                      "Failed to add progress:",
                      submitData.message
                    );
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }

              for (const item of targetsArray) {
                const targets = {
                  companyName: companyName,
                  report_year: reportYear,
                  companyData: item.Target// Send each action as an array with a single element
                };

                // Making the API call for each action
                try {
                  const submitActions = await fetch(
                    serverURL + "/api/insertTargets",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(targets),
                    }
                  );

                  const submitData = await submitActions.json();
                  if (submitData.success) {
                    console.log(
                      "targets added successfully:",
                      submitData.message
                    );
                  } else {
                    console.error("Failed to add targets:", submitData.message);
                  }
                } catch (error) {
                  console.error("Error in API call:", error);
                }
              }
            } catch (error) {
              console.error(`🚨 JSON Parsing Error on Page ${page}:`, error);
            }
          }
        } catch (error) {
          console.error("Error processing document or question:", error);
        }
      }

      if (submitData.success) {
        alert("Document successfully added to the system!");
        // Reset form values after submission
        setCompanyName("");
        setReportYear("");
        setReportName("");
        setDocumentURL("");
        setFile(null);
        setOpenDialog(false);
      } else {
        alert("An error occurred while adding the document. Please try again.");
      }
    }
  };

  const reportNamesByCompany = {
    BP: ["Factbook", "Sustainability Report"],
    Cepsa: ["Sustainability Report", "Annual Report"],
    ENI: ["Progress Report", "Sustainability Report"],
    Equinor: ["Sustainability Report", "Annual Report"],
    OMV: ["Progress Report", "Factbook"],
    Puma: ["Sustainability Report", "Financial Report"],
    Repsol: ["Sustainability Report", "Factbook"],
    Shell: ["Sustainability Report", "Annual Report"],
    TotalEnergies: ["Sustainability Report", "Factbook"],
  };

  const handleSort = (column) => {
    // Determine sorting direction
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
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
      if (column === "type" || column === "name") {
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
          fontFamily: "Lato, sans-serif", // Use Lato font
          fontWeight: 700, // Font weight for h1
          fontSize: "2.5rem", // Font size
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
          fontFamily: "Lato, sans-serif",
          fontWeight: 600,
          fontSize: "1.5rem",
        }}
      >
        {profile && profile.profile && profile.profile.first_name
          ? `Welcome, ${
              profile.profile.first_name.charAt(0).toUpperCase() +
              profile.profile.first_name.slice(1)
            }! `
          : "Welcome! "}
        <span role="img" aria-label="waving">
          👋
        </span>
      </Typography>

      {/* Search Bar and Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Search Bar */}
        <TextField
          placeholder="Search by file name, company, year, or type"
          style={{
            width: "50%",
            height: "50px",
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        <FormControl style={{ minWidth: 150, marginTop: "1rem" }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            label="Report Type"
            value={reportTypeQuery}
            onChange={(e) => setReportTypeQuery(e.target.value)}
          >
            {[
              "All reports",
              "Factbook",
              "Form 20",
              "Progress Report",
              "URD",
              "CDP",
              "Annual Report & Form 20",
              "Sustainability Report",
              "Advancing The Energy Transition",
              "ESG Datasheet",
              "Net Zero Report",
              "Sustainability Performance",
              "Annual Report",
              "Path to Decarbonization",
              "Carbon Neutrality",
              "Just Transition",
              "Climate Review",
              "Energy Transition",
              "Financial Statements",
              "Results",
              "Financial Report",
              "ESG Report",
            ].map((type, index) => (
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
            {[
              "All years",
              "2023",
              "2022",
              "2021",
              "2020",
              "2019",
              "2018",
              "2017",
              "2016",
              "2015",
              "2014",
            ].map((year, index) => (
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
            {["All time", "Last Week", "Last Month", "Last Year"].map(
              (date, index) => (
                <MenuItem key={index} value={date}>
                  {date}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </div>

      {/* Popup for Adding New File */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New File</DialogTitle>
        <DialogContent>
        <FormControl fullWidth style={{ marginBottom: "1rem" }}>
        <InputLabel id="company-name-label">Company Name</InputLabel>
        <Select
          labelId="company-name-label"
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value);
            setReportName(""); // Reset Report Name when Company changes
          }}
        >
          <MenuItem value="" disabled>
            Select a company
          </MenuItem>
          {Object.keys(reportNamesByCompany).map((company) => (
            <MenuItem key={company} value={company}>
              {company}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {companyName && (
          <>
            <TextField
              label="Report Year"
              fullWidth
              style={{ marginBottom: "1rem" }}
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
            />
            
            <FormControl fullWidth style={{ marginBottom: "1rem" }}>
              <InputLabel id="report-name-label">Report Name</InputLabel>
              <Select
                labelId="report-name-label"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              >
                <MenuItem value="" disabled>Select a report type</MenuItem>
                {reportNamesByCompany[companyName].map((report) => (
                  <MenuItem key={report} value={report}>{report}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
          )}
          <TextField
            label="Document URL"
            fullWidth
            style={{ marginBottom: "1rem" }}
            value={documentURL}
            onChange={(e) => setDocumentURL(e.target.value)}
          />
          {/* <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: "1rem" }}
          /> */}
          {/* File Input */}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ marginBottom: "1rem" }}
          />
          {/* PDF Preview (Only show if file is selected) */}
          {fileURL && (
            <iframe
              src={fileURL}
              width="100%"
              height="400px"
              title="PDF Preview"
              style={{
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginTop: "1rem",
              }}
            ></iframe>
          )}
          /* Download PDF Button */
          {fileURL && (
            <a href={fileURL} download="uploaded-file.pdf">
              <button
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#7F9E50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Download PDF
              </button>
            </a>
          )}
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
          fontFamily: "Lato, sans-serif",
          fontWeight: 500,
          fontSize: "1.5rem",
          marginTop: 15,
        }}
      >
        All Files
      </Typography>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem",
                borderBottom: "2px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => handleSort("name")}
            >
              Name {renderSortIcon("name")}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem",
                borderBottom: "2px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => handleSort("year")}
            >
              Report Year {renderSortIcon("year")}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem",
                borderBottom: "2px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => handleSort("type")}
            >
              Report Type {renderSortIcon("type")}
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "0.5rem",
                borderBottom: "2px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => handleSort("date")}
            >
              Upload Date {renderSortIcon("date")}
            </th>
            <th
              style={{ padding: "0.5rem", borderBottom: "2px solid #ccc" }}
            ></th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((row, index) => (
            <tr key={index}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
                {row.company_name}
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
                {row.report_year}
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
                {row.report_type}
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #eee" }}>
                {new Date(row.date).toISOString().split("T")[0]}
              </td>
              <td
                style={{
                  textAlign: "center",
                  padding: "0.5rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                ⋮
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageFiles;
