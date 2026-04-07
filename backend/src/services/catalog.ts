import { supabase } from "../db/supabase.js";

// Cached catalog string — refreshed every 5 minutes
let _cachedCatalog: string | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get formatted catalog data for injection into Claude's system prompt.
 *
 * Currently reads directly from Supabase. In Day 4 this will be replaced
 * with a call to the x402-protected catalog-service via fetchWithPayment.
 */
export async function getCatalogData(): Promise<string> {
  const now = Date.now();
  if (_cachedCatalog && now - _cacheTimestamp < CACHE_TTL_MS) {
    return _cachedCatalog;
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("name, description, price, currency, category, in_stock")
    .order("name");

  if (error || !products || products.length === 0) {
    return "No hay productos disponibles en este momento.";
  }

  const catalog = products
    .map((p) => {
      const stock = p.in_stock ? "En stock" : "AGOTADO";
      return `- ${p.name} — $${p.price} ${p.currency} (${p.category}) [${stock}]\n  ${p.description}`;
    })
    .join("\n");

  _cachedCatalog = catalog;
  _cacheTimestamp = now;
  return catalog;
}
