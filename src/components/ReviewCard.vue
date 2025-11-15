<script setup>
const props = defineProps({
  review: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-favorite'])

function onToggleFavorite() {
  emit('toggle-favorite', props.review.id)
}
</script>

<template>
  <article class="review-card" :class="{ 'is-favorite': review.favorite }">
    <img :src="review.cover" :alt="review.title" />

    <div class="review-content">
      <h2>{{ review.title }}</h2>
      <p>{{ review.text }}</p>

      <div class="review-footer">
        <span class="rating">★ {{ review.score.toFixed(1) }}</span>
        <span class="author">por {{ review.by }}</span>

        <button
          type="button"
          class="btn btn-sm"
          @click.stop="onToggleFavorite"
        >
          {{ review.favorite ? 'Quitar favorito' : 'Marcar favorito ⭐' }}
        </button>
      </div>
    </div>
  </article>
</template>
