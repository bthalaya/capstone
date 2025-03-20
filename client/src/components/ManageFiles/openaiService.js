const fetch = require("node-fetch");
const FormData = require("form-data");

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // Load from .env.local
const ASSISTANT_ID = "asst_FBTV3StHwdIMGzCYww3wu5TO"; //  Assistant ID

// ✅ Upload a PDF to OpenAI
async function uploadPdf(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("purpose", "assistants");

  try {
    const response = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    const data = await response.json();
    if (data.id) {
      console.log("✅ File uploaded to OpenAI");
      return createThreadAndAttachFile(data.id);
    } else {
      console.error("❌ OpenAI file upload failed:", data);
    }
  } catch (error) {
    console.error("❌ OpenAI Upload Error:", error);
  }
}

// ✅ Create a thread, attach the file, and run GPT-4o
async function createThreadAndAttachFile(fileId) {
  try {
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({}),
    });

    const threadData = await threadResponse.json();
    if (!threadData.id) throw new Error("Failed to create thread");

    console.log("✅ Thread Created");
    return runAssistant(threadData.id, fileId);
  } catch (error) {
    console.error("❌ Error creating thread:", error);
  }
}

// ✅ Run GPT-4o with the file
async function runAssistant(threadId, fileId) {
  try {
    const messageResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          role: "user",
          content: "Extract key metrics from this document.",
          attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }],
        }),
      }
    );

    const messageData = await messageResponse.json();
    if (!messageData.id) throw new Error("Failed to attach file");

    console.log("✅ File Attached & Running Assistant");
    return checkRunStatus(threadId);
  } catch (error) {
    console.error("❌ Error running assistant:", error);
  }
}

// ✅ Check GPT-4o run status & fetch output
async function checkRunStatus(threadId) {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({ assistant_id: ASSISTANT_ID }),
      }
    );

    const runData = await response.json();
    if (!runData.id) throw new Error("Failed to start run");

    console.log("✅ GPT-4o Run Started");
    setTimeout(() => fetchRunOutput(threadId), 10000);
  } catch (error) {
    console.error("❌ Error starting GPT-4o run:", error);
  }
}

// ✅ Fetch extracted metrics from GPT-4o
async function fetchRunOutput(threadId) {
  try {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const data = await response.json();
    if (data.data?.length > 0) {
      console.log("\n✅ Extracted Key Metrics:");
      data.data.forEach((msg) => {
        if (msg.role === "assistant" && msg.content) {
          msg.content.forEach((block) => {
            if (block.type === "text") {
              console.log("\n📄 GPT-4o Response:\n", block.text);
            }
          });
        }
      });
    } else {
      console.error("❌ No key metrics found.");
    }
  } catch (error) {
    console.error("❌ Error fetching output:", error);
  }
}

// ✅ Export functions
module.exports = { uploadPdf };
