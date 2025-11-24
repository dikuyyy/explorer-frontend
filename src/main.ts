import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './main.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import App from './App.vue'
import router from './router'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'base, primevue',
      },
      darkModeSelector: '.dark',
    },
  },
})
app.use(ConfirmationService)
app.use(ToastService)
app.use(createPinia())
app.use(router)

app.mount('#app')
