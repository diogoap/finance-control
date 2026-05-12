import { computed, ref, watch } from 'vue';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DARK_CLASS = 'dark';
const VALID_MODES: ThemeMode[] = ['system', 'light', 'dark'];

function readInitial(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (VALID_MODES as string[]).includes(stored)) {
    return stored as ThemeMode;
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches === true
  );
}

const mode = ref<ThemeMode>(readInitial());
const systemDark = ref<boolean>(systemPrefersDark());
const isDark = computed(
  () => mode.value === 'dark' || (mode.value === 'system' && systemDark.value),
);

function apply() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(DARK_CLASS, isDark.value);
}

apply();

watch(isDark, apply);
watch(mode, (value) => {
  window.localStorage.setItem(STORAGE_KEY, value);
});

if (typeof window !== 'undefined' && window.matchMedia) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener?.('change', (event) => {
    systemDark.value = event.matches;
  });
}

export function useTheme() {
  return {
    mode,
    isDark,
    setMode(value: ThemeMode) {
      mode.value = value;
    },
  };
}
