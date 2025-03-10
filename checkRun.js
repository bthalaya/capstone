async function checkRunStatus(threadId, runId) {
  console.log("\n🔍 Checking run status...");

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
  console.log("\n📊 Run Status:", data);

  if (data.status === "completed") {
    console.log("\n✅ Run completed! Fetching results...");
    fetchRunOutput(threadId);
  } else if (data.status === "failed") {
    console.error("\n❌ Run failed:", data.last_error);
  } else {
    console.log("\n⏳ Run still in progress... Check again in a few seconds.");
  }
}

// Function to fetch messages (output) from the thread
async function fetchRunOutput(threadId) {
  console.log("\n📥 Fetching results from thread...");

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
  console.log("\n📄 Extracted Key Metrics:", data);
}

function saveResultsAsCSV(messages) {
  const fields = ["id", "role", "content", "createdAt"];
  const opts = { fields };

  try {
    const csv = parse(messages, opts);
    fs.writeFileSync("./downloads/extractedMetrics.csv", csv);
    console.log("✅ Data successfully saved as CSV in the downloads folder.");
  } catch (err) {
    console.error("❌ Error saving data as CSV:", err);
  }
}

// Run the status check
checkRunStatus(threadId, runId);

// ✅ Run the status check
const threadId = "thread_0syDimRrPl9sDeUkbBYzDa37"; // Your new thread ID
const runId = "run_tPJP2Q6ZiPaGwDByFIIK2hTO"; // Your new run ID

checkRunStatus(threadId, runId);
