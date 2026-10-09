export const NOCTURNE_TITLES: Record<string, string> = { midnight: "Midnight" };
export const NOCTURNE_VARIANTS = ["midnight"] as const;
export type NocturneVariant = (typeof NOCTURNE_VARIANTS)[number];
export function buildNocturneDocument(variant?: any, customization?: any): string { return ""; }
