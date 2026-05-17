import { ref } from 'vue';
import api from '../lib/api';
import { getActualMonth } from '../lib/dateUtils';
import type { Account, Currency } from './useReferenceData';

export type LoanType = 'Tomado' | 'Concedido';
export type LoanStatus = 'Em aberto' | 'Quitado';

export interface Loan {
  _id: string;
  description: string;
  transactionDate: string;
  dueDate: string;
  amount: number;
  account_id: string;
  currency_id: string;
  type: LoanType;
  status: LoanStatus;
  notes?: string;
  user_id?: string;
  _account?: Account | null;
  _currency?: Currency | null;
}

export type LoanFormPayload = Omit<Loan, '_id' | '_account' | '_currency'> & {
  _id?: string | null;
};

interface BalanceResponse {
  current: {
    all: {
      partialBalance: number;
    };
  };
}

function buildCurrentMonthFilter(): string {
  const { begin, end } = getActualMonth();
  const startDate = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
  return `dateBegin=${startDate.toString()}&dateEnd=${endDate.toString()}`;
}

export function useLoans() {
  const rows = ref<Loan[]>([]);
  const loading = ref(false);
  const selected = ref<Loan | null>(null);
  const listPaid = ref(false);
  const balance = ref<number>(0);

  async function fetchAll() {
    loading.value = true;
    try {
      const filter = listPaid.value ? '' : 'status=Em aberto';
      const [loansResp, balanceResp] = await Promise.all([
        api.get<Loan[]>(`/loans?${encodeURI(filter)}`),
        api.get<BalanceResponse>(`/totals/balance?${buildCurrentMonthFilter()}`),
      ]);
      rows.value = loansResp.data;
      balance.value = balanceResp.data?.current?.all?.partialBalance ?? 0;
      selected.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string): Promise<Loan> {
    const { data } = await api.get<Loan>(`/loans/${id}`);
    return data;
  }

  async function create(loan: LoanFormPayload): Promise<void> {
    await api.post('/loans', loan);
  }

  async function update(loan: LoanFormPayload): Promise<void> {
    if (!loan._id) throw new Error('Loan id is required for update');
    await api.patch(`/loans/${loan._id}`, loan);
  }

  async function remove(id: string): Promise<void> {
    await api.delete(`/loans/${id}`);
  }

  async function pay(id: string): Promise<void> {
    await api.patch(`/loans/${id}?pay=true`);
  }

  return {
    rows,
    loading,
    selected,
    listPaid,
    balance,
    fetchAll,
    getById,
    create,
    update,
    remove,
    pay,
  };
}
