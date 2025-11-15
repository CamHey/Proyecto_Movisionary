import { ref, computed } from 'vue'

const seedReviews = [
  {
    id: 1,
    title: 'Flow',
    cat: 'scifi',
    score: 4.6,
    by: 'Ana M.',
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkp9h8pwSaw471-lwrEO8jsy6aqe6ftG_Dxw&s',
    text: 'Producción de Letonia, Bélgica y Francia.'
  },
  {
    id: 2,
    title: 'Poor Things',
    cat: 'drama',
    score: 4.2,
    by: 'L. Rivera',
    cover: 'https://bhpcollectibles.com/wp-content/uploads/2024/01/1960-1024x749.jpg',
    text: 'Fábula audaz, visualmente exquisita.'
  },
  {
    id: 3,
    title: 'Spider-Verse',
    cat: 'animacion',
    score: 4.8,
    by: 'Nico P.',
    cover: 'https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/a528ec50-cc70-46f0-a2e3-31b279594daa/spider-man-across-the-spider-verse-banner-features-an-epic-number-of-spider-people.jpg',
    text: 'Animación innovadora y mucho corazón.'
  }
]

export function useReviews () {
  const items = ref([...seedReviews])
  const filter = ref('all')

  const list = computed(() => {
    return filter.value === 'all' ? items.value : items.value.filter(r => r.cat === filter.value)
  })

  return { items, filter, list }
}