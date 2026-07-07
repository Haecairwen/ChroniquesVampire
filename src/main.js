import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@fontsource/cinzel/400.css'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/400-italic.css'
import '@fontsource/eb-garamond/500.css'
import '@fontsource/eb-garamond/600.css'
import './assets/tailwind.css'
import { autosavePlugin, restoreAutosave } from 'Libs/autosave'
import i18n from './i18n'
import { initTheme } from 'Libs/uiTheme'

initTheme()

const pinia = createPinia()
pinia.use(autosavePlugin)

const app = createApp(App).use(pinia).use(i18n)

restoreAutosave()

app.mount('#app')
