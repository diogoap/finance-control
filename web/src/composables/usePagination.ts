import { ref } from 'vue';

const PAGE_SIZE_KEY = 'prefs:pageSize';

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

function safeGet(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getStoredPageSize(): number | null {
  const v = safeGet(PAGE_SIZE_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const pageSize = ref<number>(getStoredPageSize() ?? DEFAULT_PAGE_SIZE);

export function setPageSize(size: number | null) {
  if (size === null) {
    safeRemove(PAGE_SIZE_KEY);
    pageSize.value = DEFAULT_PAGE_SIZE;
  } else {
    safeSet(PAGE_SIZE_KEY, String(size));
    pageSize.value = size;
  }
}
