const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID; // Store Assistant ID in .env

async function uploadPdfToOpenAI(filePath) {
  console.log("\n🚀 Uploading PDF to OpenAI...");

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    filename: filePath.split("/").pop(),
    contentType: "application/pdf",
  });
  form.append("purpose", "user_data");

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  const data = await response.json();
  if (!data.id) {
    throw new Error(`❌ Failed to upload PDF: ${JSON.stringify(data)}`);
  }

  console.log("✅ PDF uploaded successfully:", data.id);
  return data.id; // Return the file ID
}

async function createThreadAndRunGPT(fileId) {
  console.log("\n📑 Creating OpenAI thread...");

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
  if (!threadData.id) {
    throw new Error(
      `❌ Failed to create thread: ${JSON.stringify(threadData)}`
    );
  }

  console.log("✅ Thread created:", threadData.id);
  const threadId = threadData.id;

  console.log("\n📎 Attaching file and sending message...");

  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
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
  });

  console.log("\n🚀 Running GPT-4o on thread...");

  const runResponse = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/runs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        instructions: "Extract sustainability metrics under CLIMATE CHANGE.",
        temperature: 0.3,
      }),
    }
  );

  const runData = await runResponse.json();
  if (!runData.id) {
    throw new Error(`❌ Failed to start run: ${JSON.stringify(runData)}`);
  }

  console.log("✅ Run started:", runData.id);
  return { threadId, runId: runData.id };
}

async function checkRunStatus(threadId, runId) {
  console.log("\n🔍 Checking OpenAI run status...");

  while (true) {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const data = await response.json();
    console.log("📊 Run Status:", data.status);

    if (data.status === "completed") {
      return fetchRunOutput(threadId);
    } else if (data.status === "failed") {
      throw new Error(`❌ Run failed: ${JSON.stringify(data)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5s before retrying
  }
}

async function fetchRunOutput(threadId) {
  console.log("\n📥 Fetching results from OpenAI...");

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
  if (!data.data.length) {
    throw new Error("❌ No messages found in thread.");
  }

  const responseText = data.data.find((msg) => msg.role === "assistant")
    ?.content[0]?.text;

  console.log("\n🤖 GPT-4o Response:", responseText);
  return responseText;
}

module.exports = {
  uploadPdfToOpenAI,
  createThreadAndRunGPT,
  checkRunStatus,
};
