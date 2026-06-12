import { createApp } from 'vue'
import App from './App.vue'
import '@fontsource/cinzel/400.css'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/400-italic.css'
import '@fontsource/eb-garamond/500.css'
import '@fontsource/eb-garamond/600.css'
import './assets/tailwind.css'
import store from './store'
import { restoreAutosave } from 'Libs/autosave'

restoreAutosave(store)

createApp(App)
    .use(store)
    .mount('#app')
