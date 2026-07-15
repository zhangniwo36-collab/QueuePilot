export type Locale = "en" | "zh";

export function resolveLocale(saved: string | null, browserLanguage: string): Locale {
  if (saved === "en" || saved === "zh") return saved;
  return browserLanguage.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function htmlLanguage(locale: Locale): "en" | "zh-CN" {
  return locale === "zh" ? "zh-CN" : "en";
}
