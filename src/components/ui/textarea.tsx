import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxRows, value, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      const textarea = internalRef.current;
      if (!textarea) return;

      const adjustHeight = () => {
        textarea.style.height = "auto";
        const style = window.getComputedStyle(textarea);
        const lineHeight = parseInt(style.lineHeight) || 20;
        const padding =
          parseInt(style.paddingTop) + parseInt(style.paddingBottom);
        const border =
          parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);

        const maxHeight = maxRows
          ? lineHeight * maxRows + padding + border
          : Infinity;

        const newHeight = Math.min(textarea.scrollHeight + border, maxHeight);
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY =
          textarea.scrollHeight > maxHeight ? "auto" : "hidden";
      };

      adjustHeight();
    }, [value, maxRows]);

    return (
      <textarea
        ref={internalRef}
        data-slot="textarea"
        value={value}
        onChange={(e) => {
          onChange?.(e);
          // Trigger height adjustment immediately on change
        }}
        className={cn(
          "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-2.5 py-2 text-xs transition-colors outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1 md:text-xs",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
