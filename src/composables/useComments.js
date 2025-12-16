import { ref, unref } from "vue";

function storageKey(tmdbId) {
  return `movisionary:comments:${tmdbId}`;
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function useComments(tmdbId) {
  const comments = ref([]);
  const loading = ref(false);
  const error = ref("");

  const key = () => storageKey(String(unref(tmdbId)));

  const load = () => {
    loading.value = true;
    error.value = "";
    try {
      const raw = localStorage.getItem(key());
      comments.value = raw ? safeParse(raw, []) : [];
    } catch (e) {
      error.value = "No se pudieron cargar comentarios.";
      comments.value = [];
    } finally {
      loading.value = false;
    }
  };

  const persist = () => {
    localStorage.setItem(key(), JSON.stringify(comments.value));
  };

  const add = ({ author, text }) => {
    const now = Date.now();
    const cleanText = String(text || "").trim();
    if (!cleanText) return;

    const item = {
      id: `${now}-${Math.random().toString(16).slice(2)}`,
      author: author || "Anónimo",
      text: cleanText,
      createdAt: now,
    };

    comments.value = [item, ...comments.value];
    persist();
  };

  const remove = (id) => {
    comments.value = comments.value.filter((c) => c.id !== id);
    persist();
  };

  return { comments, loading, error, load, add, remove };
}
