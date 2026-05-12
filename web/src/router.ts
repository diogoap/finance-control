import { createRouter, createWebHistory } from 'vue-router';
import CategoriesView from './views/CategoriesView.vue';
import IncomesView from './views/IncomesView.vue';

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    { path: '/', redirect: '/categories' },
    { path: '/categories', name: 'categories', component: CategoriesView },
    { path: '/incomes', name: 'incomes', component: IncomesView },
  ],
});

export default router;
