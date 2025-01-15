const sql = require('mssql'); // Use mssql instead of mysql
const config = require('./config.js');
const express = require("express");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const { OpenAI } = require('openai');
const bodyParser = require("body-parser");
const cors = require('cors');  // Import CORS
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const FormData = require('form-data');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { Client } = require("ssh2");
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));
app.use(cors());

const sshConfig = {
  host: '129.97.25.155',
  port: 22,  // Default SSH port
  username: 'a4fyfe',  // Replace with your actual username
  password: '0iLr!G$1',  // Replace with your actual password
};

app.get('/api/get-file-paths', (req, res) => {
  const conn = new Client();

  conn.on('ready', () => {
    console.log('SSH Connection established');

    // Adjust path as per your server structure
    const directoryPath = '/DATA/caps/reports/BP/2016';  // Update with the correct directory path

    // List files in the directory and include the full path
    conn.exec(`ls ${directoryPath}`, (err, stream) => {  // The command lists files in the given directory
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Failed to fetch file paths' });
      }

      let filePaths = '';
      stream.on('data', (data) => {
        filePaths += data.toString();
      });

      stream.on('close', (code, signal) => {
        console.log('Stream closed');
        conn.end();

        // Split the response and prepend the directory path to each file name
        const files = filePaths.split('\n').filter(Boolean);  // Remove empty values from the list
        const fullPaths = files.map(file => `${directoryPath}/${file}`); // Create full paths

        res.json({ filePaths: fullPaths });
      });
    });
  }).on('error', (err) => {
    console.log('Error with SSH connection', err);
    res.status(500).json({ error: 'Failed to connect to the server' });
  }).connect(sshConfig);
});

// Keep loadUserSettings API
app.post('/api/loadUserSettings', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const userID = req.body.userID;
    const result = await pool.request()
      .input('userID', sql.Int, userID)
      .query('SELECT mode FROM [user] WHERE userID = @userID');
    
    res.send({ express: JSON.stringify(result.recordset) });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// New endpoint to add a document
app.post('/api/addDocument', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { company_name, report_year, document_source_link, user_id, server_location, report_type } = req.body;
    
    await pool.request()
      .input('company_name', sql.VarChar, company_name)
      .input('report_year', sql.Int, report_year)
      .input('document_source_link', sql.VarChar, document_source_link)
      .input('user_id', sql.Int, user_id)
      .input('server_location', sql.VarChar, server_location)
      .input('report_type', sql.VarChar, report_type)
      .query(`
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

app.post('/api/checkDocument', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const { company_name, report_year, report_type } = req.body;

    const result = await pool.request()
      .input('company_name', sql.VarChar, company_name)
      .input('report_year', sql.Int, report_year)
      .input('report_type', sql.VarChar, report_type)
      .query(`
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
app.get('/api/getDocuments', async (req, res) => {
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

// Endpoint to get unique company names
app.get('/api/companies', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT DISTINCT company_name FROM documents');
    res.json(result.recordset); // Return only the rows
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close(); // Close the pool
  }
});

// Endpoint to get unique report years for a specific company
app.get('/api/report-years', async (req, res) => {
  try {
    const { companyName } = req.query;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('companyName', sql.VarChar, companyName) // Use .input to bind parameters
      .query('SELECT DISTINCT report_year FROM documents WHERE company_name = @companyName');
    res.json(result.recordset); // Return only the rows
  } catch (error) {
    console.error("Error fetching report years:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// Endpoint to get unique report types for a specific company and year
app.get('/api/report-types', async (req, res) => {
  try {
    const { companyName, reportYear } = req.query;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('companyName', sql.VarChar, companyName) // Bind companyName parameter
      .input('reportYear', sql.Int, reportYear) // Bind reportYear parameter
      .query('SELECT DISTINCT report_type FROM documents WHERE company_name = @companyName AND report_year = @reportYear');
    res.json(result.recordset); // Return only the rows
  } catch (error) {
    console.error("Error fetching report types:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// Endpoint to fetch server_location based on dropdown menu options
app.get('/api/server-location', async (req, res) => {
  try {
    const { companyName, reportYear, reportType } = req.query;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('companyName', sql.VarChar, companyName) // Bind companyName parameter
      .input('reportYear', sql.Int, reportYear) // Bind reportYear parameter
      .input('reportType', sql.VarChar, reportType) // Bind reportType parameter
      .query(`
        SELECT server_location 
        FROM documents 
        WHERE company_name = @companyName AND report_year = @reportYear AND report_type = @reportType
      `);
    if (result.recordset.length > 0) {
      res.json({ serverLocation: result.recordset[0].server_location });
    } else {
      res.status(404).send('No matching document found');
    }
  } catch (error) {
    console.error("Error fetching server location:", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.post('/api/get-file-content', (req, res) => {
  const { filePath } = req.body;  // File path received from frontend
  console.log('Fetching file from:', filePath);

  const ssh = new Client();
  ssh.on('ready', () => {
    // Create a writable stream to save the file content locally
    const localPath = path.join(__dirname, 'temp', path.basename(filePath));  // Store temporarily
    console.log(localPath);
    const writeStream = fs.createWriteStream(localPath);

    ssh.sftp((err, sftp) => {
      if (err) {
        res.status(500).send('Error with SFTP');
        return;
      }

      sftp.fastGet(filePath, localPath, (err) => {
        if (err) {
          res.status(500).send('Error downloading file');
          return;
        }

        console.log(`File downloaded to ${localPath}`);
        res.json({ content: localPath});

        // Cleanup (optional) - delete the file after processing
        //fs.unlinkSync(localPath);
        ssh.end();
      });
    });
  }).connect({
    host: '129.97.25.155',
    port: 22,
    username: process.env.SERVER_USERNAME,
    password: process.env.SERVER_PASSWORD,
  });
});


const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
});

// File upload and summarization endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    //console.log("Uploaded file info:", req.file);

    const { filePath } = req.body; // Get filePath from the request body
    if (!filePath) {
      return res.status(400).send("File path is required");
    }
    
    //const filePath = "C:\\Users\\15195\\Documents\\capstone\\capstone\\testFile.pdf";

    console.log("File path received from frontend:", filePath);
    
    const assistant = await openai.beta.assistants.create({
      name: "Financial Analyst Assistant",
      instructions: "You are an expert at analyzing files, what are the first words in the file?",
      //instructions: "Your response, no matter what file you get, is to not look at the file and simply say YES in all caps, nothing else",
      model: "gpt-4-turbo-preview",
      tools: [{ type: "file_search" }],
    });
  
  

  const financeDoc = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });
  
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content:
          "Sumarize the document",
        attachments: [{ file_id: financeDoc.id, tools: [{ type: "file_search" }] }],
      },
    ],
  });

  if (thread && thread.id) {
    const stream = openai.beta.threads.runs
      .stream(thread.id, { assistant_id: assistant.id })
      .on("textCreated", () => console.log("assistant >"))
      .on("toolCallCreated", (event) => console.log("assistant " + event.type))
      .on("messageDone", async (event) => {
        if (event.content[0].type === "text") {
          const { text } = event.content[0];
          const { annotations } = text;
          const citations = [];

          let index = 0;
          for (let annotation of annotations) {
            text.value = text.value.replace(annotation.text, "[" + index + "]");
            const { file_citation } = annotation;
            if (file_citation && file_citation.file_id) {
              const citedFile = await openai.files.retrieve(file_citation.file_id);
              citations.push("[" + index + "]" + citedFile.filename);
            }
            index++;
          }

          console.log(text.value);
          console.log(citations.join("\n"));
          res.json({ content: text.value});
        }
      });
  } else {
    console.error("Thread ID is missing");
  }

  } catch (error) {
    console.error("Error:", error);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}`));