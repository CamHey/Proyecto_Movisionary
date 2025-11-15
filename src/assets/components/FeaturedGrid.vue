<template>
  <div class="grid">
    <article class="card" v-for="c in cards" :key="c.titulo">
      <div class="thumb"><img :src="c.img" :alt="c.titulo" loading="lazy" /></div>
      <div class="content">
        <h3>{{ c.titulo }}</h3>
        <p class="meta">{{ c.meta }} — <span class="rate">{{ c.rate }}</span></p>
      </div>
    </article>
  </div>
</template>

<script setup>
const cards = [
  { titulo:'Dune: Part Two', img:'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg', meta:'Sci-fi • 2024', rate:'4.6★' },
  { titulo:'Oppenheimer', img:'https://www.infobae.com/new-resizer/1ts6qDldBD3hPPHLDxn05ajBqKs=/arc-anglerfish-arc2-prod-infobae/public/VLFHY43STVH3PBSEULWXPRCSIY.jpeg', meta:'Drama • 2023', rate:'4.8★' },
  { titulo:'Arcane', img:'https://images.justwatch.com/poster/322700683/s718/temporada-1.jpg', meta:'Animación • 2021', rate:'4.9★' },
  { titulo:'The Bear', img:'https://i.redd.it/a-poster-i-designed-for-the-bear-v0-3ivprpd5odfb1.jpg?width=1080&format=pjpg&auto=webp&s=fd439a98340d49e1771b1ece29a9ad68a59587c1', meta:'Drama/Comedia • 2022', rate:'4.7★' },
]
</script>
