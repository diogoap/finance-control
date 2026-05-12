import { ref } from 'vue';
import api from '../lib/api';

export interface AccountTotal {
  _id: string;
  name: string;
  enabled: boolean;
  initialBalance: number;
  actualBalance: number;
}

export interface CategoryTotal {
  _id: string;
  name: string;
  type: 'Despesa' | 'Receita';
  enabled: boolean;
  totalAmount: number;
}

export interface TotalsBucket {
  previousBalance: number;
  totalIncomes: number;
  totalExpenses: number;
  partialBalance: number;
  totalLoans: number;
  actualBalance: number;
  accounts: AccountTotal[];
  categories: CategoryTotal[];
}

export interface TotalsResponse {
  previous: {
    all: Omit<TotalsBucket, 'categories'>;
    completed: Omit<TotalsBucket, 'categories'>;
  };
  current: {
    all: TotalsBucket;
    completed: TotalsBucket;
  };
}

export function emptyBucket(): TotalsBucket {
  return {
    previousBalance: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    partialBalance: 0,
    totalLoans: 0,
    actualBalance: 0,
    accounts: [],
    categories: [],
  };
}

export function useTotals() {
  const totals = ref<TotalsResponse | null>(null);
  const loading = ref(false);

  function buildDateFilter(begin: Date, end: Date): string {
    const startDate = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate());
    const endDate = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23,
      59,
      59,
      999,
    );
    return `dateBegin=${startDate.toString()}&dateEnd=${endDate.toString()}`;
  }

  async function fetchAll(begin: Date, end: Date) {
    loading.value = true;
    try {
      const filter = buildDateFilter(begin, end);
      const { data } = await api.get<TotalsResponse>(`/totals?${filter}`);
      totals.value = data;
    } finally {
      loading.value = false;
    }
  }

  return { totals, loading, fetchAll };
}
