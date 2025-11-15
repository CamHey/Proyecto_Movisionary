<template>
  <!-- ✅ misma clase para tu paleta infantil -->
  <div class="kids-body">
    <!-- ✅ HEADER SOLO MODO KIDS -->
    <header class="kids-header">
      <div class="logo">
        <span class="logo-mark">🎈</span>
        <span class="logo-text">Movisionary <span>Kids</span></span>
      </div>

      <nav class="kids-nav" aria-label="Navegación modo infantil">
        <a href="#k-inicio"    :class="{active: tab==='k-inicio'}"    @click.prevent="setTab('k-inicio')">Inicio</a>
        <a href="#k-news"      :class="{active: tab==='k-news'}"      @click.prevent="setTab('k-news')">Noticias</a>
        <a href="#k-resenas"   :class="{active: tab==='k-resenas'}"   @click.prevent="setTab('k-resenas')">Reseñas</a>
        <a href="#k-library"   :class="{active: tab==='k-library'}"   @click.prevent="setTab('k-library')">Biblioteca</a>
        <a href="#k-top"       :class="{active: tab==='k-top'}"       @click.prevent="setTab('k-top')">Top 10</a>
        <a href="#k-recom"     :class="{active: tab==='k-recom'}"     @click.prevent="setTab('k-recom')">Recomendador</a>
      </nav>

      <div class="kids-actions">
        <button class="btn-exit-kids" @click="solicitarPinYSalir">Salir 🔒</button>
      </div>
    </header>

    <main class="kids-main">
      <!-- 🟡 INICIO -->
      <section id="k-inicio" class="kids-section" :class="{active: tab==='k-inicio'}">
        <h1 class="kids-title">Movisionary Kids</h1>
        <p class="kids-subtitle">
          Una zona pensada para niños y niñas: interfaz clara, colores alegres
          y solo títulos aptos para todo público.
        </p>

        <div class="cta-row">
          <a href="#k-library" class="btn-kids" @click.prevent="setTab('k-library')">🎬 Ver catálogo infantil</a>
          <button type="button" class="btn-kids" @click="solicitarPinYSalir">⬅ Volver al modo normal</button>
        </div>

        <div class="kids-grid" style="margin-top:18px;">
          <article class="kids-card"><h3>+100</h3><p>Títulos familiares</p></article>
          <article class="kids-card"><h3>Seguro</h3><p>Sin contenido adulto</p></article>
          <article class="kids-card"><h3>Color</h3><p>Experiencia amigable</p></article>
        </div>
      </section>

      <!-- 🎨 CATÁLOGO INFANTIL DESTACADO -->
      <section id="k-library" class="kids-section" :class="{active: tab==='k-library'}">
        <h2 class="kids-title">Catálogo infantil destacado</h2>
        <p class="kids-subtitle">Ejemplos de títulos aptos para todo público.</p>

        <div class="kids-grid">
          <article class="kids-card" v-for="c in catalogo" :key="c.titulo">
            <img :src="c.img" :alt="c.titulo" />
            <h3>{{ c.titulo }}</h3>
            <p>{{ c.desc }}</p>
            <span class="tag-age">{{ c.edad }}</span>
          </article>
        </div>
      </section>

      <!-- 📰 NOTICIAS -->
      <section id="k-news" class="kids-section" :class="{active: tab==='k-news'}">
        <h2 class="kids-title">Noticias para peques</h2>
        <p class="kids-subtitle">Novedades con contenido cuidado y positivo.</p>
        <div class="kids-list">
          <article class="kids-news">
            <h3>Nuevo especial animado familiar</h3>
            <p>Historias cortas con mensajes de amistad y trabajo en equipo.</p>
          </article>
          <article class="kids-news">
            <h3>Festival de cine infantil</h3>
            <p>Películas de todo el mundo pensadas para niños y niñas.</p>
          </article>
        </div>
      </section>

      <!-- ⭐ RESEÑAS -->
      <section id="k-resenas" class="kids-section" :class="{active: tab==='k-resenas'}">
        <h2 class="kids-title">Reseñas amigables</h2>
        <p class="kids-subtitle">Resumen rápido para mamás, papás y peques.</p>
        <div class="kids-list">
          <article class="kids-review"><h3>Frozen</h3><p>“Canciones pegajosas, hermanas fuertes y nada de sustos feos.”</p></article>
          <article class="kids-review"><h3>Moana</h3><p>“Aventura, humor y una heroína valiente que inspira.”</p></article>
        </div>
      </section>

      <!-- 🏆 TOP 10 -->
      <section id="k-top" class="kids-section" :class="{active: tab==='k-top'}">
        <h2 class="kids-title">Top 10 familiar</h2>
        <ol class="kids-top">
          <li v-for="(t,i) in top10" :key="t">{{ i+1 }}. {{ t }}</li>
        </ol>
      </section>

      <!-- 🤖 RECOMENDADOR -->
      <section id="k-recom" class="kids-section" :class="{active: tab==='k-recom'}">
        <h2 class="kids-title">Recomendador infantil</h2>
        <p class="kids-subtitle">Elige edad y tipo de historia para ver sugerencias seguras.</p>

        <form class="kids-form" @submit.prevent="kidsRecomendar">
          <label>
            Edad:
            <select v-model="edad">
              <option value="3">3-5 años</option>
              <option value="6">6-8 años</option>
              <option value="9">9-11 años</option>
              <option value="12">12+ años</option>
            </select>
          </label>
          <label>
            Tipo:
            <select v-model="tipo">
              <option value="aventura">Aventura</option>
              <option value="fantasia">Fantasía</option>
              <option value="educativo">Educativo</option>
              <option value="superheroes">Superhéroes suaves</option>
            </select>
          </label>
          <button type="submit" class="btn-kids">🔎 Recomendar</button>
        </form>

        <div id="resultadoKids" class="kids-result" v-if="sugerencias.length">
          <h3>Sugerencias:</h3>
          <ul><li v-for="s in sugerencias" :key="s">{{ s }}</li></ul>
        </div>
      </section>
    </main>

    <footer class="kids-footer">
      Movisionary Kids — Espacio colorido y seguro. No reemplaza la supervisión adulta. 💖
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// pestaña activa
const tab = ref('k-inicio')
const setTab = (t) => {
  tab.value = t
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// PIN para salir
function solicitarPinYSalir () {
  const pin = prompt('Solo adultos 👨‍👩‍👧: ingresa el PIN para salir del modo infantil (1234)')
  if (pin === '1234') {
    router.push('/') // vuelve al home SPA
  } else if (pin !== null) {
    alert('PIN incorrecto. Sigues en Movisionary Kids 🧸')
  }
}

// catálogo (igual que tu HTML)
const catalogo = ref([
  { titulo:'Toy Story',    edad:'+5 años', img:'https://m.media-amazon.com/images/I/81aA7hEEykL._AC_UF894,1000_QL80_.jpg', desc:'Amistad, humor y aventuras con juguetes.' },
  { titulo:'Frozen',       edad:'+5 años', img:'https://m.media-amazon.com/images/I/71tJ-V2uVPL._AC_SY679_.jpg',           desc:'Música, magia y hermanas valientes.' },
  { titulo:'Moana',        edad:'+7 años', img:'https://m.media-amazon.com/images/I/91cCwQK5B3L._AC_SY679_.jpg',           desc:'Aventura en el mar y empoderamiento.' },
  { titulo:'IntensaMente', edad:'+7 años', img:'https://m.media-amazon.com/images/I/81xR8rN6LCL._AC_SY679_.jpg',           desc:'Ideal para hablar de emociones.' }
])

const top10 = ref([
  'Toy Story','IntensaMente','Moana','Frozen','Up','Buscando a Nemo','Coco','Los Increíbles','Ratatouille','Mi vecino Totoro'
])

// Recomendador simple (mismo criterio que tu script)
const edad = ref('3')
const tipo = ref('aventura')
const sugerencias = ref([])

function kidsRecomendar(){
  const e = edad.value, t = tipo.value
  let s = []

  if (e === '3') {
    if (t === 'aventura') s = ['Peppa Pig', 'Pocoyó']
    if (t === 'fantasia') s = ['Masha y el Oso']
    if (t === 'educativo') s = ['Baby TV', 'Cantando Aprendo a Hablar']
    if (t === 'superheroes') s = ['PJ Masks']
  } else if (e === '6') {
    if (t === 'aventura') s = ['Moana', 'Cómo entrenar a tu dragón']
    if (t === 'fantasia') s = ['Frozen', 'Encanto']
    if (t === 'educativo') s = ['IntensaMente (con adulto)', 'Superlibro Kids']
    if (t === 'superheroes') s = ['Big Hero 6']
  } else if (e === '9') {
    if (t === 'aventura') s = ['Los Increíbles', 'Spider-Man: Un nuevo universo']
    if (t === 'fantasia') s = ['Coco', 'Harry Potter 1 (según criterio)']
    if (t === 'educativo') s = ['Documentales cortos NatGeo Kids']
    if (t === 'superheroes') s = ['Shazam (criterio adulto)']
  } else {
    if (t === 'aventura') s = ['Películas familiares de aventura']
    if (t === 'fantasia') s = ['Sagas juveniles suaves']
    if (t === 'educativo') s = ['Documentales juveniles']
    if (t === 'superheroes') s = ['Selección supervisada MCU/DC']
  }
  sugerencias.value = s
}
</script>
