"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className = "" }: { className?: string } = {}) {
  const { setTheme, theme } = useTheme();

  // Force a re-render when mounted to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn("group", className)}
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const getNextTheme = (t: string | undefined) => (
    t === "dark" ? "light" : t === "light" ? "system" : "dark"
  );

  const Icon = ({ className = "size-[1.2rem] transition-all" }) => {
    if (theme === "dark") return <Moon className={className} />;
    if (theme === "light") return <Sun className={className} />;
    return <Monitor className={className} />;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("group", "cursor-pointer", className)}
      data-theme={theme}
      onClick={() => setTheme(getNextTheme(theme))}
      title={`Switch to ${getNextTheme(theme)} mode`}
      aria-label={`Switch to ${getNextTheme(theme)} mode`}
    >
      <Icon className="size-[1.2rem] transition-all group-hover:rotate-12 group-hover:scale-110" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
