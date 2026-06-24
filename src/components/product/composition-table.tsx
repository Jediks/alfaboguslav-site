"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SweetCompositionItem } from "@/types/database";

type CompositionTableProps = {
  composition: SweetCompositionItem[];
};

export function CompositionTable({ composition }: CompositionTableProps) {
  const t = useTranslations("product");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-white premium-shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-display">{t("composition")}</TableHead>
            <TableHead className="text-right font-display">{t("weight")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {composition.map((item, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">
                {locale === "en" ? item.name_en : item.name_uk}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {item.weight_grams}g
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
