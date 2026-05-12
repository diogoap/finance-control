import { ref } from 'vue';
import api from '../lib/api';

export interface Account {
  _id: string;
  name: string;
  initialBalance: number;
  order: number;
  enabled: boolean;
  currency_id: string;
  user_id?: string;
  _currency?: { _id: string; currencyCode: string } | null;
}

export type NewAccount = Omit<Account, '_id' | 'user_id' | '_currency'>;

export function useAccounts() {
  const rows = ref<Account[]>([]);
  const loading = ref(false);
  const selected = ref<Account | null>(null);
  const listDisabled = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const filter = listDisabled.value ? '' : 'enabled=true';
      const { data } = await api.get<Account[]>(`/accounts?${filter}`);
      rows.value = data;
      selected.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string) {
    const { data } = await api.get<Account>(`/accounts/${id}`);
    return data;
  }

  async function create(account: NewAccount) {
    await api.post('/accounts', account);
  }

  async function update(account: Account) {
    await api.patch(`/accounts/${account._id}`, account);
  }

  async function toggleEnabled(id: string, enable: boolean) {
    const account = await getById(id);
    account.enabled = enable;
    await update(account);
  }

  return {
    rows,
    loading,
    selected,
    listDisabled,
    fetchAll,
    getById,
    create,
    update,
    toggleEnabled,
  };
}
