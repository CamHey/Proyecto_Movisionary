<template>
      <header class="header main-header">
    <div class="container">
      <!-- Logo -->
      <RouterLink class="logo" to="/" aria-label="Inicio">
        <span class="logo-mark">🎬</span>
        <span class="logo-type">Movisionary</span>
      </RouterLink>

      <!-- Hamburguesa (móvil) -->
      <button
        id="nav-toggle"
        aria-label="Abrir menú"
        :aria-expanded="isMenuOpen ? 'true' : 'false'"
        @click="toggleMenu"
      >
        ☰
      </button>
      
      <nav class="menu">
      <!-- ...tus links de router... -->
      <button type="button" class="btn btn-ghost" @click="toggle">
        <span v-if="isLight">🌙 Modo oscuro</span>
        <span v-else>☀️ Modo claro</span>
      </button>
      </nav>

      <!-- Menú principal -->
      <nav class="nav menu" aria-label="Navegación principal">
        <RouterLink :to="{ name:'home' }"     :class="{ active: isActive('/') }">Inicio</RouterLink>
        <RouterLink :to="{ name:'news' }"     :class="{ active: isActive('/news') }">Noticias</RouterLink>
        <RouterLink :to="{ name:'reviews' }"  :class="{ active: isActive('/reviews') }">Reseñas</RouterLink>
        <RouterLink :to="{ name:'library' }"  :class="{ active: isActive('/library') }">Biblioteca</RouterLink>
        <RouterLink :to="{ name:'top' }"      :class="{ active: isActive('/top') }">Top 10</RouterLink>
       

        <!-- 🔁 Interruptor Modo Infantil -->
        <div class="kids-toggle">
          <span class="kids-toggle-label">Modo Infantil</span>
          <label class="kids-switch">
            <input type="checkbox" v-model="kidsOn" @change="handleKidsToggle" />
            <span class="kids-slider"></span>
          </label>
        </div>

        <RouterLink class="btn btn-primary" to="/recommender">Recomendador</RouterLink>

        <!-- 🌙/☀️ Tema -->
        <button
          id="toggle-theme"
          class="btn-theme"
          :aria-label="isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'"
          type="button"
          @click="toggleTheme"
        >
          {{ isLight ? '☀️' : '🌙' }}
        </button>
      </nav>
    </div>
  </header>

</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'

/* ===== Router / estado activo ===== */
const route = useRoute()
const router = useRouter()
const isActive = (base) => route.path === base || route.path.startsWith(base + '/')

/* ===== Menú móvil ===== */
const isMenuOpen = ref(false)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  document.body.classList.toggle('nav-open', isMenuOpen.value)
}

/* ===== Modo Infantil (con PIN al salir) ===== */
const kidsOn = ref(route.path.startsWith('/kids'))

const handleKidsToggle = () => {
  const onKidsRoute = route.path.startsWith('/kids')

  // Encender -> ir a /kids
  if (kidsOn.value && !onKidsRoute) {
    router.push('/kids')
    return
  }

  // Apagar estando en /kids -> pedir PIN
  if (!kidsOn.value && onKidsRoute) {
    const pin = prompt('Solo adultos 👨‍👩‍👧: ingresa el PIN para salir del modo infantil (1234)')
    if (pin === '1234') {
      router.push('/')
    } else {
      alert('PIN incorrecto. Sigues en Movisionary Kids 🧸')
      kidsOn.value = true
    }
  }
}

// Sincroniza el switch cuando cambiamos de ruta manualmente
watch(() => route.path, (p) => {
  kidsOn.value = p.startsWith('/kids')
})

/* ===== Tema claro/oscuro (persistente) ===== */
const STORAGE_KEY = 'pref-theme'
const CLASS_LIGHT = 'theme-light'
const isLight = ref(false)

const applyTheme = (mode) => {
  isLight.value = (mode === 'light')
  document.body.classList.toggle(CLASS_LIGHT, isLight.value)
}

const toggleTheme = () => {
  const next = isLight.value ? 'dark' : 'light'
  localStorage.setItem(STORAGE_KEY, next)
  applyTheme(next)
}

const systemPrefersLight = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  const initial = (saved === 'light' || saved === 'dark') ? saved : (systemPrefersLight() ? 'light' : 'dark')
  applyTheme(initial)

  // Sincroniza entre pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
      applyTheme(e.newValue)
    }
  })
})
</script>