import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import App from './App.vue';
import router from './router';
import i18n from './i18n';
import en from './i18n/locales/en';
import pt from './i18n/locales/pt';
import { buildPrimevueConfig } from './primevue';
import './composables/useTheme';
import './style.css';

const app = createApp(App);

const primevueLocale = i18n.global.locale.value === 'pt' ? pt.primevue : en.primevue;

app.use(router);
app.use(i18n);
app.use(PrimeVue, buildPrimevueConfig(primevueLocale));
app.use(ConfirmationService);
app.use(ToastService);
app.directive('tooltip', Tooltip);

app.mount('#app');
