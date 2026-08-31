import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Inside a <Button> the size comes from the button's own svg sizing rules;
 * standalone usages should pass an explicit size-* class.
 */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderCircle
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
