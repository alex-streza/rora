import * as React from "react";

import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-border/80 bg-input ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-full border px-3 py-2 text-sm shadow-[inset_1px_1px_0px_0px_#1A231F,inset_-1px_0px_0px_0px_#1A231F] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
