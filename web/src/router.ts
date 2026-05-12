import { createRouter, createWebHistory } from 'vue-router';
import CategoriesView from './views/CategoriesView.vue';
import IncomesView from './views/IncomesView.vue';
import ExpensesView from './views/ExpensesView.vue';
import AccountsView from './views/AccountsView.vue';
import TransfersView from './views/TransfersView.vue';
import LoansView from './views/LoansView.vue';

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    { path: '/', redirect: '/categories' },
    { path: '/categories', name: 'categories', component: CategoriesView },
    { path: '/incomes', name: 'incomes', component: IncomesView },
    { path: '/expenses', name: 'expenses', component: ExpensesView },
    { path: '/accounts', name: 'accounts', component: AccountsView },
    { path: '/transfers', name: 'transfers', component: TransfersView },
    { path: '/loans', name: 'loans', component: LoansView },
  ],
});

export default router;
