import { ref } from 'vue';
import api from '../lib/api';

export type CategoryType = 'Despesa' | 'Receita';

export interface Category {
  _id: string;
  name: string;
  type: CategoryType;
  enabled: boolean;
}

export type NewCategory = Omit<Category, '_id'>;

export function useCategories() {
  const rows = ref<Category[]>([]);
  const loading = ref(false);
  const selected = ref<Category | null>(null);
  const listDisabled = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const filter = listDisabled.value ? '' : 'enabled=true';
      const { data } = await api.get<Category[]>(`/categories?${filter}`);
      rows.value = data;
      selected.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: string) {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  }

  async function create(category: NewCategory) {
    await api.post('/categories', category);
  }

  async function update(category: Category) {
    await api.patch(`/categories/${category._id}`, category);
  }

  async function toggleEnabled(id: string, enable: boolean) {
    const category = await getById(id);
    category.enabled = enable;
    await update(category);
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
