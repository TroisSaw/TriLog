import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/css/tailwind.css'
import './assets/css/style.css'
import App from './App.vue'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
