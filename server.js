const sql = require('mssql'); // Use mssql instead of mysql
const config = require('./config.js');
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require('cors');  // Import CORS

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

app.get('/api/getTestApiKey', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT api_key FROM api_keys WHERE service_name = 'Test'
    `);

      res.send({ apiKey: result.recordset[0].api_key });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
