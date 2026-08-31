import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { CommandMenu, type CommandEntities } from "@/components/command-menu";
import { AskVetraModal } from "@/components/agent/ask-vetra-modal";
import { AppSidebar, type NeedsAWordClient } from "@/components/app-sidebar";
import { AgentDock } from "@/components/agent/AgentDock";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const COMMAND_ENTITIES_QUERY = `{
  "candidates": *[_type == "candidate" && orgId == $orgId && archived != true] | order(name asc) [0...100] { _id, name, headline, avatarUrl },
  "jobs": *[_type == "job" && orgId == $orgId] | order(createdAt desc) [0...100] { _id, title, "companyName": company->name },
  "companies": *[_type == "company" && orgId == $orgId] | order(name asc) [0...100] { _id, name }
}`;

const RAIL_DATA_QUERY = `{
  "roles": count(*[_type == "job" && orgId == $orgId && status == "open"]),
  "inPlay": count(*[_type == "application" && orgId == $orgId && !(stage in ["hired", "rejected"])]),
  "touches": *[_type == "application" && orgId == $orgId]{
    stageUpdatedAt,
    "companyId": job->company->_id,
    "companyName": job->company->name
  }
}`;

type RailData = {
  roles: number;
  inPlay: number;
  touches: {
    stageUpdatedAt: string | null;
    companyId: string | null;
    companyName: string | null;
  }[];
};

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { orgId } = await requireOrg();
  const [entities, rail, user] = await Promise.all([
    readClient.fetch<CommandEntities>(COMMAND_ENTITIES_QUERY, { orgId }),
    readClient.fetch<RailData>(RAIL_DATA_QUERY, { orgId }),
    currentUser(),
  ]);

  const lastTouch = new Map<string, { name: string; days: number }>();
  for (const touch of rail.touches) {
    if (!touch.companyId || !touch.companyName || !touch.stageUpdatedAt)
      continue;
    const days = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(touch.stageUpdatedAt).getTime()) / 86_400_000,
      ),
    );
    const current = lastTouch.get(touch.companyId);
    if (!current || days < current.days) {
      lastTouch.set(touch.companyId, { name: touch.companyName, days });
    }
  }
  const needsAWord: NeedsAWordClient[] = [...lastTouch.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .filter((client) => client.days > 6)
    .sort((a, b) => b.days - a.days)
    .slice(0, 3);

  return (
    <SidebarProvider className="bw">
      <AppSidebar
        counts={{
          pipeline: rail.inPlay,
          ledger: entities.companies.length,
          roles: rail.roles,
          talent: entities.candidates.length,
        }}
        needsAWord={needsAWord}
        orgSwitcher={
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/dashboard"
          />
        }
        search={<CommandMenu key="search" entities={entities} />}
        ask={<AskVetraModal key="ask" />}
        userButton={<UserButton key="user-button" />}
        userName={user?.fullName ?? user?.username ?? null}
      />
      <SidebarInset>
        <div className="flex items-center gap-2 border-b px-3 py-2 md:hidden">
          <SidebarTrigger />
          <Link
            href="/dashboard"
            className="font-display text-base font-bold tracking-tight"
          >
            Vetra<span className="text-ai">.</span>
          </Link>
        </div>
        <main className="flex min-w-0 flex-1 flex-col px-5 pb-24 lg:px-8">
          <div className="mx-auto flex w-full max-w-360 flex-1 flex-col">
            {children}
          </div>
        </main>
      </SidebarInset>
      <AgentDock />
    </SidebarProvider>
  );
}
