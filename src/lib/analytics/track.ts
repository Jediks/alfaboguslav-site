export type AnalyticsEvent = "quote_submit" | "add_to_cart" | "begin_checkout";

type AnalyticsProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProps }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, props?: AnalyticsProps) {
  if (typeof window === "undefined") return;

  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }

  if (window.gtag) {
    window.gtag("event", event, props ?? {});
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props);
  }
}
