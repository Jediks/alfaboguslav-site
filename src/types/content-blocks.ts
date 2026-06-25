export type ContentBlockKey = "hero" | "testimonials" | "about";

export interface HeroStat {
  value: string;
  label_uk: string;
  label_en: string;
}

export interface HeroBlockData {
  badge_uk: string;
  badge_en: string;
  title_uk: string;
  title_en: string;
  subtitle_uk: string;
  subtitle_en: string;
  cta_primary_uk: string;
  cta_primary_en: string;
  cta_primary_href: string;
  cta_secondary_uk: string;
  cta_secondary_en: string;
  cta_secondary_href: string;
  image_url: string;
  vip_badge_uk: string;
  vip_badge_en: string;
  stats: HeroStat[];
}

export interface TestimonialItem {
  name: string;
  company: string;
  text_uk: string;
  text_en: string;
  rating?: number;
  avatar_url?: string;
}

export interface TestimonialsBlockData {
  label_uk: string;
  label_en: string;
  title_uk: string;
  title_en: string;
  marquee_brands: string[];
  items: TestimonialItem[];
}

export interface ContentBlock<TData = Record<string, unknown>> {
  id: string;
  block_key: ContentBlockKey;
  position: number;
  data: TData;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type HeroBlock = ContentBlock<HeroBlockData>;
export type TestimonialsBlock = ContentBlock<TestimonialsBlockData>;

export interface AboutBlockData {
  intro_uk: string;
  intro_en: string;
  mission_title_uk: string;
  mission_title_en: string;
  mission_description_uk: string;
  mission_description_en: string;
  values: { text_uk: string; text_en: string }[];
}

export type AboutBlock = ContentBlock<AboutBlockData>;

export const DEFAULT_HERO_BLOCK: HeroBlockData = {
  badge_uk: "30 років довіри B2B",
  badge_en: "30 years of B2B trust",
  title_uk: "Преміальні подарунки",
  title_en: "Premium gift sets",
  subtitle_uk:
    "Створюємо корпоративні новорічні набори, що вражають партнерів та мотивують команду. Персоналізація, оптові ціни, доставка по Україні.",
  subtitle_en:
    "We craft corporate New Year sets that impress partners and motivate teams. Personalization, wholesale pricing, delivery across Ukraine.",
  cta_primary_uk: "Переглянути каталог",
  cta_primary_en: "Browse catalog",
  cta_primary_href: "/catalog",
  cta_secondary_uk: "Підібрати набір",
  cta_secondary_en: "Find your set",
  cta_secondary_href: "#configurator",
  image_url: "/catalog/cutouts/hero-main.png?v=20260626e",
  vip_badge_uk: "Преміальні набори",
  vip_badge_en: "Premium sets",
  stats: [
    { value: "30+", label_uk: "років на ринку", label_en: "years on market" },
    {
      value: "500+",
      label_uk: "корпоративних клієнтів",
      label_en: "corporate clients",
    },
    {
      value: "98%",
      label_uk: "задоволених клієнтів",
      label_en: "satisfied clients",
    },
  ],
};

export const DEFAULT_TESTIMONIALS_BLOCK: TestimonialsBlockData = {
  label_uk: "Відгуки",
  label_en: "Reviews",
  title_uk: "Нам довіряють",
  title_en: "Trusted by leading companies",
  marquee_brands: [
    "SoftServe",
    "PrivatBank",
    "EPAM",
    "Nova Poshta",
    "Monobank",
    "Genesis",
  ],
  items: [
    {
      name: "Олена К.",
      company: "SoftServe",
      text_uk:
        "Замовили 200 наборів для IT-команди. Якість упаковки та солодощів на найвищому рівні. Менеджер супроводжував на кожному етапі.",
      text_en:
        "We ordered 200 sets for our IT team. The packaging quality and sweets are top-notch. The manager guided us at every step.",
    },
    {
      name: "Андрій М.",
      company: "PrivatBank",
      text_uk:
        "Персоналізація логотипом виглядала преміально. Рахунок для бухгалтерії — за один день. Рекомендуємо для B2B.",
      text_en:
        "Logo personalization looked premium. Accounting invoice ready in a day. Highly recommended for B2B.",
    },
    {
      name: "Марія С.",
      company: "Nova Poshta",
      text_uk:
        "Третій рік поспіль замовляємо корпоративні подарунки. Стабільна якість, гнучкі оптові ціни, швидка доставка.",
      text_en:
        "Third year in a row we order corporate gifts. Consistent quality, flexible wholesale pricing, fast delivery.",
    },
    {
      name: "Дмитро В.",
      company: "EPAM",
      text_uk:
        "Дерев'яні VIP-набори вразили партнерів. Прозоре ціноутворення за обсягом — зручно для закупівельного відділу.",
      text_en:
        "Wooden VIP sets impressed our partners. Transparent volume pricing — easy for procurement.",
    },
  ],
};

export const DEFAULT_ABOUT_BLOCK: AboutBlockData = {
  intro_uk:
    "Alpha Boguslav — сімейний український виробник B2B подарункових наборів. Понад 30 років ми допомагаємо компаніям вітати команди, партнерів і клієнтів преміальними солодкими колекціями та брендованою упаковкою.",
  intro_en:
    "Alpha Boguslav is a family-owned Ukrainian maker of B2B gift sets. For over 30 years we help companies celebrate teams, partners, and clients with premium sweet collections and branded packaging.",
  mission_title_uk: "Наша місія",
  mission_title_en: "Our mission",
  mission_description_uk:
    "Створювати подарункові рішення, які зміцнюють ділові відносини та допомагають висловити вдячність кожному отримувачу.",
  mission_description_en:
    "Create gift solutions that strengthen business relationships and help express gratitude to every recipient.",
  values: [
    {
      text_uk: "Якість перш за все: ретельно підібрані солодощі та надійна упаковка.",
      text_en: "Quality first: carefully selected sweets and reliable packaging.",
    },
    {
      text_uk: "Персоналізація: кожне замовлення може відображати ідентичність вашого бренду.",
      text_en: "Personalization: every order can reflect your brand identity.",
    },
    {
      text_uk: "Надійність: чіткі терміни, персональний менеджер та прозорі документи.",
      text_en: "Reliability: clear timelines, a dedicated manager, and transparent paperwork.",
    },
  ],
};
