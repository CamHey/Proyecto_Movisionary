import { ref } from 'vue'

// ranking base (puedes reemplazar por tu fuente)
const baseTop = [
  { id: 1, title: 'Dune: Part Two', score: 9.3 },
  { id: 2, title: 'Oppenheimer', score: 9.1 },
  { id: 3, title: 'Arcane', score: 9.5 },
  { id: 4, title: 'The Bear', score: 9.0 },
  { id: 5, title: 'Poor Things', score: 8.8 },
  { id: 6, title: 'Flow', score: 8.7 },
  { id: 7, title: 'Spider-Verse', score: 9.4 },
  { id: 8, title: 'The Last of Us', score: 9.0 },
  { id: 9, title: 'Coco', score: 8.6 },
  { id:10, title: 'Moana', score: 8.4 },
]

export function useTop () {
  const top = ref(baseTop.slice(0, 10))

  // ejemplo for: render progresivo (btn "Cargar más")
  const visible = ref(5)
  function loadMore(count = 5) {
    visible.value = Math.min(top.value.length, visible.value + count)
  }

  // ejemplo do...while: “Top sorpresa” sin repetición (N elementos)
  function randomPick(n = 4) {
    const out = []
    const used = new Set()
    do {
      const i = Math.floor(Math.random() * top.value.length)
      if (!used.has(i)) {
        used.add(i)
        out.push(top.value[i])
      }
    } while (out.length < Math.min(n, top.value.length))
    return out
  }

  return { top, visible, loadMore, randomPick }
}
