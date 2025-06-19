import { AgentsClient, isOutputOfType } from "@azure/ai-agents";
import { DefaultAzureCredential } from "@azure/identity";
import { delay } from "@azure/core-util";

const endpoint = process.env.PROJECT_ENDPOINT!;

const client = new AgentsClient(endpoint, new DefaultAzureCredential());

function isTextContent(
  content: any
): content is { type: "text"; text: { value: string } } {
  return content.type === "text" && !!content.text && typeof content.text.value === "string";
}

export async function runAzureAgentConversation({
  agentId,
  threadId,
  userMessage,
}: {
  agentId: string;
  threadId?: string;
  userMessage: string;
}) {
  // 1. Create or use existing thread
  const thread = threadId
    ? await client.threads.get(threadId)
    : await client.threads.create();

  // 2. Send user message
  const message = await client.messages.create(thread.id, "user", userMessage);

  // 3. Create and execute a run
  let run = await client.runs.create(thread.id, agentId);
  while (run.status === "queued" || run.status === "in_progress") {
    await delay(1000);
    run = await client.runs.get(thread.id, run.id);
  }
  if (run.status === "failed") {
    throw new Error(`Run failed: ${JSON.stringify(run.lastError)}`);
  }

  // 4. Fetch all messages
  const messagesIterator = client.messages.list(thread.id);
  const allMessages = [];
  for await (const m of messagesIterator) {
    allMessages.push(m);
  }

  // 5. Return the conversation
  return {
    threadId: thread.id,
    messages: allMessages.map((m) => {
      const textContent = m.content.find(isTextContent);
      return {
        role: m.role,
        text: textContent ? textContent.text.value : "",
      };
    }),
  };
}
