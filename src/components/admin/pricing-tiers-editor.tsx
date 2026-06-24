"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TierDraft = { min_quantity: number; price: number };

type PricingTiersEditorProps = {
  tiers: TierDraft[];
  onChange: (tiers: TierDraft[]) => void;
};

export function PricingTiersEditor({ tiers, onChange }: PricingTiersEditorProps) {
  const update = (index: number, patch: Partial<TierDraft>) => {
    onChange(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  return (
    <div className="space-y-3">
      {tiers.map((tier, index) => (
        <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl border p-3">
          <div>
            <Label className="text-xs">Мін. кількість</Label>
            <Input
              type="number"
              min={1}
              value={tier.min_quantity}
              onChange={(e) =>
                update(index, { min_quantity: Number(e.target.value) || 1 })
              }
              className="mt-1 w-28"
            />
          </div>
          <div>
            <Label className="text-xs">Ціна (₴)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={tier.price}
              onChange={(e) => update(index, { price: Number(e.target.value) || 0 })}
              className="mt-1 w-32"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(tiers.filter((_, i) => i !== index))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...tiers, { min_quantity: 1, price: 0 }])}
      >
        <Plus className="mr-1 h-4 w-4" />
        Додати tier
      </Button>
    </div>
  );
}
