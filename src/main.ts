import { createPinia } from 'pinia'
import { createApp } from 'vue'

import 'vue3-carousel/carousel.css'
import App from './App.vue'
import router from './router'

import 'utilities-css/dist/utilities-css.css'
import './scss/styles.scss'

const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount('#app')
