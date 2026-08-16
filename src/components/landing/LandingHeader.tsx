"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  FolderGit2,
  Github,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Paintbrush,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppearanceSettingsDialog } from "@/components/theme/AppearanceSettingsDialog";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Syntax Studio", href: "#syntax-studio" },
  { label: "Interactive Demo", href: "#demo" },
  { label: "Workflow", href: "#workflow" },
  { label: "Tech Stack", href: "#stack" },
  { label: "FAQ", href: "#faq" },
];

export function LandingHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const { authenticated, user, isLoading, signIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <RepoDeckIcon
            size={36}
            className="transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex items-center gap-2">
            <span className="text-foreground text-base font-bold tracking-tight">
              RepoDeck
            </span>
            <Badge
              variant="outline"
              className="text-muted-foreground hidden px-1.5 py-0 font-mono text-[10px] sm:inline-flex"
            >
              v0.1
            </Badge>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme 1-Click Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="text-muted-foreground hover:text-foreground relative h-9 w-9"
            aria-label="Toggle theme"
            title="Toggle theme (Light / Dark)"
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          {/* Theme & Appearance Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAppearanceOpen(true)}
            className="text-muted-foreground hover:text-foreground h-9 w-9"
            aria-label="Theme settings"
            title="Theme & Appearance settings"
          >
            <Paintbrush className="h-4 w-4" />
          </Button>

          {/* GitHub Repo Star / Link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-foreground h-9 w-9"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>

          {/* Auth / Account */}
          {!isLoading &&
            (authenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border/80 hover:bg-muted/80 h-9 cursor-pointer gap-2 px-2.5 text-xs font-semibold"
                    aria-label={`Account menu for ${user.githubLogin}`}
                  >
                    <Avatar className="border-border/80 h-5 w-5 border shadow-2xs">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback className="font-mono text-[9px] font-bold">
                        {user.githubLogin.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-28 truncate sm:inline">
                      {user.githubLogin}
                    </span>
                    <ChevronDown className="text-muted-foreground hidden h-3 w-3 opacity-60 sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-border/80 bg-popover w-64 p-1.5 text-xs shadow-xl"
                >
                  {/* User Profile Header Card */}
                  <div className="bg-muted/40 border-border/50 mb-1 flex items-center gap-2.5 rounded-lg border p-2">
                    <Avatar className="border-border/80 h-8 w-8 shrink-0 border shadow-2xs">
                      <AvatarImage
                        src={user.avatarUrl ?? undefined}
                        alt={user.githubLogin}
                      />
                      <AvatarFallback className="font-mono text-xs font-bold">
                        {user.githubLogin.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-xs font-semibold">
                        {user.githubLogin}
                      </p>
                      <p className="text-muted-foreground truncate font-mono text-[10px]">
                        github.com/{user.githubLogin}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <DropdownMenuItem
                    asChild
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                  >
                    <Link href="/repositories">
                      <div className="flex items-center gap-2.5">
                        <FolderGit2 className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span>Open Viewer</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setAppearanceOpen(true)}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Paintbrush className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span>Appearance & Theme</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                  >
                    <a
                      href={`https://github.com/${user.githubLogin}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <div className="flex items-center gap-2.5">
                        <Github className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span>GitHub profile</span>
                      </div>
                      <ExternalLink className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={signOut}
                    variant="destructive"
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hidden h-9 gap-1.5 px-3 text-xs font-medium sm:inline-flex"
                onClick={() => signIn()}
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Button>
            ))}

          {/* Primary CTA */}
          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 px-3.5 text-xs font-semibold shadow-sm"
          >
            <Link href="/repositories">
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-border bg-background/95 border-b px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3">
              {!authenticated ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signIn();
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  Sign in with GitHub
                </Button>
              ) : null}
              <Button asChild className="w-full justify-center gap-2 text-xs">
                <Link
                  href="/repositories"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Open Repository Viewer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Appearance Settings Dialog */}
      <AppearanceSettingsDialog
        open={appearanceOpen}
        onOpenChange={setAppearanceOpen}
      />
    </header>
  );
}
