"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Bookmark, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";

export function SavedCarts() {
  const t = useTranslations("cart.savedCarts");
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const savedCarts = useCartStore((s) => s.savedCarts);
  const saveCart = useCartStore((s) => s.saveCart);
  const restoreCart = useCartStore((s) => s.restoreCart);
  const deleteSavedCart = useCartStore((s) => s.deleteSavedCart);
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (items.length === 0 && savedCarts.length === 0) return null;

  const handleSave = () => {
    if (items.length === 0) return;
    saveCart(name);
    setName("");
    toast.success(t("saved"));
  };

  return (
    <div className="mt-8 surface-panel rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-brand-blue">
          {t("title")}
        </h2>
      </div>

      {items.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="sm:max-w-xs"
          />
          <Button onClick={handleSave}>{t("save")}</Button>
        </div>
      )}

      {savedCarts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {savedCarts.map((cart) => (
            <li
              key={cart.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-white p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-brand-blue">{cart.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t("itemsCount", { count: cart.items.length })} ·{" "}
                  {new Date(cart.savedAt).toLocaleDateString(
                    locale === "uk" ? "uk-UA" : "en-US"
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    restoreCart(cart.id);
                    toast.success(t("restored"));
                  }}
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  {t("restore")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSavedCart(cart.id)}
                  className="text-destructive hover:text-destructive"
                  title={t("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
