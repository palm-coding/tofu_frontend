"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle({
  variant = "icon",
}: {
  variant?: "icon" | "switch";
}) {
  const { theme, setTheme } = useTheme();

  if (variant === "switch") {
    return (
      <div className="flex items-center gap-2">
        <Switch
          id="theme-toggle"
          checked={theme === "dark"}
          onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        />
        <Label htmlFor="theme-toggle" className="cursor-pointer text-sm">
          {theme === "dark" ? "โหมดมืด" : "โหมดสว่าง"}
        </Label>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">สลับธีม</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          โหมดสว่าง
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          โหมดมืด
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          ใช้ค่าระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
