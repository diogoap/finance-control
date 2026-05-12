import { ref } from 'vue';
import api from '../lib/api';
import type { Account, Currency, CategoryRef } from './useReferenceData';

export type IncomeStatus = 'Em aberto' | 'Recebido';

export interface IncomeDetail {
  _id?: string;
  description: string;
  amount: number;
  account_id: string;
  category_id: string;
  currency_id: string;
  status: IncomeStatus;
  _account?: Account;
  _category?: CategoryRef;
  _currency?: Currency;
  _key?: string;
}

export interface Income {
  _id: string;
  description: string;
  dueDate: string;
  amount: number;
  amountReceived: number;
  status: IncomeStatus;
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
  detail: IncomeDetail[];
}

export type IncomeFormPayload = Omit<Income, '_id' | '_account' | '_category' | '_currency' | '_accountNames' | '_categoryNames' | '_currencyCodes'> & {
  _id?: string | null;
};

export interface BalanceResponse {
  current: {
    all: {
      partialBalance: number;
    };
  };
}

export function compareDetails(a: IncomeDetail, b: IncomeDetail): number {
  if (a.description < b.description) return -1;
  if (a.description > b.description) return 1;
  return 0;
}

export function useIncomes() {
  const rows = ref<Income[]>([]);
  const loading = ref(false);
  const selected = ref<Income | null>(null);
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
      const [incomesResp, balanceResp] = await Promise.all([
        api.get<Income[]>(`/incomes?${filter}`),
        api.get<BalanceResponse>(`/totals/balance?${filter}`),
      ]);
      rows.value = incomesResp.data;
      balance.value = balanceResp.data?.current?.all?.partialBalance ?? 0;
      selected.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string): Promise<Income> {
    const { data } = await api.get<Income>(`/incomes/${id}`);
    return data;
  }

  async function create(income: IncomeFormPayload): Promise<void> {
    await api.post('/incomes', income);
  }

  async function update(income: IncomeFormPayload): Promise<void> {
    if (!income._id) throw new Error('Income id is required for update');
    await api.patch(`/incomes/${income._id}`, income);
  }

  async function remove(id: string): Promise<void> {
    await api.delete(`/incomes/${id}`);
  }

  async function receive(id: string): Promise<void> {
    await api.patch(`/incomes/${id}?receive=true`);
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
    receive,
  };
}
