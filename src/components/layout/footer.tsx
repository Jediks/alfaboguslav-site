"use client";

import { useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/catalog", label: tNav("catalog") },
    { href: "/about", label: tNav("about") },
    { href: "/contact", label: tNav("contact") },
  ] as const;

  const b2bLinks = [
    { href: "/catalog", label: t("b2bCatalog") },
    { href: "/compare", label: t("b2bCompare") },
    { href: "/contact", label: t("b2bQuote") },
    { href: "/#configurator", label: t("b2bConfigurator") },
  ] as const;

  return (
    <footer className="relative border-t border-white/10 bg-brand-blue text-white grain">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:py-16">
        <div className="md:col-span-2 lg:col-span-1">
          <Link href="/" className="mb-4 inline-block">
            <BrandLogo variant="footer" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">{t("description")}</p>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            {t("navigation")}
          </h3>
          <nav className="flex flex-col gap-2 text-sm text-white/70">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/account" className="transition-colors hover:text-white">
              {tCommon("account")}
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            {t("b2bTitle")}
          </h3>
          <nav className="flex flex-col gap-2 text-sm text-white/70">
            {b2bLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            {t("contact")}
          </h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <a
              href={`tel:${t("phone")}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0" />
              {t("phone")}
            </a>
            <a
              href={`mailto:${t("email")}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {t("email")}
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {t("address")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-6 text-center text-sm text-white/45">
        {t("rights", { year })}
      </div>
    </footer>
  );
}
