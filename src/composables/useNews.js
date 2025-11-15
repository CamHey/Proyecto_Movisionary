import { ref, computed } from 'vue'

const seed = [
  {
    id: 1,
    title: '“Dune: Parte 2” rompe récords en su fin de semana',
    cat: 'estrenos',
    published: '2025-10-13T01:30:00-04:00',
    readMins: 4,
    cover: 'https://via-news.es/wp-content/uploads/2024/05/Dune500-1280x640.jpg'
  },
  {
    id: 2,
    title: 'Oscar: lista corta revela favoritas a Mejor Película',
    cat: 'premios',
    published: '2025-10-12T18:00:00-04:00',
    readMins: 3,
    cover: 'https://diariolomas.com.ar/wp-content/uploads/2025/03/oscars2025.jpg'
  },
  {
    id: 3,
    title: 'Cannes anuncia su alineación oficial',
    cat: 'festivales',
    published: '2025-10-11T10:00:00-04:00',
    readMins: 5,
    cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuuOXnrQuF0PYUYisxBCaf8hhy37WeFcPHqg&s'
  }
]

export function useNews () {
  const items = ref([...seed])
  const order = ref('desc')     // 'asc' | 'desc'
  const filter = ref('all')     // 'all' | 'estrenos' | 'premios' | 'festivales' | 'industria'

  const list = computed(() => {
    let arr = [...items.value]
    if (filter.value !== 'all') arr = arr.filter(n => n.cat === filter.value)
    arr.sort((a, b) => {
      const da = new Date(a.published).getTime()
      const db = new Date(b.published).getTime()
      return order.value === 'asc' ? da - db : db - da
    })
    return arr
  })

  return { items, order, filter, list }
}
