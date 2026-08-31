import { auth } from "@clerk/nextjs/server";
import { AgentPanel } from "./AgentPanel";

export async function AgentDock() {
  const { has } = await auth();
  return <AgentPanel allowed={has({ feature: "ai_agent" })} />;
}
