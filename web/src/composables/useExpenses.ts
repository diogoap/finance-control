import { ref } from 'vue';
import api from '../lib/api';
import type { Account, Currency, CategoryRef } from './useReferenceData';

export type ExpenseStatus = 'Em aberto' | 'Pago';

export interface ExpenseDetail {
  _id?: string;
  description: string;
  amount: number;
  account_id: string;
  category_id: string;
  currency_id: string;
  status: ExpenseStatus;
  _account?: Account;
  _category?: CategoryRef;
  _currency?: Currency;
  _key?: string;
}

export interface Expense {
  _id: string;
  description: string;
  dueDate: string;
  scheduledPayment?: boolean;
  amount: number;
  amountPaid: number;
  status: ExpenseStatus;
  notes?: string;
  user_id?: string;
  account_id?: string | null;
  category_id?: string | null;
  currency_id?: string | null;
  _account?: Account | null;
  _category?: CategoryRef | null;
  _currency?: Currency | null;
  _accountNames?: string;
  _categoryNames?: string;
  _currencyCodes?: string;
  detail: ExpenseDetail[];
}

export type ExpenseFormPayload = Omit<
  Expense,
  '_id' | '_account' | '_category' | '_currency' | '_accountNames' | '_categoryNames' | '_currencyCodes'
> & {
  _id?: string | null;
};

export interface BalanceResponse {
  current: {
    all: {
      partialBalance: number;
    };
  };
}

export function compareDetails(a: ExpenseDetail, b: ExpenseDetail): number {
  if (a.description < b.description) return -1;
  if (a.description > b.description) return 1;
  return 0;
}

export function useExpenses() {
  const rows = ref<Expense[]>([]);
  const loading = ref(false);
  const selected = ref<Expense | null>(null);
  const balance = ref<number>(0);

  function buildDateFilter(begin: Date, end: Date): string {
    const y1 = begin.getFullYear();
    const m1 = begin.getMonth();
    const d1 = begin.getDate();
    const startDate = new Date(y1, m1, d1);

    const y2 = end.getFullYear();
    const m2 = end.getMonth();
    const d2 = end.getDate();
    const endDate = new Date(y2, m2, d2, 23, 59, 59, 999);

    return `dateBegin=${startDate.toString()}&dateEnd=${endDate.toString()}`;
  }

  async function fetchAll(begin: Date, end: Date) {
    loading.value = true;
    try {
      const filter = buildDateFilter(begin, end);
      const [expensesResp, balanceResp] = await Promise.all([
        api.get<Expense[]>(`/expenses?${filter}`),
        api.get<BalanceResponse>(`/totals/balance?${filter}`),
      ]);
      rows.value = expensesResp.data;
      balance.value = balanceResp.data?.current?.all?.partialBalance ?? 0;
      selected.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string): Promise<Expense> {
    const { data } = await api.get<Expense>(`/expenses/${id}`);
    return data;
  }

  async function create(expense: ExpenseFormPayload): Promise<void> {
    await api.post('/expenses', expense);
  }

  async function update(expense: ExpenseFormPayload): Promise<void> {
    if (!expense._id) throw new Error('Expense id is required for update');
    await api.patch(`/expenses/${expense._id}`, expense);
  }

  async function remove(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  }

  async function pay(id: string): Promise<void> {
    await api.patch(`/expenses/${id}?pay=true`);
  }

  return {
    rows,
    loading,
    selected,
    balance,
    fetchAll,
    getById,
    create,
    update,
    remove,
    pay,
  };
}
