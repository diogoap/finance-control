import { createRouter, createWebHistory } from 'vue-router';
import CategoriesView from './views/CategoriesView.vue';

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    { path: '/', redirect: '/categories' },
    { path: '/categories', name: 'categories', component: CategoriesView },
  ],
});

export default router;
