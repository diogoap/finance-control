import { computed, ref, type ComputedRef, type Ref } from 'vue';

function rowMatches(row: unknown, term: string): boolean {
  if (row == null) return false;
  if (typeof row === 'string') return row.toLowerCase().includes(term);
  if (typeof row === 'number' || typeof row === 'bigint') return String(row).toLowerCase().includes(term);
  if (typeof row === 'boolean') return false;
  if (Array.isArray(row)) return row.some((item) => rowMatches(item, term));
  if (typeof row === 'object') {
    return Object.values(row as Record<string, unknown>).some((value) => rowMatches(value, term));
  }
  return false;
}

export function useSearchFilter<T>(rows: Ref<T[]>): {
  searchTerm: Ref<string>;
  searchVisible: Ref<boolean>;
  filteredRows: ComputedRef<T[]>;
} {
  const searchTerm = ref('');
  const searchVisible = ref(false);

  const filteredRows = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) return rows.value;
    return rows.value.filter((row) => rowMatches(row, term));
  });

  return { searchTerm, searchVisible, filteredRows };
}
