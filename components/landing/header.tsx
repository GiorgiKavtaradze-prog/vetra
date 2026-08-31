import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export async function Header() {
  const { userId } = await auth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/">
          <span className="font-display text-xl font-bold tracking-tight">
            Vetra<span className="text-foreground">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler className="inline-flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground [&_svg]:size-4.5" />
          {userId ? (
            <Button
              className="bg-foreground text-background hover:bg-foreground/85"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Open dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Sign in
              </Button>
              <Button
                className="bg-foreground text-background hover:bg-foreground/85"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Start free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
