import { createI18n } from 'vue-i18n';
import en from './locales/en';
import pt from './locales/pt';

export type Locale = 'en' | 'pt';

export function detectLocale(): Locale {
  const lang = typeof navigator !== 'undefined' ? navigator.language : '';
  return lang?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

const messages = { en, pt };

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
});

export function intlLocale(): string {
  return i18n.global.locale.value === 'pt' ? 'pt-BR' : 'en-US';
}

export function htmlLang(): string {
  return i18n.global.locale.value === 'pt' ? 'pt-BR' : 'en';
}

export default i18n;
