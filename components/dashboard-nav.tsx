"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  CreditCard,
  LayoutDashboard,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/companies", label: "Companies", icon: Building2 },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/candidates", label: "Candidates", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/org", label: "Team", icon: UsersRound },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-2 pt-1">
      {LINKS.map(({ href, label, icon: Icon, ...rest }) => {
        const active =
          "exact" in rest && rest.exact
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex h-7.5 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors",
              active
                ? "bg-foreground/6 text-foreground font-medium"
                : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-foreground" : "text-muted-foreground/70",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileDashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
      {LINKS.map(({ href, label, icon: Icon, ...rest }) => {
        const active =
          "exact" in rest && rest.exact
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
              active
                ? "bg-foreground/[0.07] text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
