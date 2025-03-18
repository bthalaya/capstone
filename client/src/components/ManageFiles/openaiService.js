const fetch = require("node-fetch");
const FormData = require("form-data");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Load from .env

// ✅ Upload a PDF file to OpenAI
export const uploadPdfToOpenAI = async (file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("purpose", "answers"); // Required by OpenAI

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await response.json();
  if (!data.id) throw new Error("Failed to upload file to OpenAI");
  return data.id;
};

// ✅ Summarize the uploaded file
export const summarizeFile = async (fileId) => {
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: "Summarize this PDF file." }],
      file_ids: [fileId],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No summary available";
};
