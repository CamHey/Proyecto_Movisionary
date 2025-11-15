<!-- !Componente  hijo-->
<template>
  <div class="page-contact">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Soporte</p>
        <h1 class="gradient-title">Contacto</h1>
        <p class="sub">Prensa, sugerencias o feedback</p>
      </div>
    </section>

    <!-- Form -->

     <!-- TODO: Directivas-->
    <main class="container">
      <form class="panel form-grid" @submit.prevent="submit">
        <label>
          Nombre
          <input v-model.trim="form.name" required type="text" placeholder="Tu nombre" />
        </label>

        <label>
          Email
          <input v-model.trim="form.email" required type="email" placeholder="tu@email.com" />
        </label>

        <label class="full">
          Mensaje
          <textarea v-model.trim="form.msg" required rows="5" placeholder="Cuéntanos..."></textarea>
        </label>

        <div class="full">
          <button class="btn btn-primary" type="submit" :disabled="sending">
            {{ sending ? 'Enviando…' : 'Enviar' }}
          </button>
        </div>
      </form>
    </main>

    <footer class="main-footer">
      <div class="container"><p>© 2025 Movisionary · Contacto</p></div>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({ name: '', email: '', msg: '' })
const sending = ref(false)

function submit () {
  if (!form.name || !form.email || !form.msg) return
  sending.value = true
  // simulación de envío
  setTimeout(() => {
    alert('¡Gracias! Tu mensaje fue enviado 😀')
    sending.value = false
    form.name = ''
    form.email = ''
    form.msg = ''
  }, 600)
}
</script>
