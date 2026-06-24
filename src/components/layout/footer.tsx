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

  return (
    <footer className="border-t border-border/50 bg-brand-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-3">
        <div>
          <Link href="/" className="mb-4 inline-block">
            <BrandLogo variant="footer" />
          </Link>
          <p className="text-sm leading-relaxed text-white/70">{t("description")}</p>
        </div>

        <div>
          <h3 className="mb-4 font-display font-semibold">{t("navigation")}</h3>
          <nav className="flex flex-col gap-2 text-sm text-white/70">
            <Link href="/" className="hover:text-white transition-colors">{tNav("home")}</Link>
            <Link href="/catalog" className="hover:text-white transition-colors">{tNav("catalog")}</Link>
            <Link href="/account" className="hover:text-white transition-colors">{tCommon("account")}</Link>
            <Link href="/login" className="hover:text-white transition-colors">{tCommon("login")}</Link>
          </nav>
        </div>

        <div>
          <h3 className="mb-4 font-display font-semibold">{t("contact")}</h3>
          <div className="flex flex-col gap-3 text-sm text-white/70">
            <a href={`tel:${t("phone")}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="h-4 w-4" /> {t("phone")}
            </a>
            <a href={`mailto:${t("email")}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="h-4 w-4" /> {t("email")}
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {t("address")}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        {t("rights", { year })}
      </div>
    </footer>
  );
}
