const sql = require("mssql");
const config = require("./config.js");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");

admin.initializeApp({
  credential: admin.credential.cert(
    require("./capstone-bca8d-firebase-adminsdk-wrfn0-f8005f8ac0.json")
  ),
  storageBucket: "capstone-bca8d.firebasestorage.app", // This should match the bucket URL in Firebase Console
});

const bucket = admin.storage().bucket();
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "client/build")));
app.use(cors());

// Configure Multer for file upload
const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({ storage: storage }); // Create upload middleware

// Add document API to handle file uploads
app.post("/api/addDocument", upload.single("document"), async (req, res) => {
  try {
    // Log the request body to check if it's correctly received
    console.log("RequestBody:", req.body);
    console.log("File details:", req.file);

    const {
      company_name,
      report_year,
      document_source_link,
      user_id,
      server_location,
      report_type,
    } = req.body;

    // Upload the file to Firebase Storage
    const file = req.file;
    const fileName = Date.now() + file.originalname; // Unique filename (timestamp + original name)
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(file.buffer);

    // Get the public URL of the uploaded file
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Connect to the database
    const pool = await sql.connect(config);
    await pool
      .request()
      .input("company_name", sql.VarChar, company_name)
      .input("report_year", sql.Int, report_year)
      .input("document_source_link", sql.VarChar, fileUrl) // Store Firebase URL
      .input("user_id", sql.Int, user_id)
      .input("server_location", sql.VarChar, server_location)
      .input("report_type", sql.VarChar, report_type).query(`
        INSERT INTO documents (company_name, report_year, document_source_link, user_id, server_location, report_type)
        VALUES (@company_name, @report_year, @document_source_link, @user_id, @server_location, @report_type)
      `);

    res.send({ message: "Document successfully added", fileUrl });
  } catch (error) {
    console.error("error3", error);
    res.status(500).send(error.message);
  } finally {
    sql.close();
  }
});

// Start the server
app.listen(port, () => console.log(`Listening on port ${port}`));
