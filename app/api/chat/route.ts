import { runAzureAgentConversation } from "@/lib/azureAgent";
import { getServerSession } from "next-auth/next"


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const AZURE_PROJECT_ENDPOINT = "https://daf-ai-foundry-resource.services.ai.azure.com/api/projects/daf-ai";
// const AGENT_ID = "asst_BhZOlCbV9SPY3wmzspYMYggP";
const AGENT_ID = "asst_Dlz66KRRxlpdKXCnZcFoAkfE";

export async function POST(req: Request) {
//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
//   }

  const { messages, threadId } = await req.json();

  // Find the latest user message
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((m: any) => m.role === "user");

  if (!lastUserMessage) {
    return new Response(JSON.stringify({ error: "No user message found." }), { status: 400 });
  }

  try {
    const result = await runAzureAgentConversation({
      agentId: AGENT_ID,
      threadId,
      userMessage: lastUserMessage.content,
    });


    // Return just the assistant message
    const assistantMessage = result.messages
      .find(m => m.role === "assistant");

    if (!assistantMessage) {
      throw new Error("No assistant message found in response");
    }

    const response = {
      id: Date.now().toString(),
      role: "assistant",
      content: assistantMessage.text,
      isMarkdown: true,
      citations: assistantMessage.citations || [],
      attachments: assistantMessage.attachments || []
    };

    return Response.json(response);

  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
