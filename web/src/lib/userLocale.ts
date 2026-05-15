import { ref } from 'vue';

export type UiLocale = 'en' | 'pt';

const UI_KEY = 'localePref:ui';
const FMT_KEY = 'localePref:format';

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

export function detectUiLocale(): UiLocale {
  const lang = typeof navigator !== 'undefined' ? navigator.language : '';
  return lang?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function detectFormatLocale(): string {
  const lang = typeof navigator !== 'undefined' ? navigator.language : '';
  return lang || 'en-US';
}

export function getStoredUi(): UiLocale | null {
  const v = safeGet(UI_KEY);
  return v === 'en' || v === 'pt' ? v : null;
}

export function getStoredFormat(): string | null {
  const v = safeGet(FMT_KEY);
  return v && v.length > 0 ? v : null;
}

const initialUi: UiLocale = getStoredUi() ?? detectUiLocale();
const initialFormat: string = getStoredFormat() ?? detectFormatLocale();

export const uiLocale = ref<UiLocale>(initialUi);
export const formatLocale = ref<string>(initialFormat);

export function setUiLocale(loc: UiLocale | null) {
  if (loc === null) {
    safeRemove(UI_KEY);
    uiLocale.value = detectUiLocale();
  } else {
    safeSet(UI_KEY, loc);
    uiLocale.value = loc;
  }
}

export function setFormatLocale(loc: string | null) {
  if (loc === null) {
    safeRemove(FMT_KEY);
    formatLocale.value = detectFormatLocale();
  } else {
    safeSet(FMT_KEY, loc);
    formatLocale.value = loc;
  }
}

export const FORMAT_LOCALE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'en-US', labelKey: 'settings.locale.formats.enUS' },
  { value: 'en-GB', labelKey: 'settings.locale.formats.enGB' },
  { value: 'en-NL', labelKey: 'settings.locale.formats.enNL' },
  { value: 'pt-BR', labelKey: 'settings.locale.formats.ptBR' },
  { value: 'pt-PT', labelKey: 'settings.locale.formats.ptPT' },
  { value: 'nl-NL', labelKey: 'settings.locale.formats.nlNL' },
  { value: 'de-DE', labelKey: 'settings.locale.formats.deDE' },
  { value: 'fr-FR', labelKey: 'settings.locale.formats.frFR' },
  { value: 'es-ES', labelKey: 'settings.locale.formats.esES' },
];
