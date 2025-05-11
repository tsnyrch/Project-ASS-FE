import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useUserStore } from './stores/UserStore';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import './style.css';

loadFonts().then(() => {});

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const userStore = useUserStore();
userStore.initializeToken();
app.use(router).use(vuetify).mount('#app');
