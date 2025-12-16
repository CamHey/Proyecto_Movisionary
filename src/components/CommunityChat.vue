<!-- src/components/CommunityChat.vue -->
<template>
  <section class="chat-wrap">
    <header class="chat-head">
      <div>
        <h3 class="chat-title">Comunidad</h3>
        <p class="chat-sub">
          Chat en vivo · <strong>tmdbId:</strong> {{ roomId }}
          <span v-if="meUid" class="dot">•</span>
          <span v-if="meUid" class="muted">conectado</span>
        </p>
      </div>

      <div class="badge" :title="`${count} mensajes`">{{ count }}</div>
    </header>

    <div class="chat-controls">
      <button
        class="chip"
        :class="{ active: sort === 'asc' }"
        @click="setSort('asc')"
        :disabled="loading"
      >
        Más antiguos
      </button>

      <button
        class="chip"
        :class="{ active: sort === 'desc' }"
        @click="setSort('desc')"
        :disabled="loading"
      >
        Más nuevos
      </button>

      <button class="chip ghost" @click="reload" :disabled="loading">
        {{ loading ? "Cargando..." : "Recargar" }}
      </button>

      <span class="spacer"></span>

      <!-- ✅ DEMO BOT -->
      <label class="toggle">
        <input type="checkbox" v-model="demoBot" />
        <span class="toggle-ui"></span>
        <span class="toggle-text">Bots demo</span>
      </label>

      <button class="chip ghost" @click="seedExample" :disabled="loading || seeding || !demoBot">
        {{ seeding ? "Generando..." : "Ejemplo" }}
      </button>
    </div>

    <!-- ✅ Toast -->
    <p v-if="toastMsg" class="toast" :class="toastType" aria-live="polite">
      {{ toastMsg }}
    </p>

    <div class="chat-box" ref="listEl">
      <!-- ✅ ERROR -->
      <div v-if="error && !loading" class="state error">
        <p class="state-title">No se pudo cargar el chat.</p>
        <p class="state-sub">{{ error }}</p>
        <button class="chip" @click="reload">Reintentar</button>
      </div>

      <!-- ✅ LOADING -->
      <div v-else-if="loading" class="state loading">
        <div class="skeleton" v-for="i in 6" :key="i"></div>
      </div>

      <!-- ✅ EMPTY -->
      <div v-else-if="!messages.length" class="empty">
        <p class="empty-title">No hay mensajes aún.</p>
        <p class="empty-sub">Sé el primero en abrir el debate 👀</p>
        <p v-if="demoBot" class="empty-sub muted">
          Tip: presiona “Ejemplo” para generar una conversación automática.
        </p>
      </div>

      <!-- ✅ LIST + ANIMATIONS -->
      <div v-else class="msg-list">
        <TransitionGroup name="msg" tag="div" class="msg-stack">
          <article
            v-for="m in messages"
            :key="m.id"
            class="msg-row"
            :class="{ me: isMine(m), bot: !!m.bot }"
          >
            <div class="avatar" aria-hidden="true">
              {{ initialOf(m.author || "A") }}
            </div>

            <div class="msg-body">
              <div class="msg-meta">
                <span class="author">{{ m.author || "Anónimo" }}</span>
                <span class="dot">•</span>
                <span class="time">{{ timeAgo(m.createdAt) }}</span>

                <button
                  v-if="canDelete(m)"
                  class="trash"
                  title="Eliminar"
                  @click="askDelete(m)"
                >
                  🗑
                </button>
              </div>

              <div class="bubble">
                <p class="text">{{ m.text }}</p>
              </div>
            </div>
          </article>
        </TransitionGroup>
      </div>

      <!-- ✅ typing fake -->
      <div v-if="botTyping" class="typing">
        {{ botTyping }}
      </div>
    </div>

    <form class="composer" @submit.prevent="send">
      <input
        class="input"
        type="text"
        placeholder="Nombre (opcional)"
        v-model="author"
        maxlength="32"
        :disabled="sending"
      />

      <textarea
        class="textarea"
        placeholder="Escribe tu mensaje..."
        v-model="text"
        maxlength="240"
        rows="3"
        :disabled="sending"
        @keydown.enter.exact.prevent="send"
      ></textarea>

      <div class="composer-foot">
        <span class="muted">Máx 240 caracteres.</span>
        <button class="btn" type="submit" :disabled="sending || !canSend">
          {{ sending ? "Enviando..." : "Enviar" }}
        </button>
      </div>
    </form>

    <!-- ✅ Modal confirm delete -->
    <div v-if="confirmOpen" class="modal-backdrop" @click.self="closeConfirm">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <h3 id="confirmTitle" class="modal-title">¿Eliminar mensaje?</h3>
        <p class="modal-text">Esta acción no se puede deshacer.</p>

        <div class="modal-actions">
          <button class="chip ghost" @click="closeConfirm">Cancelar</button>
          <button class="chip danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? "Eliminando..." : "Eliminar" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { db, auth } from "../services/firebase";
import { signInAnonymously } from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const props = defineProps({
  tmdbId: { type: [String, Number], required: true },
});

const roomId = computed(() => String(props.tmdbId));

const messages = ref([]);
const loading = ref(true);
const error = ref("");
const sending = ref(false);

const sort = ref("asc"); // asc = viejo→nuevo (chat normal)
const listEl = ref(null);

const author = ref(localStorage.getItem("movisionary:name") || "");
const text = ref("");

watch(author, (v) => {
  try {
    localStorage.setItem("movisionary:name", v || "");
  } catch {}
});

const meUid = computed(() => auth.currentUser?.uid || "");
const count = computed(() => messages.value.length);

const canSend = computed(() => {
  const t = String(text.value || "").trim();
  return t.length >= 1 && t.length <= 240;
});

let unsub = null;

// =====================
// ✅ Toast (Publicado/Eliminado)
// =====================
const toastMsg = ref("");
const toastType = ref("ok"); // ok | warn | danger
let toastTimer = null;

function showToast(msg, type = "ok") {
  toastMsg.value = msg;
  toastType.value = type;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMsg.value = "";
  }, 2500);
}

// =====================
// ✅ Modal eliminar
// =====================
const confirmOpen = ref(false);
const deleting = ref(false);
const target = ref(null);

function askDelete(m) {
  target.value = m;
  confirmOpen.value = true;
}
function closeConfirm() {
  confirmOpen.value = false;
  target.value = null;
}

async function confirmDelete() {
  const m = target.value;
  if (!m?.id) return;

  deleting.value = true;
  try {
    await deleteDoc(doc(db, "rooms", roomId.value, "messages", m.id));
    showToast("Eliminado ✅", "warn");
    closeConfirm();
  } catch (e) {
    console.error(e);
    showToast("No se pudo eliminar 😿", "danger");
    error.value = "No se pudo eliminar el mensaje.";
  } finally {
    deleting.value = false;
  }
}

// =====================
// ✅ UI helpers
// =====================
function initialOf(name) {
  const n = String(name || "A").trim();
  return (n[0] || "A").toUpperCase();
}

function timeAgo(v) {
  if (!v) return "hace un momento";

  const d =
    typeof v?.toDate === "function"
      ? v.toDate()
      : typeof v === "number"
      ? new Date(v)
      : new Date(String(v));

  if (Number.isNaN(d.getTime())) return "hace un momento";

  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");

  const diffHr = Math.round(diffSec / 3600);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");

  const diffDay = Math.round(diffSec / 86400);
  return rtf.format(diffDay, "day");
}

function isMine(m) {
  return !!m?.uid && m.uid === meUid.value;
}

function canDelete(m) {
  return isMine(m) && !m?.bot; // solo tuyo y no bot
}

// =====================
// ✅ DEMO BOTS (tu lógica, mejorada)
// =====================
const demoBot = ref(localStorage.getItem("movisionary:demoBot") === "1");
watch(demoBot, (v) => {
  try {
    localStorage.setItem("movisionary:demoBot", v ? "1" : "0");
  } catch {}
});

const botTyping = ref("");
const seeding = ref(false);

const timeouts = new Set();
function addTimeout(id) {
  timeouts.add(id);
}
function clearAllTimeouts() {
  for (const t of timeouts) clearTimeout(t);
  timeouts.clear();
}

const BOT_NAMES = [
  "Nico","Majo","Leo","Sara","Diego","Vale","Pablo","Camila","Lau","Rafa","Sofi","Mario","Dani","Ana"
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function normalize(s) {
  return String(s || "").toLowerCase();
}

function chooseReply(userText) {
  const t = normalize(userText);

  if (/(hola|holas|buenas|hey|que tal|como estan|cómo están)/.test(t)) {
    const a = pick(["Holaa 👋", "Buenas 😄", "Heyy, ¿qué tal?", "Holaa, ¿qué opinas de la peli?"]);
    const b = pick(["¿Te gustó o te decepcionó?", "¿La recomiendas?", "¿Cuál fue tu escena favorita?", "¿Vale la pena verla?"]);
    return [a, b];
  }

  if (/(vale la pena|recomiendan|merece|esta buena|sirve)/.test(t)) {
    const a = pick(["Sí vale.","Depende tu mood.","Yo diría que sí, pero es lenta.","Visualmente es brutal.","A mí me encantó, pero no es para todos."]);
    const b = pick(["Si te gusta sci-fi serio, te atrapa.","Si esperas acción cada 5 min, te va a cansar.","La música + foto = top.","El ritmo es tranqui, pero engancha.","Mírala con paciencia y se disfruta."]);
    return [a, b];
  }

  if (/(final|explic|spoiler|trompo|se cae|que paso al final)/.test(t)) {
    const a = pick(["(SPOILER) Para mí lo importante no es el objeto, es la decisión.","Se nota que lo dejan ambiguo a propósito.","Yo creo que sí se cae 😭","Nolan vibes: no importa, importa el viaje."]);
    const b = pick(["Fíjate en detalles: mirada, música, corte final.","Hay pistas visuales antes del corte.","La escena sugiere una cosa pero no confirma.","Yo lo interpreto como cierre emocional más que literal."]);
    return [a, b];
  }

  if (/(sobrevalor|decepcion|aburr|me dorm|malis|horrible|me encant|buenis|obra maestra)/.test(t)) {
    const a = pick(["Te entiendo 😅","Nahh, para mí es buenísima.","Depende mucho del mood.","La actuación la rompe.","La historia puede sentirse pesada."]);
    const b = pick(["Si la ves esperando thriller, choca.","Si la ves con expectativa chill, entra mejor.","Yo la vi cansado y me pegó raro.","A mí me pasó al revés: me atrapó full.","Igual está bueno debatirlo 🙌"]);
    return [a, b];
  }

  if (/(parecid|recomend|que veo|algo como|similar a)/.test(t)) {
    const a = pick([
      "Te tiro una lista: Arrival, Blade Runner 2049, The Martian.",
      "Mira: Arrival, Contact, Ex Machina.",
      "Parecidas: Interstellar / Arrival / Annihilation.",
      "Si quieres tensión: Prisoners o Sicario."
    ]);
    const b = pick([
      "Si quieres mind-bender: Shutter Island o Memento.",
      "Y si quieres algo clásico: 2001: Odisea del espacio.",
      "Confía: Arrival te deja pensando fuerte.",
      "Si te gustó lo emocional: Her (distinto pero pega)."
    ]);
    return [a, b];
  }

  if (/(mejor escena|escena favorit|momento|la parte donde)/.test(t)) {
    const a = pick([
      "Para mí la mejor escena es cuando se miran sin hablar.",
      "Mi favorita es la del final, pura tensión.",
      "La escena clave es cuando todo cambia de tono de golpe.",
      "La mejor parte es cuando suena la música y se entiende todo."
    ]);
    const b = pick([
      "Esa mirada es ‘ok, te respeto’ pero con trauma incluido 😂",
      "Ahí es donde la peli se vuelve otra cosa.",
      "Literal ahí se nota la intención del director.",
      "Ese momento te deja helado."
    ]);
    return [a, b];
  }

  if (/(review|critica|resumen|en 3|tres lineas)/.test(t)) {
    const a = pick([
      "Review rápida:\n\ntе ríes\nte tensas\nterminas con la cabeza explotada 🤯",
      "En 3 líneas:\n\nlento al inicio\nboom en medio\nfinal que te persigue",
      "Mini review:\n\nestética top\ntensión constante\ncierre memorable"
    ]);
    const b = pick(["10/10 descripción 😂", "Eso es demasiado real JAJA", "Me convenciste, la veo hoy.", "La música también suma un montón."]);
    return [a, b];
  }

  const a = pick(["Interesante… ¿por qué?", "Ok ok, te leo 👀", "¿Qué fue lo que más te gustó?", "¿Qué te pareció el ritmo?"]);
  const b = pick(["Yo tengo sentimientos encontrados.", "Se presta para debate fuerte.", "Cuenta tu punto con spoiler tag 😭", "A mí me pegó distinto."]);
  return [a, b];
}

async function postBotMessage(name, msg) {
  await ensureAuth();
  await addDoc(collection(db, "rooms", roomId.value, "messages"), {
    text: msg,
    author: name,
    bot: true,
    uid: `bot_${name.toLowerCase()}`,
    createdAt: serverTimestamp(),
  });
}

function simulateBotConversation(userText) {
  if (!demoBot.value) return;

  const [m1, m2] = chooseReply(userText);
  const name1 = pick(BOT_NAMES);
  let name2 = pick(BOT_NAMES);
  if (name2 === name1) name2 = pick(BOT_NAMES);

  botTyping.value = `${name1} está escribiendo...`;
  const t1 = setTimeout(async () => {
    try {
      botTyping.value = "";
      await postBotMessage(name1, m1);
    } catch (e) {
      console.error(e);
    }
  }, 650 + Math.random() * 850);
  addTimeout(t1);

  const t2Delay = 1500 + Math.random() * 1100;
  const t2Typing = setTimeout(() => {
    botTyping.value = `${name2} está escribiendo...`;
  }, Math.max(350, t2Delay - 450));
  addTimeout(t2Typing);

  const t2 = setTimeout(async () => {
    try {
      botTyping.value = "";
      await postBotMessage(name2, m2);
    } catch (e) {
      console.error(e);
    }
  }, t2Delay);
  addTimeout(t2);
}

async function seedExample() {
  if (!demoBot.value) return;
  seeding.value = true;

  try {
    const key = `movisionary:seeded:${roomId.value}`;
    if (localStorage.getItem(key) === "1") {
      showToast("Ejemplo ya generado ✅", "ok");
      seeding.value = false;
      return;
    }
    localStorage.setItem(key, "1");

    const convo = [
      { a: "Nico", t: "¿Alguien ya vio esta? ¿vale la pena o es puro humo?" },
      { a: "Majo", t: "Sí vale. Visualmente es una locura, pero es lenta." },
      { a: "Nico", t: "Lenta tipo “me duermo” o “me atrapa igual”?" },
      { a: "Leo",  t: "Yo me dormí 20 min 😭 pero cuando despiertas sigue siendo épica." },
    ];

    for (let i = 0; i < convo.length; i++) {
      const { a, t } = convo[i];
      botTyping.value = `${a} está escribiendo...`;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 520));
      botTyping.value = "";
      // eslint-disable-next-line no-await-in-loop
      await postBotMessage(a, t);
    }

    showToast("Ejemplo cargado ✅", "ok");
  } catch (e) {
    console.error(e);
    error.value = "No se pudo generar el ejemplo.";
    showToast("No se pudo generar 😿", "danger");
  } finally {
    botTyping.value = "";
    seeding.value = false;
  }
}

// =====================
// Firebase
// =====================
async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

function subscribe() {
  loading.value = true;
  error.value = "";

  if (unsub) unsub();

  const colRef = collection(db, "rooms", roomId.value, "messages");
  const q = query(colRef, orderBy("createdAt", sort.value), limit(200));

  unsub = onSnapshot(
    q,
    async (snap) => {
      error.value = "";
      loading.value = false;
      messages.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (sort.value === "asc") {
        await nextTick();
        scrollToBottom();
      }
    },
    (e) => {
      console.error(e);
      error.value = "No se pudo cargar el chat.";
      loading.value = false;
    }
  );
}

function reload() {
  subscribe();
}

function scrollToBottom() {
  const el = listEl.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight + 9999;
}

function setSort(v) {
  if (sort.value === v) return;
  sort.value = v;
}

async function send() {
  const t = String(text.value || "").trim();
  if (!t) return;

  try {
    sending.value = true;
    await ensureAuth();

    await addDoc(collection(db, "rooms", roomId.value, "messages"), {
      text: t,
      author: author.value?.trim() || "Anónimo",
      uid: auth.currentUser?.uid || null,
      createdAt: serverTimestamp(),
    });

    showToast("Publicado ✅", "ok");

    // ✅ dispara bots (solo si demo)
    simulateBotConversation(t);

    text.value = "";
    await nextTick();
    if (sort.value === "asc") scrollToBottom();
  } catch (e) {
    console.error(e);
    error.value = "No se pudo enviar el mensaje.";
    showToast("No se pudo publicar 😿", "danger");
  } finally {
    sending.value = false;
  }
}

watch(roomId, () => {
  botTyping.value = "";
  subscribe();
});

watch(sort, async () => {
  subscribe();
  await nextTick();
  if (sort.value === "asc") scrollToBottom();
});

onMounted(async () => {
  try {
    await ensureAuth();
  } catch (e) {
    console.error(e);
    error.value = "No se pudo autenticar (Auth).";
  } finally {
    subscribe();
  }
});

onBeforeUnmount(() => {
  if (unsub) unsub();
  clearAllTimeouts();
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.chat-wrap {
  border-radius: 24px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(5, 7, 20, 0.92);
}

.chat-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chat-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.chat-sub {
  margin: 6px 0 0;
  opacity: 0.75;
  font-size: 13px;
}

.dot {
  margin: 0 6px;
  opacity: 0.7;
}

.badge {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.chat-controls {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.spacer {
  flex: 1;
}

.chip {
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.10);
}

.chip.active {
  border-color: rgba(162, 186, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(162, 186, 255, 0.10);
}

.chip.ghost {
  background: transparent;
}

.chip.danger {
  border-color: rgba(255, 120, 120, 0.35);
  background: rgba(255, 120, 120, 0.12);
}

.chip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ✅ Toast */
.toast {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
}
.toast.ok {
  background: rgba(120, 255, 180, 0.10);
}
.toast.warn {
  background: rgba(255, 220, 140, 0.10);
}
.toast.danger {
  background: rgba(255, 120, 120, 0.10);
}

.chat-box {
  margin-top: 14px;
  height: 280px;
  overflow: auto;
  padding: 12px;
  border-radius: 18px;
  background: rgba(7, 10, 24, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
}

.state {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.state-title {
  margin: 0;
  font-weight: 800;
}
.state-sub {
  margin: 8px 0 0;
  opacity: 0.75;
}
.state.error {
  background: rgba(255, 120, 120, 0.08);
}
.state.loading {
  background: rgba(255, 255, 255, 0.03);
}

.skeleton {
  height: 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  margin: 10px 0;
}

.empty {
  height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  opacity: 0.9;
}

.empty-title {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
}

.empty-sub {
  margin: 8px 0 0;
  opacity: 0.75;
}

.msg-list {
  display: flex;
  flex-direction: column;
}

.msg-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ✅ Chat layout pro */
.msg-row {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: start;
}

.msg-row.me {
  grid-template-columns: 1fr 36px;
}
.msg-row.me .avatar {
  order: 2;
}
.msg-row.me .msg-body {
  order: 1;
  justify-self: end;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.06);
  font-weight: 800;
}

.msg-body {
  max-width: 85%;
}

.msg-meta {
  font-size: 12px;
  opacity: 0.78;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.author {
  font-weight: 700;
}

.time {
  opacity: 0.9;
}

.bubble {
  position: relative;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.06);
}

.msg-row.me .bubble {
  background: rgba(162, 186, 255, 0.10);
  border-color: rgba(162, 186, 255, 0.25);
}

.text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.trash {
  margin-left: auto;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.75;
  font-size: 16px;
}
.trash:hover {
  opacity: 1;
}

/* ✅ Animaciones */
.msg-enter-active,
.msg-leave-active {
  transition: all 180ms ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.msg-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.typing {
  position: sticky;
  bottom: 0;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  font-size: 13px;
  opacity: 0.85;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.composer {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.input,
.textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(7, 10, 24, 0.92);
  color: inherit;
  padding: 10px 12px;
  outline: none;
  font: inherit;
}

.textarea {
  border-radius: 16px;
  resize: vertical;
  min-height: 90px;
}

.input:focus,
.textarea:focus {
  border-color: rgba(162, 186, 255, 0.7);
  box-shadow: 0 0 0 3px rgba(162, 186, 255, 0.12);
}

.composer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.10);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.muted {
  opacity: 0.7;
  font-size: 13px;
}

/* ✅ Toggle bonito */
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.toggle input {
  display: none;
}
.toggle-ui {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.10);
  position: relative;
  transition: 0.2s ease;
}
.toggle-ui::after {
  content: "";
  width: 18px;
  height: 18px;
  border-radius: 999px;
  position: absolute;
  top: 50%;
  left: 3px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.75);
  transition: 0.2s ease;
}
.toggle input:checked + .toggle-ui {
  background: rgba(162, 186, 255, 0.20);
  border-color: rgba(162, 186, 255, 0.35);
}
.toggle input:checked + .toggle-ui::after {
  left: 21px;
}
.toggle-text {
  font-size: 13px;
  opacity: 0.85;
}

/* ✅ Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  z-index: 50;
}
.modal {
  width: min(420px, 92vw);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(20, 22, 30, 0.96);
}
.modal-title {
  margin: 0;
  font-size: 16px;
}
.modal-text {
  margin: 8px 0 0;
  opacity: 0.85;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}
</style>
