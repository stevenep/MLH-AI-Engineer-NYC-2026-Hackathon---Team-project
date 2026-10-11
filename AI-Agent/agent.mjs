
import Nimble from "@nimble-way/nimble-js";

// Read the API key from the environment
const apiKey = process.env.NIMBLE_API_KEY;

if (!apiKey) {
  console.error("Missing NIMBLE_API_KEY");
  process.exit(1);
}

// Create the Nimble client
const nimble = new Nimble({
  apiKey,
  maxRetries: 0,
});

async function main() {
  try {
    console.log("Starting Nimble AI Agent...");

    // Start a research task
    const run = await nimble.agents.run({
      input: "What is Major League Hacking? Answer briefly.",
      use_case: "research",
      effort: "low",
    });

    console.log("Run ID:", run.id);
    console.log("Initial status:", run.status);

    const agentId = run.web_search_agent_id;
    let currentRun = run;

    // Wait for the agent to finish
    while (currentRun.is_active) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      currentRun = await nimble.agents.runs.get(run.id, {
        agent_id: agentId,
      });

      console.log("Status:", currentRun.status);
    }

    if (currentRun.status !== "completed") {
      throw new Error(`Agent ended with: ${currentRun.status}`);
    }

    // Retrieve the research result
    const result = await nimble.agents.runs.result(run.id, {
      agent_id: agentId,
    });

    console.log("\nAI AGENT RESPONSE:");
    console.log(JSON.stringify(result.output, null, 2));

  } catch (error) {
    console.error("Nimble error:", error.message);
    process.exitCode = 1;
  }
}

main();
  