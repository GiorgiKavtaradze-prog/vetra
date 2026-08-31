import { auth } from "@clerk/nextjs/server";
import { anthropic } from "@ai-sdk/anthropic";
import { createMCPClient } from "@ai-sdk/mcp";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { sanityInsightsIntegration } from "@sanity/context/ai-sdk";
import { initialContextFor, orgScopedMcpUrl } from "@/lib/mcp";
import { buildSystemPrompt } from "@/lib/agent-prompt";
import { buildActionTools, buildClientTools } from "@/lib/agent-tools";
import { writeClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  const { userId, orgId, has } = await auth();
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!orgId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!has({ feature: "ai_agent" })) {
    return Response.json({ error: "upgrade_required" }, { status: 403 });
  }

  const { messages, id: chatId }: { messages: UIMessage[]; id?: string } =
    await req.json();

  const mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url: orgScopedMcpUrl(orgId),
      headers: {
        Authorization: "Bearer " + process.env.SANITY_API_READ_TOKEN,
      },
    },
  });

  let closed = false;
  const closeMcp = async () => {
    if (closed) return;
    closed = true;
    await mcpClient.close().catch(() => {});
  };

  try {
    const allTools = await mcpClient.tools();
    const { initial_context: _omit, ...mcpTools } = allTools;
    const tools = {
      ...mcpTools,
      ...buildActionTools(),
      ...buildClientTools(),
    };
    const result = streamText({
      model: anthropic("claude-sonnet-5"),
      system: buildSystemPrompt(await initialContextFor(orgId)),
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(20),
      onFinish: closeMcp,
      onError: closeMcp,
      onAbort: closeMcp,
      experimental_telemetry: {
        isEnabled: true,
        integrations: [
          sanityInsightsIntegration({
            client: writeClient,
            agentId: "vetra",
            threadId: chatId ?? `org-${orgId}`,
          }),
        ],
      },
    });
    return result.toUIMessageStreamResponse();
  } catch (e) {
    await closeMcp();
    throw e;
  }
}
