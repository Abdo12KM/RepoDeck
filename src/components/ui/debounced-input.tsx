"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  name?: string;
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  placeholder = "Search...",
  className,
  autoFocus,
  id,
  name,
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!mounted) return;

    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange, mounted]);

  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 shrink-0 -translate-y-1/2" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-background h-9 w-full pr-8 pl-9 text-xs shadow-xs"
        autoFocus={autoFocus}
        id={id}
        name={name}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onChange("");
          }}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
