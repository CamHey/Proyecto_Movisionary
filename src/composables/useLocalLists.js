// src/composables/useLocalLists.js
import { ref } from "vue";

const KEY_FAV = "movisionary_favorites_v1";
const KEY_WATCH = "movisionary_watchlist_v1";

// 🔔 tick para sincronizar pestañas
const KEY_TICK = "movisionary_lists_tick";

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
  // ✅ fuerza evento storage en otras pestañas
  localStorage.setItem(KEY_TICK, String(Date.now()));
}

export function useLocalLists() {
  const favorites = ref(readList(KEY_FAV));
  const watchlist = ref(readList(KEY_WATCH));

  const isFavorite = (id) => favorites.value.includes(Number(id));
  const isWatchlist = (id) => watchlist.value.includes(Number(id));

  function toggle(listRef, key, id) {
    const numId = Number(id);
    const i = listRef.value.indexOf(numId);

    if (i >= 0) listRef.value.splice(i, 1);
    else listRef.value.unshift(numId);

    try {
      writeList(key, listRef.value);
      // ✅ refresco dentro de la misma pestaña
      window.dispatchEvent(new CustomEvent("mv:lists"));
    } catch (e) {
      console.error("[Movisionary] localStorage error:", e);
      alert("No se pudo guardar la lista (localStorage bloqueado o sin espacio).");
    }
  }

  const toggleFavorite = (id) => toggle(favorites, KEY_FAV, id);
  const toggleWatchlist = (id) => toggle(watchlist, KEY_WATCH, id);

  return {
    favorites,
    watchlist,
    isFavorite,
    isWatchlist,
    toggleFavorite,
    toggleWatchlist,
  };
}
