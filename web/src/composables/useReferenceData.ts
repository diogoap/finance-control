import { ref } from 'vue';
import api from '../lib/api';

export interface Currency {
  _id: string;
  currencyCode: string;
  default?: boolean;
}

export interface Account {
  _id: string;
  name: string;
  currency_id?: string;
}

export interface CategoryRef {
  _id: string;
  name: string;
  type: 'Despesa' | 'Receita';
  enabled: boolean;
}

const currencies = ref<Currency[] | null>(null);
const accounts = ref<Account[] | null>(null);
const categoriesByType: Record<string, CategoryRef[]> = {};

let currenciesPromise: Promise<Currency[]> | null = null;
let accountsPromise: Promise<Account[]> | null = null;
const categoriesPromises: Record<string, Promise<CategoryRef[]> | undefined> = {};

export function useReferenceData() {
  async function loadCurrencies(): Promise<Currency[]> {
    if (currencies.value) return currencies.value;
    if (!currenciesPromise) {
      currenciesPromise = api
        .get<Currency[]>('/currencies?enabled=true')
        .then((r) => {
          currencies.value = r.data;
          return r.data;
        })
        .catch((err) => {
          currenciesPromise = null;
          throw err;
        });
    }
    return currenciesPromise;
  }

  async function loadAccounts(): Promise<Account[]> {
    if (accounts.value) return accounts.value;
    if (!accountsPromise) {
      accountsPromise = api
        .get<Account[]>('/accounts?enabled=true')
        .then((r) => {
          accounts.value = r.data;
          return r.data;
        })
        .catch((err) => {
          accountsPromise = null;
          throw err;
        });
    }
    return accountsPromise;
  }

  async function loadCategories(type: 'Despesa' | 'Receita'): Promise<CategoryRef[]> {
    if (categoriesByType[type]) return categoriesByType[type];
    let pending = categoriesPromises[type];
    if (!pending) {
      pending = api
        .get<CategoryRef[]>(`/categories?type=${type}&enabled=true`)
        .then((r) => {
          categoriesByType[type] = r.data;
          return r.data;
        })
        .catch((err) => {
          categoriesPromises[type] = undefined;
          throw err;
        });
      categoriesPromises[type] = pending;
    }
    return pending;
  }

  function getDefaultCurrencyId(list: Currency[]): string {
    return list.find((c) => c.default === true)?._id ?? '';
  }

  return {
    currencies,
    accounts,
    loadCurrencies,
    loadAccounts,
    loadCategories,
    getDefaultCurrencyId,
  };
}
