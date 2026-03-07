import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-heading font-medium text-dark-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-border/90 bg-white/92 px-3.5 py-2.5 text-sm font-body text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
            "placeholder:text-muted-foreground",
            "hover:border-dark-200",
            "focus:outline-none focus:ring-4 focus:ring-ring/12 focus:border-accent-orange focus:bg-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-[border-color,box-shadow,background-color] duration-200",
            error && "border-orange-500 focus:ring-orange-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-orange-600 font-heading">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
