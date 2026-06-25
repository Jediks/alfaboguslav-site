"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CompositionEditor } from "@/components/admin/composition-editor";
import {
  PricingTiersEditor,
  type TierDraft,
} from "@/components/admin/pricing-tiers-editor";
import { ProductImageUpload } from "@/components/admin/product-image-upload";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFormInput,
} from "@/lib/actions/products-admin";
import type { PackagingType, Product, SweetCompositionItem } from "@/types/database";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
  initialTiers?: TierDraft[];
};

const PACKAGING: PackagingType[] = ["cardboard", "tube", "wood", "metal"];

export function ProductForm({ mode, product, initialTiers = [] }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(product?.id ?? "");
  const [titleUk, setTitleUk] = useState(product?.title_uk ?? "");
  const [titleEn, setTitleEn] = useState(product?.title_en ?? "");
  const [descUk, setDescUk] = useState(product?.desc_uk ?? "");
  const [descEn, setDescEn] = useState(product?.desc_en ?? "");
  const [packaging, setPackaging] = useState<PackagingType>(
    product?.packaging_type ?? "cardboard"
  );
  const [weight, setWeight] = useState(product?.weight_grams ?? 500);
  const [tags, setTags] = useState((product?.b2b_tags ?? []).join(", "));
  const [sweetTypes, setSweetTypes] = useState((product?.sweet_types ?? []).join(", "));
  const [composition, setComposition] = useState<SweetCompositionItem[]>(
    product?.composition ?? []
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [tiers, setTiers] = useState<TierDraft[]>(
    initialTiers.length
      ? initialTiers
      : [
          { min_quantity: 1, price: 0 },
          { min_quantity: 51, price: 0 },
          { min_quantity: 201, price: 0 },
        ]
  );
  const [published, setPublished] = useState(
    (product as Product & { is_published?: boolean })?.is_published !== false
  );
  const [sortOrder, setSortOrder] = useState(
    (product as Product & { sort_order?: number })?.sort_order ?? 0
  );

  const buildInput = (): ProductFormInput => ({
    id: mode === "create" ? id : product!.id,
    title_uk: titleUk,
    title_en: titleEn,
    desc_uk: descUk,
    desc_en: descEn,
    images,
    packaging_type: packaging,
    composition,
    weight_grams: weight,
    b2b_tags: tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    sweet_types: sweetTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    is_published: published,
    sort_order: sortOrder,
    tiers: tiers.sort((a, b) => a.min_quantity - b.min_quantity),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const input = buildInput();
      if (mode === "create") {
        const result = await createProduct(input);
        toast.success("Набір створено");
        router.push(`/admin/products/${result.id}/edit`);
      } else {
        await updateProduct(input);
        toast.success("Збережено");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm("Видалити набір?")) return;
    setLoading(true);
    try {
      await deleteProduct(product.id);
      toast.success("Видалено");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-brand-blue">
          {mode === "create" ? "Новий набір" : `Редагування: ${product?.id}`}
        </h1>
        {mode === "edit" && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Видалити
          </Button>
        )}
      </div>

      <div className="glass space-y-4 rounded-3xl p-6 premium-shadow">
        {mode === "create" && (
          <div>
            <Label>ID (slug)</Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="set-12-50"
              required
              className="mt-1 font-mono"
            />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Назва UK</Label>
            <Input value={titleUk} onChange={(e) => setTitleUk(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label>Title EN</Label>
            <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required className="mt-1" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Опис UK</Label>
            <Textarea value={descUk} onChange={(e) => setDescUk(e.target.value)} required className="mt-1" rows={3} />
          </div>
          <div>
            <Label>Description EN</Label>
            <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} required className="mt-1" rows={3} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Упаковка</Label>
            <Select value={packaging} onValueChange={(v) => setPackaging(v as PackagingType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PACKAGING.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Вага (г)</Label>
            <Input type="number" min={0} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label>Сортування</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="mt-1" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>B2B теги (через кому)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Типи солодощів</Label>
            <Input value={sweetTypes} onChange={(e) => setSweetTypes(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="published" checked={published} onCheckedChange={(c) => setPublished(c === true)} />
          <Label htmlFor="published">Опубліковано в каталозі</Label>
        </div>
      </div>

      <div className="surface-panel rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Фото</h2>
        <ProductImageUpload images={images} onChange={setImages} />
      </div>

      <div className="surface-panel rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Склад набору</h2>
        <CompositionEditor items={composition} onChange={setComposition} />
      </div>

      <div className="surface-panel rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Ціни (B2B tiers)</h2>
        <PricingTiersEditor tiers={tiers} onChange={setTiers} />
      </div>

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Збереження…" : mode === "create" ? "Створити" : "Зберегти зміни"}
      </Button>
    </form>
  );
}
