"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Laptop, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeSettingsDropdownProps {
  className?: string;
  align?: "start" | "end" | "center";
}

export function ThemeSettingsDropdown({
  className,
  align = "end",
}: ThemeSettingsDropdownProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(
            "text-muted-foreground hover:text-foreground relative h-8.5 w-8.5",
            className,
          )}
          aria-label="Theme settings"
          title="Theme settings"
        >
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-40 text-xs">
        <DropdownMenuLabel className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          Theme Preferences
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex cursor-pointer items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </span>
          {theme === "light" && <Check className="text-primary h-3.5 w-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex cursor-pointer items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </span>
          {theme === "dark" && <Check className="text-primary h-3.5 w-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex cursor-pointer items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Laptop className="text-muted-foreground h-3.5 w-3.5" />
            <span>System</span>
          </span>
          {theme === "system" && <Check className="text-primary h-3.5 w-3.5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
