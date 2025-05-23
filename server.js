const sql = require("mssql"); // Use mssql instead of mysql
const config = require("./config.js");
const express = require("express");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const { OpenAI } = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import CORS
const FormData = require("form-data");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { Client } = require("ssh2");
const multer = require("multer");
const fetch = require("node-fetch"); // Install with: npm install node-fetch@2
const { uploadPdfToOpenAI, summarizeFile } = require("./openaiHelper");

const upload = multer({ dest: "uploads/" }); // Temporary storage for files

app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Add this middleware for logging requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "client/build")));
app.use(cors());

const sshConfig = {
  host: "129.97.25.155",
  port: 22, // Default SSH port
  username: "a4fyfe", // Replace with your actual username
  password: "0iLr!G$1", // Replace with your actual password
};

app.get("/api/get-file-paths", (req, res) => {
  const conn = new Client();

  conn
    .on("ready", () => {
      console.log("SSH Connection established");

      // Adjust path as per your server structure
      const directoryPath = "/DATA/caps/reports/BP/2016"; // Update with the correct directory path

      // List files in the directory and include the full path
      conn.exec(`ls ${directoryPath}`, (err, stream) => {
        // The command lists files in the given directory
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Failed to fetch file paths" });
        }

        let filePaths = "";
        stream.on("data", (data) => {
          filePaths += data.toString();
        });

        stream.on("close", (code, signal) => {
          console.log("Stream closed");
          conn.end();

          // Split the response and prepend the directory path to each file name
          const files = filePaths.split("\n").filter(Boolean); // Remove empty values from the list
          const fullPaths = files.map((file) => `${directoryPath}/${file}`); // Create full paths

          res.json({ filePaths: fullPaths });
        });
      });
    })
    .on("error", (err) => {
      console.log("Error with SSH connection", err);
      res.status(500).json({ error: "Failed to connect to the server" });
    })
    .connect(sshConfig);
});

app.post("/api/uploadToOpenAI", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = req.file.originalname;

    console.log("📄 Uploading to OpenAI:", fileName);

    const fileId = await uploadPdfToOpenAI(fileBuffer, fileName);
    fs.unlinkSync(filePath); // Remove the temp file after upload

    if (!fileId)
      return res.status(500).json({ error: "Failed to upload to OpenAI" });

    // Get the summary
    const summary = await summarizeFile(fileId);
    if (!summary)
      return res.status(500).json({ error: "Failed to summarize PDF" });

    res.json({ success: true, summary });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Keep loadUserSettings API
app.post("/api/loadUserSettings", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const userID = req.body.userID;
    const result = await pool
      .request()
      .input("userID", sql.Int, userID)
      .query("SELECT mode FROM [user] WHERE userID = @userID");

    res.send({ express: JSON.stringify(result.recordset) });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.post("/api/addProfile", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { first_name, last_name, email_address, username, password } =
      req.body;

    // Check if the username already exists
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");
    if (result.recordset.length > 0) {
      return res
        .status(400)
        .send({ success: false, message: "Username already exists" });
    }

    // Insert the new user
    await pool
      .request()
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("email_address", sql.VarChar, email_address)
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password).query(`
        INSERT INTO users (first_name, last_name, email_address, username, password)
        VALUES (@first_name, @last_name, @email_address, @username, @password)
      `);

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Error registering user" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { username, password } = req.body;

    // Query the database for the user with the provided credentials
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password).query(`
        SELECT * FROM users
        WHERE username = @username 
          AND password = @password
      `);

    // Check if a record was returned
    if (result.recordset.length > 0) {
      res.status(200).send({ exists: true, user: result.recordset[0] });
    } else {
      res.status(200).send({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: "Error checking user credentials in the database." });
  } finally {
    sql.close();
  }
});

app.get("/api/getProfile", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { username } = req.query;

    // Query the database for the user by username
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username).query(`
        SELECT * 
        FROM capstone.dbo.users
        WHERE username = @username
      `);

    // Check if the user was found
    if (result.recordset.length > 0) {
      res.status(200).send({ profile: result.recordset[0] });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Failed to fetch profile" });
  } finally {
    sql.close();
  }
});

// New endpoint to add a document
app.post("/api/addDocument", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const {
      company_name,
      report_year,
      document_source_link,
      user_id,
      server_location,
      report_type,
    } = req.body;

    await pool
      .request()
      .input("company_name", sql.VarChar, company_name)
      .input("report_year", sql.Int, report_year)
      .input("document_source_link", sql.VarChar, document_source_link)
      .input("user_id", sql.Int, user_id)
      .input("server_location", sql.VarChar, server_location)
      .input("report_type", sql.VarChar, report_type).query(`
        INSERT INTO documents (company_name, report_year, document_source_link, user_id, server_location, report_type)
        VALUES (@company_name, @report_year, @document_source_link, @user_id, @server_location, @report_type)
      `);

    res.send({ message: "Document successfully added" });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.post("/api/checkDocument", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { company_name, report_year, report_type } = req.body;

    const result = await pool
      .request()
      .input("company_name", sql.VarChar, company_name)
      .input("report_year", sql.Int, report_year)
      .input("report_type", sql.VarChar, report_type).query(`
        SELECT * FROM documents
        WHERE company_name = @company_name 
          AND report_year = @report_year
          AND report_type = @report_type
      `);

    if (result.recordset.length > 0) {
      res.status(200).send({ exists: true, document: result.recordset[0] });
    } else {
      res.status(200).send({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error checking document in the database." });
  } finally {
    sql.close();
  }
});

// New endpoint to get all documents
app.get("/api/getDocuments", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM documents
      ORDER BY company_name, report_year, report_type
    `);

    res.send({ documents: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getShell", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Shell
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getCepsa", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Cepsa
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getBP", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_BP
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getEquinor", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Equinor
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getOMV", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_OMV
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getPuma", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Puma
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getRepsol", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Repsol
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getEni", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Eni
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getTE", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_TE
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.get("/api/getRepsol", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT * FROM Fun_Facts_Repsol
    `);

    const funFacts = result.recordset.map((row) => ({
      id: row.ID,
      text: row.Fact,
      year: row.Year,
      type: row.Type,
    }));

    res.json(funFacts); // Match format of /api/companies
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// Endpoint to get unique company names
app.get("/api/companies", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("SELECT DISTINCT company_name FROM documents");
    res.json(result.recordset); // Return only the rows
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close(); // Close the pool
  }
});

// Endpoint to get unique report years for a specific company
app.get("/api/report-years", async (req, res) => {
  try {
    const { companyName } = req.query;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("companyName", sql.VarChar, companyName) // Use .input to bind parameters
      .query(
        "SELECT DISTINCT report_year FROM documents WHERE company_name = @companyName"
      );
    res.json(result.recordset); // Return only the rows
  } catch (error) {
    console.error("Error fetching report years:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// Endpoint to get unique report types for a specific company and year
app.get("/api/report-types", async (req, res) => {
  try {
    const { companyName, reportYear } = req.query;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("companyName", sql.VarChar, companyName) // Bind companyName parameter
      .input("reportYear", sql.Int, reportYear) // Bind reportYear parameter
      .query(
        "SELECT DISTINCT report_type FROM documents WHERE company_name = @companyName AND report_year = @reportYear"
      );
    res.json(result.recordset); // Return only the rows
  } catch (error) {
    console.error("Error fetching report types:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// Endpoint to fetch server_location based on dropdown menu options
app.get("/api/server-location", async (req, res) => {
  try {
    const { companyName, reportYear, reportType } = req.query;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("companyName", sql.VarChar, companyName) // Bind companyName parameter
      .input("reportYear", sql.Int, reportYear) // Bind reportYear parameter
      .input("reportType", sql.VarChar, reportType) // Bind reportType parameter
      .query(`
        SELECT server_location 
        FROM documents 
        WHERE company_name = @companyName AND report_year = @reportYear AND report_type = @reportType
      `);
    if (result.recordset.length > 0) {
      res.json({ serverLocation: result.recordset[0].server_location });
    } else {
      res.status(404).send("No matching document found");
    }
  } catch (error) {
    console.error("Error fetching server location:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.post("/api/get-file-content", (req, res) => {
  const { filePath } = req.body; // File path received from frontend
  console.log("Fetching file from:", filePath);

  const ssh = new Client();
  ssh
    .on("ready", () => {
      // Create a writable stream to save the file content locally
      const localPath = path.join(__dirname, "temp", path.basename(filePath)); // Store temporarily
      console.log(localPath);
      const writeStream = fs.createWriteStream(localPath);

      ssh.sftp((err, sftp) => {
        if (err) {
          res.status(500).send("Error with SFTP");
          return;
        }

        sftp.fastGet(filePath, localPath, (err) => {
          if (err) {
            res.status(500).send("Error downloading file");
            return;
          }

          console.log(`File downloaded to ${localPath}`);
          res.json({ content: localPath });

          // Cleanup (optional) - delete the file after processing
          //fs.unlinkSync(localPath);
          ssh.end();
        });
      });
    })
    .connect({
      host: "129.97.25.155",
      port: 22,
      username: process.env.SERVER_USERNAME,
      password: process.env.SERVER_PASSWORD,
    });
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/ocr", async (req, res) => {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ message: "API key is missing" });
  }

  const { documentUrl, pages } = req.body;
  console.log("Processing Page" + pages);
  const body = JSON.stringify({
    model: "mistral-ocr-latest",
    id: "unique-request-id",
    document: {
      type: "document_url",
      document_url: documentUrl,
      document_name: "Example Document",
    },
    pages: pages,
    include_image_base64: true,
    image_limit: null,
    image_min_size: null,
  });

  try {
    // Step 1: Call the OCR API
    const response = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: body,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      return res
        .status(response.status)
        .json({ message: "Error processing OCR", error: errorMessage });
    }

    const ocrResponse = await response.json();
    const extractedText = ocrResponse.pages
      ? ocrResponse.pages.map((page) => page.markdown || "").join("\n")
      : "";

    if (!extractedText) {
      return res
        .status(400)
        .json({ message: "No text extracted from the document." });
    }

    // Return the cleaned markdown text
    res.json({ markdown: extractedText });
  } catch (error) {
    console.error("OCR Error:", error);
    res
      .status(500)
      .json({ message: "Error processing OCR", error: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  console.log("Received request at /api/answer-question");

  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ message: "API key is missing" });
  }

  const { question, markdownText } = req.body;

  if (!markdownText || !question) {
    return res
      .status(400)
      .json({ message: "Both question and markdown text are required" });
  }

  const prompt = `${question}`;

  const chatBody = {
    model: "mistral-small-latest",
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    const chatResponse = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(chatBody),
      }
    );

    if (!chatResponse.ok) {
      const errorMessage = await chatResponse.text();
      return res
        .status(chatResponse.status)
        .json({ message: "Error processing Chat Model", error: errorMessage });
    }

    const chatResult = await chatResponse.json();
    const finalText =
      chatResult.choices?.[0]?.message?.content ||
      "No response from chat model.";

    res.json({ answer: finalText });
  } catch (error) {
    console.error("Chat Model Error:", error);
    res
      .status(500)
      .json({ message: "Error processing Chat Model", error: error.message });
  }
});

app.post("/api/insertActions", async (req, res) => {
  const { companyName, report_year, companyData} = req.body;
  const tableName = `capstone.dbo.Fun_Facts_${companyName}`;
  let pool;

  try {

    if (!companyData || companyData.trim() === "") {
      return res.status(400).json({ success: false, message: "No data provided to insert." });
    }
    
    // Connect to the database
    pool = await sql.connect(config);
    const request = new sql.Request(pool);



    // Insert the action into the dynamically named table
    await request
      .input("Fact", sql.VarChar(256), companyData) // The action itself
      .input("Type", sql.VarChar(50), "Action") // Type will always be "Action"
      .input("Year", sql.Int, report_year) // The report year
      .query(`
        INSERT INTO ${tableName} (Fact, [Type], [Year])
        VALUES (@Fact, @Type, @Year)
      `);

    res.json({ success: true, message: "Action added successfully." });
  } catch (error) {
    console.error("Error inserting action:", error);
    res.status(500).json({ success: false, message: "Server error." });
  } finally {
    // Ensure the connection is only closed when everything is done
    if (pool) {
      pool.close(); // Only close if pool was successfully created
    }
  }
});

app.post("/api/insertProgress", async (req, res) => {
  const { companyName, report_year, companyData} = req.body;
  const tableName = `capstone.dbo.Fun_Facts_${companyName}`;
  let pool;

  try {

    if (!companyData || companyData.trim() === "") {
      return res.status(400).json({ success: false, message: "No data provided to insert." });
    }

    // Connect to the database
    pool = await sql.connect(config);
    const request = new sql.Request(pool);

    // Insert the action into the dynamically named table
    await request // Using action ID
      .input("Fact", sql.VarChar(256), companyData) // The action itself
      .input("Type", sql.VarChar(50), "Progress") // Type will always be "Action"
      .input("Year", sql.Int, report_year) // The report year
      .query(`
        INSERT INTO ${tableName} (Fact, [Type], [Year])
        VALUES (@Fact, @Type, @Year)
      `);

    res.json({ success: true, message: "Progress added successfully." });
  } catch (error) {
    console.error("Error inserting Progress:", error);
    res.status(500).json({ success: false, message: "Server error." });
  } finally {
    // Ensure the connection is only closed when everything is done
    if (pool) {
      pool.close(); // Only close if pool was successfully created
    }
  }
});

app.post("/api/insertTargets", async (req, res) => {
  const { companyName, report_year, companyData } = req.body;
  const tableName = `capstone.dbo.Fun_Facts_${companyName}`;
  let pool;

  try {

    if (!companyData || companyData.trim() === "") {
      return res.status(400).json({ success: false, message: "No data provided to insert." });
    }
    // Connect to the database
    pool = await sql.connect(config);
    const request = new sql.Request(pool);

    // Insert the action into the dynamically named table
    await request // Using action ID
      .input("Fact", sql.VarChar(256), companyData) // The action itself
      .input("Type", sql.VarChar(50), "Target") // Type will always be "Action"
      .input("Year", sql.Int, report_year) // The report year
      .query(`
        INSERT INTO ${tableName} (Fact, [Type], [Year])
        VALUES (@Fact, @Type, @Year)
      `);

    res.json({ success: true, message: "Target added successfully." });
  } catch (error) {
    console.error("Error inserting Target:", error);
    res.status(500).json({ success: false, message: "Server error." });
  } finally {
    // Ensure the connection is only closed when everything is done
    if (pool) {
      pool.close(); // Only close if pool was successfully created
    }
  }
});

const PORT = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));
