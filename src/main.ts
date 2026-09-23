import { createPinia } from 'pinia'
import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import 'vue3-toastify/dist/index.css'
import 'vue3-carousel/carousel.css'
import App from './App.vue'
import router from './router'

import 'utilities-css/dist/utilities-css.css'
import './scss/styles.scss'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(createPinia())

app.mount('#app')
