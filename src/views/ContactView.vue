<template>
  <div class="page-contact">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Comunidad</p>
        <h1 class="gradient-title">Contacto</h1>
        <p class="sub">Únete al canal oficial o envíanos feedback</p>
      </div>
    </section>

    <main class="container">
      <!-- ✅ CTA principal: Canal -->
      <section class="panel" style="margin: 18px 0; padding: 16px;">
        <h2 style="margin: 0 0 6px;">Canal oficial de WhatsApp</h2>
        <p style="margin: 0 0 12px; opacity: .9;">
          Novedades, estrenos, teorías y avisos del proyecto.
        </p>

        <a
          class="btn btn-primary"
          :href="WHATSAPP_CHANNEL_LINK"
          target="_blank"
          rel="noopener noreferrer"
        >
          Unirme al canal
        </a>

        <p class="meta" style="margin-top: 10px; opacity: .85;">
          Se abrirá WhatsApp Web o la app en tu teléfono.
        </p>
      </section>

      <!-- ✅ Form REAL: envía a tu Gmail con Formspree -->
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

        <!-- Honeypot anti-spam (oculto). Si se llena, no enviamos -->
        <input
          v-model="form.honey"
          type="text"
          autocomplete="off"
          tabindex="-1"
          aria-hidden="true"
          style="position:absolute; left:-9999px; opacity:0; height:0; width:0;"
        />

        <div class="full" style="display:flex; gap:12px; align-items:center;">
          <button class="btn btn-primary" type="submit" :disabled="sending">
            {{ sending ? 'Enviando…' : 'Enviar' }}
          </button>

          <span v-if="sent" class="meta" style="opacity:.9;">
            ✅ ¡Listo! Tu mensaje llegó a nuestro correo.
          </span>

          <span v-if="errorMsg" class="meta" style="opacity:.9;">
            ❌ {{ errorMsg }}
          </span>
        </div>

        <p class="meta full" style="margin-top: 10px; opacity: .75;">
          *Este formulario envía mediante Formspree (sin backend).
        </p>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { WHATSAPP_CHANNEL_LINK } from '/src/config/whatsapp'
import { FORMSPREE_ENDPOINT } from '/src/config/formspree'

const form = reactive({ name: '', email: '', msg: '', honey: '' })
const sending = ref(false)
const sent = ref(false)
const errorMsg = ref('')

async function submit () {
  // validación rápida
  if (!form.name || !form.email || !form.msg) return

  // anti-spam: si el bot llenó el honeypot, no hacemos nada
  if (form.honey) return

  sending.value = true
  sent.value = false
  errorMsg.value = ''

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        message: form.msg,
        source: 'Movisionary Contact'
      })
    })

    if (!res.ok) throw new Error('No se pudo enviar. Revisa tu conexión o intenta más tarde.')

    // éxito
    sent.value = true
    form.name = ''
    form.email = ''
    form.msg = ''
    form.honey = ''
    setTimeout(() => (sent.value = false), 2500)
  } catch (e) {
    errorMsg.value = e?.message || 'Ups, no se pudo enviar.'
  } finally {
    sending.value = false
  }
}
</script>
