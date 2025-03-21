const fetch = require("node-fetch"); // Ensure you have node-fetch installed

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to upload the file to OpenAI
async function uploadPdfToOpenAI(fileBuffer, fileName) {
  console.log("🔑 Using OpenAI API Key:", OPENAI_API_KEY);
  if (!OPENAI_API_KEY) {
    console.error("🚨 OpenAI API Key is missing!");
    return null;
  }
  try {
    const formData = new FormData();
    formData.append("file", fileBuffer, fileName);
    formData.append("purpose", "answers");

    const response = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    console.log("📂 OpenAI File Uploaded:", data);
    return data.id; // Return file ID for further processing
  } catch (error) {
    console.error("❌ Error uploading to OpenAI:", error);
    return null;
  }
}

// Function to summarize the uploaded PDF
async function summarizeFile(fileId) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are an AI that summarizes PDFs." },
          {
            role: "user",
            content: `What's this PDF about? (File ID: ${fileId})`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    console.log("📝 OpenAI Summary:", data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenAI Summarization Error:", error);
    return null;
  }
}

module.exports = { uploadPdfToOpenAI, summarizeFile };
