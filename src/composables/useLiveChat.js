// src/composables/useLiveChat.js
import { ref } from "vue";
import { auth, db } from "../services/firebase";

import { signInAnonymously } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";

export function useLiveChat(tmdbId) {
  const messages = ref([]);
  const loading = ref(false);
  const error = ref("");

  let unsub = null;

  async function ensureAnonAuth() {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  }

  async function start() {
    loading.value = true;
    error.value = "";
    try {
      await ensureAnonAuth();

      // ✅ chat por película (para que debatan “esa peli”)
      const q = query(
        collection(db, "messages"),
        where("tmdbId", "==", Number(tmdbId)),
        orderBy("createdAt", "desc"),
        limit(60)
      );

      unsub = onSnapshot(
        q,
        (snap) => {
          messages.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          loading.value = false;
        },
        () => {
          error.value = "No se pudo cargar el chat.";
          loading.value = false;
        }
      );
    } catch (e) {
      error.value = "No se pudo iniciar el chat (Auth/Firestore).";
      loading.value = false;
    }
  }

  function stop() {
    if (unsub) unsub();
    unsub = null;
  }

  async function send({ author, text }) {
    const t = String(text || "").trim();
    if (!t) return;

    await ensureAnonAuth();

    await addDoc(collection(db, "messages"), {
      tmdbId: Number(tmdbId),
      uid: auth.currentUser.uid,
      author: author?.trim() || "Anónimo",
      text: t.slice(0, 240),
      createdAt: serverTimestamp(),
    });
  }

  return { messages, loading, error, start, stop, send };
}
