"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SweetCompositionItem } from "@/types/database";

type CompositionEditorProps = {
  items: SweetCompositionItem[];
  onChange: (items: SweetCompositionItem[]) => void;
};

export function CompositionEditor({ items, onChange }: CompositionEditorProps) {
  const update = (index: number, patch: Partial<SweetCompositionItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const add = () => {
    onChange([
      ...items,
      { name_uk: "", name_en: "", weight_grams: 0 },
    ]);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-4">
          <div>
            <Label className="text-xs">Назва (UK)</Label>
            <Input
              value={item.name_uk}
              onChange={(e) => update(index, { name_uk: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Name (EN)</Label>
            <Input
              value={item.name_en}
              onChange={(e) => update(index, { name_en: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Вага (г)</Label>
            <Input
              type="number"
              min={0}
              value={item.weight_grams}
              onChange={(e) =>
                update(index, { weight_grams: Number(e.target.value) || 0 })
              }
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" />
        Додати позицію
      </Button>
    </div>
  );
}
