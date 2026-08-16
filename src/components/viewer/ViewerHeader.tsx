"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderGit2,
  GitBranch,
  Github,
  LockKeyhole,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Paintbrush,
  Search,
  ExternalLink,
  Command,
} from "lucide-react";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { useViewer } from "@/hooks/useViewer";
import { useAuth } from "@/hooks/useAuth";
import { RepoIcon } from "@/components/repo/RepoIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useModifierKey } from "@/hooks/useModifierKey";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ViewerHeaderProps {
  onOpenRepository: () => void;
  onConnectPrivate: () => void;
  onToggleSidebar?: () => void;
  onOpenQuickSwitcher?: () => void;
  onOpenShortcutsHelp?: () => void;
  onOpenAppearance?: () => void;
  sidebarCollapsed?: boolean;
  sidebarHovered?: boolean;
}

export function ViewerHeader({
  onOpenRepository,
  onConnectPrivate,
  onToggleSidebar,
  onOpenQuickSwitcher,
  onOpenShortcutsHelp,
  onOpenAppearance,
  sidebarCollapsed = false,
  sidebarHovered = false,
}: ViewerHeaderProps) {
  const { owner, repo, branch, hasRepo } = useViewer();
  const { authenticated, user, isLoading, signIn, signOut } = useAuth();
  const { settings } = useAppearanceSettings();
  const modifier = useModifierKey();

  return (
    <>
      <header className="bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 flex h-13 shrink-0 items-center justify-between border-b px-3 backdrop-blur-xl sm:px-4">
        {/* Left: Brand + Breadcrumb Repository & Branch Navigation */}
        <div className="flex h-full min-w-0 flex-1 items-center gap-2">
          {hasRepo ? (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="group relative -ml-3 flex h-full shrink-0 cursor-pointer items-center gap-2 pr-2 pl-3 text-left select-none after:absolute after:inset-x-0 after:-bottom-px after:h-px after:content-[''] focus-visible:outline-hidden sm:-ml-4 sm:pl-4"
              title={
                sidebarCollapsed
                  ? `Expand file tree (${modifier}+B)`
                  : `Collapse file tree (${modifier}+B)`
              }
              aria-label={
                sidebarCollapsed ? "Expand file tree" : "Collapse file tree"
              }
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                {/* Default RepoDeck Logo */}
                <RepoDeckIcon
                  size={32}
                  className={cn(
                    "transition-all duration-200 group-hover:scale-75 group-hover:opacity-0",
                    sidebarHovered && "scale-75 opacity-0",
                  )}
                />
                {/* Hover Collapse / Expand Icon */}
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100",
                    sidebarHovered && "scale-100 opacity-100",
                  )}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="text-foreground group-hover:text-primary h-4.5 w-4.5 transition-colors" />
                  ) : (
                    <PanelLeftClose className="text-foreground group-hover:text-primary h-4.5 w-4.5 transition-colors" />
                  )}
                </span>
              </div>
              <div className="hidden -translate-y-[2px] lg:block">
                <span className="text-foreground group-hover:text-primary text-xs font-bold tracking-tight transition-colors">
                  RepoDeck
                </span>
              </div>
            </button>
          ) : (
            <Link
              href="/"
              className="group -ml-3 flex h-full shrink-0 items-center gap-2 pr-2 pl-3 transition-opacity hover:opacity-90 sm:-ml-4 sm:pl-4"
              title="RepoDeck Home"
            >
              <RepoDeckIcon
                size={32}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <span className="text-foreground text-xs font-bold tracking-tight">
                  RepoDeck
                </span>
              </div>
            </Link>
          )}

          {hasRepo && (
            <>
              <span className="text-muted-foreground/40 hidden font-mono text-xs select-none lg:inline">
                /
              </span>

              {/* Unified Repository & Branch Selector */}
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted/70 -ml-1 h-8 max-w-sm min-w-0 shrink cursor-pointer items-center gap-1.5 px-2 text-xs font-semibold sm:max-w-md"
                onClick={onOpenRepository}
                style={{ borderRadius: `${settings.radius}rem` }}
                title={`Switch repository or branch: ${owner}/${repo}@${branch} (${modifier}+O)`}
              >
                <RepoIcon
                  owner={owner!}
                  repo={repo!}
                  branch={branch!}
                  iconClassName="h-5 w-5 shrink-0 rounded-xs"
                />
                <span className="text-foreground truncate font-semibold">
                  <span className="text-muted-foreground hidden font-normal sm:inline">
                    {owner}/
                  </span>
                  {repo}
                </span>
                <span className="text-muted-foreground/40 hidden font-mono text-xs select-none sm:inline">
                  :
                </span>
                <span className="text-muted-foreground hidden max-w-[120px] shrink-0 items-center gap-1 truncate font-mono text-xs font-normal sm:inline-flex">
                  <GitBranch className="text-primary h-3 w-3 shrink-0" />
                  <span className="truncate">{branch}</span>
                </span>
                <ChevronDown className="text-muted-foreground h-3 w-3 shrink-0 opacity-60" />
              </Button>
            </>
          )}
        </div>

        {/* Center: Universal Command Palette & Search Trigger */}
        {hasRepo && onOpenQuickSwitcher && (
          <div className="mx-2 hidden shrink-0 items-center justify-center md:flex">
            <button
              type="button"
              onClick={onOpenQuickSwitcher}
              className="bg-muted/30 hover:bg-muted/70 border-border/80 text-muted-foreground hover:text-foreground group flex h-8 w-44 cursor-pointer items-center justify-between border px-2.5 text-xs shadow-2xs transition-colors lg:w-52"
              style={{ borderRadius: `${settings.radius}rem` }}
              title={`Command Palette & Global Search (${modifier}+K / ${modifier}+P)`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Search className="text-muted-foreground group-hover:text-primary h-3.5 w-3.5 shrink-0 transition-colors" />
                <span className="truncate text-xs font-normal">
                  Search files...
                </span>
              </div>
              <Kbd className="bg-background border-border text-muted-foreground ml-2 shrink-0 border font-mono text-[9px] opacity-80">
                {modifier}+K
              </Kbd>
            </button>
          </div>
        )}

        {/* Right Controls & Auth */}
        <div className="flex shrink-0 items-center justify-end gap-1.5">
          {/* User Auth Dropdown */}
          {!isLoading &&
            (authenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-muted/70 h-8.5 cursor-pointer gap-2 px-1.5 sm:px-2"
                    style={{ borderRadius: `${settings.radius}rem` }}
                    aria-label={`Account menu for ${user.githubLogin}`}
                  >
                    <Avatar className="border-border/80 h-6 w-6 border shadow-2xs">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback className="font-mono text-[10px] font-bold">
                        {user.githubLogin.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground hidden max-w-28 truncate text-xs font-semibold sm:inline">
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
                    onClick={onOpenRepository}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span>Switch repository</span>
                    </div>
                    <Kbd className="bg-muted text-muted-foreground font-mono text-[10px]">
                      {modifier}+O
                    </Kbd>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={onConnectPrivate}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <LockKeyhole className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span>Private repositories</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-muted-foreground border-border/60 bg-muted/60 h-4.5 px-1.5 py-0 font-mono text-[9px] font-normal"
                    >
                      GitHub App
                    </Badge>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={
                      onOpenAppearance ||
                      (() =>
                        window.dispatchEvent(
                          new CustomEvent("repodeck:toggle-appearance"),
                        ))
                    }
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <Paintbrush className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span>Appearance & Theme</span>
                    </div>
                    <Kbd className="bg-muted text-muted-foreground font-mono text-[10px]">
                      {modifier}+,
                    </Kbd>
                  </DropdownMenuItem>

                  {onOpenShortcutsHelp && (
                    <DropdownMenuItem
                      onClick={onOpenShortcutsHelp}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <Command className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span>Keyboard shortcuts</span>
                      </div>
                      <Kbd className="bg-muted text-muted-foreground font-mono text-[10px]">
                        ?
                      </Kbd>
                    </DropdownMenuItem>
                  )}

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
                className="text-muted-foreground hover:text-foreground h-8.5 gap-1.5 px-2 text-xs"
                style={{ borderRadius: `${settings.radius}rem` }}
                onClick={() => signIn()}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            ))}
        </div>
      </header>
    </>
  );
}
