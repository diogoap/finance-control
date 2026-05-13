import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

import App from './App.vue';
import router from './router';
import { primevueConfig } from './primevue';
import { consumeOAuthHash } from './lib/session';
import './composables/useTheme';
import './style.css';

consumeOAuthHash();

const app = createApp(App);

app.use(router);
app.use(PrimeVue, primevueConfig);
app.use(ConfirmationService);
app.use(ToastService);
app.directive('tooltip', Tooltip);

app.mount('#app');
