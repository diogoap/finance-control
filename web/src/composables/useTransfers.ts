import { ref } from 'vue';
import api from '../lib/api';
import type { Account, Currency } from './useReferenceData';
import type { BalanceResponse } from './useIncomes';

export interface Transfer {
  _id: string;
  date: string;
  amount: number;
  accountOrigin_id: string;
  accountTarget_id: string;
  currency_id: string;
  user_id?: string;
  _accountOrigin?: Account | null;
  _accountTarget?: Account | null;
  _currency?: Currency | null;
}

export type TransferFormPayload = Omit<
  Transfer,
  '_id' | '_accountOrigin' | '_accountTarget' | '_currency'
> & {
  _id?: string | null;
};

export function useTransfers() {
  const rows = ref<Transfer[]>([]);
  const loading = ref(false);
  const selected = ref<Transfer | null>(null);
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
      const [transfersResp, balanceResp] = await Promise.all([
        api.get<Transfer[]>(`/transfers?${filter}`),
        api.get<BalanceResponse>(`/totals/balance?${filter}`),
      ]);
      rows.value = transfersResp.data;
      balance.value = balanceResp.data?.current?.all?.partialBalance ?? 0;
      selected.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string): Promise<Transfer> {
    const { data } = await api.get<Transfer>(`/transfers/${id}`);
    return data;
  }

  async function create(transfer: TransferFormPayload): Promise<void> {
    await api.post('/transfers', transfer);
  }

  async function update(transfer: TransferFormPayload): Promise<void> {
    if (!transfer._id) throw new Error('Transfer id is required for update');
    await api.patch(`/transfers/${transfer._id}`, transfer);
  }

  async function remove(id: string): Promise<void> {
    await api.delete(`/transfers/${id}`);
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
  };
}
