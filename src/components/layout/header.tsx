"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, ShoppingBag, User } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Link as I18nLink } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MarqueeText } from "@/components/ui/marquee-text";
import { LanguageSwitcher } from "./language-switcher";
import { useCartStore } from "@/stores/cart-store";
import { useHeaderLightPage } from "@/lib/use-header-theme";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const lightPage = useHeaderLightPage();
  const headerLight = scrolled || lightPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/catalog", label: tNav("catalog") },
  ];

  const tickerItems = [t("brandName"), tHome("heroBadge"), t("tagline")];

  return (
    <header className="fixed top-0 z-50 w-full">
      <div
        className={cn(
          "border-b py-2 transition-all duration-500",
          headerLight
            ? "border-border/50 bg-white/95 backdrop-blur-xl"
            : "border-white/10 bg-brand-blue/90 backdrop-blur-md"
        )}
      >
        <MarqueeText
          items={tickerItems}
          speed="slow"
          className={headerLight ? "text-brand-blue/30" : "text-white/50"}
        />
      </div>

      <div
        className={cn(
          "border-b transition-all duration-500",
          headerLight
            ? "border-border/50 bg-white/95 backdrop-blur-xl shadow-sm"
            : "border-white/10 bg-transparent backdrop-blur-sm"
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
          <I18nLink
            href="/"
            className={cn(
              "group transition-opacity hover:opacity-90",
              headerLight ? "text-brand-ink" : "text-white"
            )}
          >
            <BrandLogo variant="header" />
          </I18nLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <I18nLink
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  headerLight
                    ? "text-muted-foreground hover:bg-accent hover:text-brand-blue"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </I18nLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher scrolled={headerLight} />

            <I18nLink href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className={cn("relative", headerLight ? "text-brand-blue" : "text-white")}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </I18nLink>

            <I18nLink href="/account" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className={headerLight ? "text-brand-blue" : "text-white"}
              >
                <User className="h-5 w-5" />
              </Button>
            </I18nLink>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg md:hidden",
                  headerLight ? "text-brand-blue" : "text-white"
                )}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="mt-8 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <I18nLink
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-4 py-3 text-lg font-medium text-brand-blue hover:bg-accent"
                    >
                      {link.label}
                    </I18nLink>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
