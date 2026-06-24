import type { Product, PricingTier, PackagingType } from "@/types/database";

export interface CatalogSetMeta {
  setCode: string;
  packagingCode: string;
  packagingNameUk: string;
  packagingNameEn: string;
  slug: string;
}

const CATALOG_IMG_VERSION = "20260625b";

function img(slug: string) {
  const v = `?v=${CATALOG_IMG_VERSION}`;
  return [
    `/catalog/cutouts/${slug}-packaging.png${v}`,
    `/catalog/sets/${slug}-packaging.jpg${v}`,
    `/catalog/cutouts/${slug}-contents.png${v}`,
    `/catalog/sets/${slug}-contents.jpg${v}`,
  ];
}

function tiers(id: string, base: number): PricingTier[] {
  return [
    { id: `${id}-t1`, product_id: id, min_quantity: 1, price: base },
    { id: `${id}-t2`, product_id: id, min_quantity: 51, price: Math.round(base * 0.9) },
    { id: `${id}-t3`, product_id: id, min_quantity: 201, price: Math.round(base * 0.82) },
  ];
}

export const CATALOG_SETS: (Product & { setCode: string; packagingNameUk: string })[] = [
  {
    id: "set-3-45",
    setCode: "3/45",
    title_uk: "Набір 3/45 — «Ялинкова іграшка»",
    title_en: "Set 3/45 — Christmas Ornament Tin",
    desc_uk:
      "Компактний металевий набір у формі ялинкової прикраси. 12 цукерок преміальних брендів — ідеально для невеликих корпоративних подарунків.",
    desc_en:
      "Compact metal gift set shaped like a Christmas ornament. 12 premium branded candies — perfect for small corporate gifts.",
    images: img("set-3-45"),
    packaging_type: "metal" as PackagingType,
    packagingNameUk: "Метал «Ялинкова іграшка»",
    weight_grams: 140,
    b2b_tags: ["Budget-friendly", "Bulk"],
    sweet_types: ["chocolate", "praline", "candy"],
    composition: [
      { name_uk: "Птахи Проти Орків (Лукас)", name_en: "Birds Against Orcs (Lukas)", weight_grams: 12 },
      { name_uk: "Патрон (Лукас)", name_en: "Patron (Lukas)", weight_grams: 12 },
      { name_uk: "Трюфель (Августіно)", name_en: "Truffle (Augustino)", weight_grams: 24 },
      { name_uk: "Золота лілія (Конті)", name_en: "Golden Lily (Konti)", weight_grams: 24 },
    ],
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "set-4-6",
    setCode: "4/6",
    title_uk: "Набір 4/6 — «Пірамідка»",
    title_en: "Set 4/6 — Pyramid Box",
    desc_uk: "Святкова картонна пірамідка з асорті цукерок Roshen. Елегантна форма та впізнавані смаки.",
    desc_en: "Festive cardboard pyramid with Roshen candy assortment. Elegant shape and familiar flavors.",
    images: img("set-4-6"),
    packaging_type: "cardboard",
    packagingNameUk: "Картон «Пірамідка»",
    weight_grams: 260,
    b2b_tags: ["Premium", "VIP"],
    sweet_types: ["chocolate", "praline", "caramel"],
    composition: [
      { name_uk: "Монблан (Рошен)", name_en: "Mont Blanc (Roshen)", weight_grams: 50 },
      { name_uk: "Ромашка (Рошен)", name_en: "Romashka (Roshen)", weight_grams: 20 },
      { name_uk: "CHOCO ZOO (Рошен)", name_en: "CHOCO ZOO (Roshen)", weight_grams: 10 },
      { name_uk: "Шалена бджілка (Рошен)", name_en: "Crazy Bee (Roshen)", weight_grams: 20 },
    ],
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "set-5-7",
    setCode: "5/7а",
    title_uk: "Набір 5/7а — «Ліхтарик жовто-блакитний»",
    title_en: "Set 5/7а — Yellow-Blue Lantern",
    desc_uk: "Картонний ліхтарик у кольорах прапора України. 23 цукерки від Лукас, Домінік, Августіно та ін.",
    desc_en: "Cardboard lantern in Ukrainian flag colors. 23 candies from Lukas, Dominik, Augustino and more.",
    images: img("set-5-7"),
    packaging_type: "cardboard",
    packagingNameUk: "Картон «Ліхтарик жовто-блакитний»",
    weight_grams: 375,
    b2b_tags: ["Best for IT", "Bulk"],
    sweet_types: ["chocolate", "praline", "caramel", "jelly"],
    composition: [
      { name_uk: "Патрон (Лукас)", name_en: "Patron (Lukas)", weight_grams: 24 },
      { name_uk: "Птахи Проти Орків (Лукас)", name_en: "Birds Against Orcs (Lukas)", weight_grams: 24 },
      { name_uk: "Трюфель (Августіно)", name_en: "Truffle (Augustino)", weight_grams: 24 },
      { name_uk: "Оленка 50г (Домінік)", name_en: "Olenka 50g (Dominik)", weight_grams: 50 },
    ],
    created_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "set-7-8a",
    setCode: "7/8а",
    title_uk: "Набір 7/8а — «Дракон 2024»",
    title_en: "Set 7/8а — Dragon 2024",
    desc_uk: "Яскравий картонний набір «Дракон» з 41 цукеркою. AVK, Лукас, Конті, Nestle, Рошен.",
    desc_en: "Vibrant cardboard Dragon set with 41 candies. AVK, Lukas, Konti, Nestle, Roshen.",
    images: img("set-7-8a"),
    packaging_type: "cardboard",
    packagingNameUk: "Картон «Дракон»",
    weight_grams: 495,
    b2b_tags: ["Best for IT", "Bulk"],
    sweet_types: ["chocolate", "praline", "candy", "caramel"],
    composition: [
      { name_uk: "Шарм (АВК)", name_en: "Charm (AVK)", weight_grams: 36 },
      { name_uk: "BiFesti (Лукас)", name_en: "BiFesti (Lukas)", weight_grams: 24 },
      { name_uk: "Lion 42г (Nestle)", name_en: "Lion 42g (Nestle)", weight_grams: 42 },
      { name_uk: "Yogurtini (Рошен)", name_en: "Yogurtini (Roshen)", weight_grams: 24 },
    ],
    created_at: "2024-01-04T00:00:00Z",
  },
  {
    id: "set-8-21",
    setCode: "8/21",
    title_uk: "Набір 8/21 — «Ліхтарик з орнаментом»",
    title_en: "Set 8/21 — Ornament Lantern",
    desc_uk: "Картонний ліхтарик з вишиванкою та оленями. 25 цукерок преміум-брендів.",
    desc_en: "Cardboard lantern with vyshyvanka pattern and reindeer. 25 premium branded candies.",
    images: img("set-8-21"),
    packaging_type: "cardboard",
    packagingNameUk: "Картон «Ліхтарик з орнаментом»",
    weight_grams: 510,
    b2b_tags: ["Premium"],
    sweet_types: ["chocolate", "praline"],
    composition: [
      { name_uk: "Молочний шоколад 90г (АВК)", name_en: "Milk Chocolate 90g (AVK)", weight_grams: 90 },
      { name_uk: "Трюфель (АВК)", name_en: "Truffle (AVK)", weight_grams: 24 },
      { name_uk: "Україна — це ми (Гольскі)", name_en: "Ukraine is Us (Golski)", weight_grams: 24 },
    ],
    created_at: "2024-01-05T00:00:00Z",
  },
  {
    id: "set-9-20",
    setCode: "9/20",
    title_uk: "Набір 9/20 — «Ліхтарик України»",
    title_en: "Set 9/20 — Ukraine Lantern",
    desc_uk: "Патріотичний картонний ліхтарик з 40 цукерками. Патрон, Рошен, Конті, Лукас.",
    desc_en: "Patriotic cardboard lantern with 40 candies. Patron, Roshen, Konti, Lukas.",
    images: img("set-9-20"),
    packaging_type: "cardboard",
    packagingNameUk: "Картон «Ліхтарик України»",
    weight_grams: 550,
    b2b_tags: ["Best for IT", "Bulk"],
    sweet_types: ["chocolate", "praline", "candy"],
    composition: [
      { name_uk: "Патрон 33г (Лукас)", name_en: "Patron 33g (Lukas)", weight_grams: 33 },
      { name_uk: "Шоколапки (Рошен)", name_en: "Shokolapky (Roshen)", weight_grams: 30 },
      { name_uk: "Золота лілія (Конті)", name_en: "Golden Lily (Konti)", weight_grams: 24 },
    ],
    created_at: "2024-01-06T00:00:00Z",
  },
  {
    id: "set-11-65",
    setCode: "11/65",
    title_uk: "Набір 11/65 — Zip-пакет",
    title_en: "Set 11/65 — Zip Bag",
    desc_uk: "Універсальний zip-пакет з 40 цукерками від AVK, Лукас, Конті, Тольскі. Оптимальний для масових замовлень.",
    desc_en: "Universal zip bag with 40 candies from AVK, Lukas, Konti, Tolski. Optimal for bulk orders.",
    images: img("set-11-65"),
    packaging_type: "tube",
    packagingNameUk: "Zip-пакет (дизайн в розробці)",
    weight_grams: 615,
    b2b_tags: ["Bulk", "Budget-friendly"],
    sweet_types: ["chocolate", "praline", "marzipan", "caramel"],
    composition: [
      { name_uk: "Трюфелі бельгійські (АВК)", name_en: "Belgian truffles (AVK)", weight_grams: 40 },
      { name_uk: "Праліне з фундуком (АВК)", name_en: "Hazelnut pralines (AVK)", weight_grams: 30 },
      { name_uk: "Халва ванільна 60г (ЗВ)", name_en: "Vanilla halva 60g (ZV)", weight_grams: 60 },
    ],
    created_at: "2024-01-07T00:00:00Z",
  },
  {
    id: "set-12-2",
    setCode: "12/2",
    title_uk: "Набір 12/2 — Фольгований пакет «Дракон»",
    title_en: "Set 12/2 — Dragon Foil Bag",
    desc_uk: "Фольгований пакет 20×30 см з 48 цукерками. Світоч, АВК, Лукас, Домінік, Mars.",
    desc_en: "Foil bag 20×30 cm with 48 candies. Svitoch, AVK, Lukas, Dominik, Mars.",
    images: img("set-12-2"),
    packaging_type: "tube",
    packagingNameUk: "Фольгований пакет «Дракон»",
    weight_grams: 700,
    b2b_tags: ["Bulk", "Best for IT"],
    sweet_types: ["chocolate", "praline", "candy"],
    composition: [
      { name_uk: "Трюфель (Світоч)", name_en: "Truffle (Svitoch)", weight_grams: 24 },
      { name_uk: "Шарм (АВК)", name_en: "Charm (AVK)", weight_grams: 24 },
      { name_uk: "Снікерс 50г (Mars)", name_en: "Snickers 50g (Mars)", weight_grams: 50 },
    ],
    created_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "set-16-26",
    setCode: "16/26",
    title_uk: "Набір 16/26 — «Різдвяна коробка»",
    title_en: "Set 16/26 — Christmas Box",
    desc_uk: "Преміальна різдвяна коробка з мотузковою ручкою. 55 цукерок, 840 г — для VIP-клієнтів.",
    desc_en: "Premium Christmas box with rope handle. 55 candies, 840g — for VIP clients.",
    images: img("set-16-26"),
    packaging_type: "cardboard",
    packagingNameUk: "Картон «Різдвяна коробка»",
    weight_grams: 840,
    b2b_tags: ["VIP", "Premium"],
    sweet_types: ["chocolate", "praline", "candy", "caramel"],
    composition: [
      { name_uk: "Оксамит ночі (АВК)", name_en: "Velvet Night (AVK)", weight_grams: 24 },
      { name_uk: "Снікерс / Твікс (Mars)", name_en: "Snickers / Twix (Mars)", weight_grams: 100 },
      { name_uk: "CHOCO ZOO (Рошен)", name_en: "CHOCO ZOO (Roshen)", weight_grams: 24 },
    ],
    created_at: "2024-01-09T00:00:00Z",
  },
  {
    id: "set-17-17",
    setCode: "17/17",
    title_uk: "Набір 17/17 — Коробка з віконцем",
    title_en: "Set 17/17 — Window Box",
    desc_uk: "Картонна коробка з прозорим віконцем. 69 цукерок Roshen — максимальне різноманіття смаків.",
    desc_en: "Cardboard box with transparent window. 69 Roshen candies — maximum flavor variety.",
    images: img("set-17-17"),
    packaging_type: "cardboard",
    packagingNameUk: "Коробка з віконцем",
    weight_grams: 870,
    b2b_tags: ["VIP", "Premium", "Finance"],
    sweet_types: ["chocolate", "praline", "caramel", "jelly"],
    composition: [
      { name_uk: "Монблан (Рошен)", name_en: "Mont Blanc (Roshen)", weight_grams: 50 },
      { name_uk: "Johnny Krocker (Рошен)", name_en: "Johnny Krocker (Roshen)", weight_grams: 40 },
      { name_uk: "Candy Nut (Рошен)", name_en: "Candy Nut (Roshen)", weight_grams: 40 },
    ],
    created_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "set-20-35",
    setCode: "20/35",
    title_uk: "Набір 20/35 — «Скринька зелено-червона»",
    title_en: "Set 20/35 — Green-Red Chest",
    desc_uk: "Найбільший набір каталогу — 1,165 г, 59 цукерок у святковій скриньці. Mars, Nestle, AVK, Рошен.",
    desc_en: "Largest catalog set — 1,165g, 59 candies in a festive chest. Mars, Nestle, AVK, Roshen.",
    images: img("set-20-35"),
    packaging_type: "wood",
    packagingNameUk: "Картон «Скринька зелено-червона»",
    weight_grams: 1165,
    b2b_tags: ["VIP", "Premium", "Partners"],
    sweet_types: ["chocolate", "praline", "truffle", "caramel"],
    composition: [
      { name_uk: "MilkyWay / Snickers mini (Mars)", name_en: "MilkyWay / Snickers mini (Mars)", weight_grams: 60 },
      { name_uk: "Монблан (Рошен)", name_en: "Mont Blanc (Roshen)", weight_grams: 100 },
      { name_uk: "Шоколад 90г (АВК)", name_en: "Chocolate 90g (AVK)", weight_grams: 90 },
    ],
    created_at: "2024-01-11T00:00:00Z",
  },
];

export const CATALOG_PRICING: Record<string, PricingTier[]> = Object.fromEntries(
  CATALOG_SETS.map((p) => {
    const base =
      p.weight_grams < 300
        ? 390
        : p.weight_grams < 500
          ? 590
          : p.weight_grams < 700
            ? 790
            : p.weight_grams < 900
              ? 1190
              : 1890;
    return [p.id, tiers(p.id, base)];
  })
);

export const MOCK_PRODUCTS: Product[] = CATALOG_SETS.map((item) => {
  const { setCode: _, packagingNameUk: __, ...product } = item;
  void _;
  void __;
  return product;
});

export const MOCK_PRICING = CATALOG_PRICING;

export const PACKAGING_TYPES: PackagingType[] = ["cardboard", "tube", "wood", "metal"];

export const SWEET_TYPES = [
  "chocolate",
  "praline",
  "marzipan",
  "caramel",
  "jelly",
  "candy",
  "marshmallow",
  "truffle",
  "toffee",
] as const;
