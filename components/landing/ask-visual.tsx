export function AskVisual() {
  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="flex flex-col gap-3">
        <p className="bg-muted ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md px-4 py-2 text-sm">
          Who fits this brief?
        </p>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
            V
          </span>
          <div className="text-sm leading-relaxed">
            <p>
              <span className="font-semibold text-foreground underline underline-offset-2">
                Oluwaseun Adeyemi
              </span>{" "}
              — <em>&quot;strongest final round this year&quot;</em>
            </p>
            <p className="mt-1.5">
              <span className="font-semibold text-foreground underline underline-offset-2">
                Priya Raghavan
              </span>{" "}
              — reached offer for a similar role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
