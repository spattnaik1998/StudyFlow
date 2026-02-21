"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Timer,
  Brain,
  BarChart2,
  Settings,
  Plus,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

const navigationItems = [
  {
    label: "Go to Dashboard",
    icon: LayoutDashboard,
    href: "/app/dashboard",
    shortcut: "D",
  },
  {
    label: "Go to Tasks",
    icon: BookOpen,
    href: "/app/tasks",
    shortcut: "T",
  },
  {
    label: "Go to Schedule",
    icon: Calendar,
    href: "/app/schedule",
    shortcut: "S",
  },
  {
    label: "Go to Focus",
    icon: Timer,
    href: "/app/focus",
    shortcut: "F",
  },
  {
    label: "Go to Analytics",
    icon: BarChart2,
    href: "/app/analytics",
    shortcut: "A",
  },
  {
    label: "Go to Topics",
    icon: Brain,
    href: "/app/topics",
    shortcut: "L",
  },
];

const actionItems = [
  {
    label: "New Task",
    icon: Plus,
    href: "/app/tasks/new",
    shortcut: "N",
  },
  {
    label: "New Project",
    icon: Plus,
    href: "/app/projects/new",
    shortcut: "P",
  },
  {
    label: "Start Focus Session",
    icon: Timer,
    href: "/app/focus",
    shortcut: "⏱",
  },
  {
    label: "Open Settings",
    icon: Settings,
    href: "/app/settings",
    shortcut: "⚙",
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  const handleSelect = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 bg-muted px-1.5 font-mono text-[10px] font-medium text-gray-600">
                  <span className="text-xs">⌘</span>
                  {item.shortcut}
                </kbd>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => handleSelect(item.href)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-300 bg-muted px-1.5 font-mono text-[10px] font-medium text-gray-600">
                  <span className="text-xs">⌘</span>
                  {item.shortcut}
                </kbd>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
