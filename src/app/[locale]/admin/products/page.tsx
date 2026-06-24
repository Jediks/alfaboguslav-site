import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProductsAdmin, getPricingTiers } from "@/lib/data/products";
import { getProductTitle } from "@/lib/data/product-utils";
import { formatPrice } from "@/lib/pricing";

type AdminProductsPageProps = {
  params: { locale: string };
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  params: { locale },
}: AdminProductsPageProps) {
  setRequestLocale(locale);
  const localeStr = locale === "uk" ? "uk-UA" : "en-US";
  const products = await getProductsAdmin();
  const pricingEntries = await Promise.all(
    products.map(async (p) => [p.id, await getPricingTiers(p.id)] as const)
  );
  const pricingMap = Object.fromEntries(pricingEntries);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-blue">Набори / товари</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} позицій</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Додати набір
          </Button>
        </Link>
      </div>

      <div className="glass rounded-3xl p-6 premium-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Упаковка</TableHead>
              <TableHead>Теги</TableHead>
              <TableHead>Від</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">{product.id}</TableCell>
                <TableCell className="font-medium">
                  {getProductTitle(product, locale)}
                </TableCell>
                <TableCell>{product.packaging_type}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.b2b_tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {formatPrice(pricingMap[product.id]?.[0]?.price ?? 0, localeStr)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm text-primary hover:underline"
                  >
                    Редагувати
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
