"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const locales = [
  { code: "uk", label: "Українська" },
  { code: "en", label: "English" },
] as const;

type LanguageSwitcherProps = {
  scrolled?: boolean;
};

export function LanguageSwitcher({ scrolled = true }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all outline-none",
          scrolled
            ? "text-brand-blue hover:bg-accent"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => router.replace(pathname, { locale: l.code })}
            className={locale === l.code ? "bg-primary/10 text-primary" : ""}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
