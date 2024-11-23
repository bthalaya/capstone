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

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));
app.use(cors());

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

   const openai = new OpenAI({
      apiKey: "PUT IT HERE",
    });

// File upload and summarization endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {

    const assistant = await openai.beta.assistants.create({
      name: "Financial Analyst Assistant",
      instructions: "You are an expert assistant, summarize any documents you see",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });
  
  const filePath = req.file.path;

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