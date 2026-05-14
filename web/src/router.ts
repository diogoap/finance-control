import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import CategoriesView from './views/CategoriesView.vue';
import IncomesView from './views/IncomesView.vue';
import ExpensesView from './views/ExpensesView.vue';
import AccountsView from './views/AccountsView.vue';
import TransfersView from './views/TransfersView.vue';
import LoansView from './views/LoansView.vue';
import LoginView from './views/LoginView.vue';
import LogoffView from './views/LogoffView.vue';
import { consumeOAuthHash, isLoggedIn } from './lib/session';

// Must run before createWebHistory below: Vue Router snapshots window.location
// at history-creation time and would re-write the hash back via replaceState
// on first navigation.
consumeOAuthHash();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/categories', name: 'categories', component: CategoriesView },
    { path: '/incomes', name: 'incomes', component: IncomesView },
    { path: '/expenses', name: 'expenses', component: ExpensesView },
    { path: '/accounts', name: 'accounts', component: AccountsView },
    { path: '/transfers', name: 'transfers', component: TransfersView },
    { path: '/loans', name: 'loans', component: LoansView },
    { path: '/login', name: 'login', component: LoginView, meta: { public: true } },
    { path: '/logoff', name: 'logoff', component: LogoffView, meta: { public: true } },
  ],
});

router.beforeEach((to) => {
  if (!to.meta.public && !isLoggedIn()) {
    return { name: 'login' };
  }
});

export default router;
