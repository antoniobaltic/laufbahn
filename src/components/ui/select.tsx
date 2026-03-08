import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-heading font-medium uppercase tracking-[0.12em] text-dark-500"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-[20px] border border-[rgba(228,210,191,0.82)] bg-white/92 px-4 py-3 text-sm font-body text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
            "hover:border-dark-200 hover:bg-white",
            "focus:outline-none focus:ring-4 focus:ring-ring/12 focus:border-accent-orange focus:bg-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-[border-color,box-shadow,background-color] duration-200 appearance-none",
            error && "border-orange-500 focus:ring-orange-500/20",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-orange-600 font-heading">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select, type SelectProps };
