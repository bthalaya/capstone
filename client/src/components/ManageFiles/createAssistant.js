const fetch = require("node-fetch");
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // Load from .env

async function createAssistant() {
  const response = await fetch("https://api.openai.com/v1/assistants", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    },
    body: JSON.stringify({
      name: "PDF Key Metrics Extractor",
      instructions: "Extract key metrics from uploaded PDF documents.",
      tools: [{ type: "file_search" }], // ✅ Enables file searching inside PDFs
      model: "gpt-4o",
    }),
  });

  const data = await response.json();
  console.log("Assistant Created:", data);
}

createAssistant();
