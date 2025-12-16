// Usa proxy local de Vite para evitar CORS:
// vite.config.js -> server.proxy['/guardian'] -> https://content.guardianapis.com
const BASE = "/guardian";
const KEY = import.meta.env.VITE_GUARDIAN_KEY;

// Fetch con query params (Guardian)
async function guardianFetch(path, params = {}) {
  if (!KEY) throw new Error("Falta VITE_GUARDIAN_KEY en .env");

  // con BASE relativo necesitas origin
  const url = new URL(`${BASE}${path}`, window.location.origin);

  Object.entries({ ...params, "api-key": KEY }).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Guardian ${res.status}: ${txt}`.trim());
  }
  return res.json();
}

function mapItem(item, category) {
  return {
    id: item.id,
    category,
    title: item.webTitle,
    date: item.webPublicationDate,
    url: item.webUrl,
    image: item.fields?.thumbnail || "",
    excerpt: item.fields?.trailText || "",
    source: "The Guardian",
  };
}

function isoDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - Number(days || 0));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ✅ Feed SOLO cine (Estrenos / Premios / Festivales)
// ✅ Soporta parámetros para “más antiguas” y “más contenido”
// ✅ FIX: no pide páginas que no existen (evita Guardian 400)
export async function getGuardianNewsFeed({ pagesPerCategory = 2, daysBack = 30 } = {}) {
  const common = {
    format: "json",
    section: "film",
    tag: "film/film,tone/news",
    "show-fields": "thumbnail,trailText",
    "order-by": "newest",
    "page-size": 15,
    "from-date": isoDateDaysAgo(daysBack),
  };

  const QUERIES = {
    Estrenos:
      '(release OR premiere OR trailer OR "box office" OR "opening weekend" OR sequel OR "coming soon")',
    Premios:
      '(oscar OR oscars OR nomination OR nominations OR "academy awards" OR bafta OR "golden globes")',
    Festivales:
      '(cannes OR venice OR berlinale OR sundance OR "toronto film festival" OR tiff OR "film festival")',
  };

  // ✅ pide primero page=1 para saber cuántas páginas hay, luego trae máximo pagesPerCategory
  async function fetchCategory(category) {
    const q = QUERIES[category];

    // 1) Page 1
    const first = await guardianFetch("/search", { ...common, q, page: 1 });
    const totalPages = Number(first.response?.pages || 1);

    const pageCount = Math.min(Number(pagesPerCategory), totalPages);
    const merged = [...(first.response?.results || [])];

    // 2) Pages 2..N solo si existen
    if (pageCount > 1) {
      const rest = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, i) => i + 2).map((page) =>
          guardianFetch("/search", { ...common, q, page })
        )
      );
      merged.push(...rest.flatMap((r) => r.response?.results || []));
    }

    return merged.map((x) => mapItem(x, category));
  }

  const [estrenos, premios, festivales] = await Promise.all([
    fetchCategory("Estrenos"),
    fetchCategory("Premios"),
    fetchCategory("Festivales"),
  ]);

  // quitar duplicados (a veces la misma nota aparece en 2 búsquedas)
  const seen = new Set();
  return [...estrenos, ...premios, ...festivales].filter((it) => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
}
