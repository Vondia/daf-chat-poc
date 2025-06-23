import { AgentsClient, MessageContent as AzureMessageContent } from "@azure/ai-agents";
import { DefaultAzureCredential, ClientSecretCredential } from "@azure/identity";
import { delay } from "@azure/core-util";

const endpoint = process.env.PROJECT_ENDPOINT!;

// Initialize Azure credentials based on environment
const getAzureCredential = () => {
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.AZURE_TENANT_ID;

  // If we have service principal credentials, use them
  if (clientId && clientSecret && tenantId) {
    console.log("Using ClientSecretCredential for Azure authentication");
    return new ClientSecretCredential(tenantId, clientId, clientSecret);
  }

  // Fallback to DefaultAzureCredential (works for local development with az login)
  console.log("Using DefaultAzureCredential for Azure authentication");
  return new DefaultAzureCredential();
};

const client = new AgentsClient(endpoint, getAzureCredential());

interface Citation {
  startIndex: number;
  endIndex: number;
  content: string;
  title?: string;
  url?: string;
  fileId?: string;
  fileName?: string;
}

interface TextContent {
  type: "text";
  text: {
    value: string;
    annotations?: Array<{
      type: string;
      text: string;
      fileCitation?: {
        fileId: string;
      };
      startIndex: number;
      endIndex: number;
    }>;
  };
}

interface InlineDataContent {
  type: "inline_data";
  inlineData: {
    mimeType: string;
    data: string;
  };
}

function isTextContent(content: AzureMessageContent): content is TextContent {
  const textContent = content as TextContent;
  return textContent.type === "text" && !!textContent.text && typeof textContent.text.value === "string";
}

function isInlineDataContent(content: AzureMessageContent): content is InlineDataContent {
  const inlineContent = content as InlineDataContent;
  return inlineContent.type === "inline_data" && !!inlineContent.inlineData;
}

async function processAnnotations(content: TextContent): Promise<Citation[]> {
  if (!content.text.annotations) return [];

  const citations = content.text.annotations
    .filter(annotation => annotation.type === "file_citation")
    .map(async annotation => {
      const citation: Citation = {
        startIndex: annotation.startIndex,
        endIndex: annotation.endIndex,
        content: annotation.text,
        fileId: annotation.fileCitation?.fileId
      };

      if (citation.fileId) {
        try {
          const fileInfo = await client.files.get(citation.fileId);
          citation.fileName = fileInfo.filename;
        } catch (error) {
          console.error('Error fetching file info:', error);
        }
      }

      return citation;
    });

  return Promise.all(citations);
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

  // Log the raw messages for debugging
//   console.log('Raw messages from Azure:', JSON.stringify(allMessages, null, 2));

  // 5. Return the conversation
  const processedMessages = [];
  for (const m of allMessages) {
    const messageContents = m.content as AzureMessageContent[];

    const textContent = messageContents.find(isTextContent) as TextContent | undefined;

    const inlineDataContents = messageContents.filter(isInlineDataContent);

    // Process citations from annotations
    const citations = textContent ? await processAnnotations(textContent) : [];

    const result = {
      role: m.role,
      text: textContent?.text.value || "",
      citations,
      attachments: inlineDataContents.map(content => ({
        mimeType: content.inlineData.mimeType,
        data: content.inlineData.data
      }))
    };

    processedMessages.push(result);
  }

  return {
    threadId: thread.id,
    messages: processedMessages,
  };
}
