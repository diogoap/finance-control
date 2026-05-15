import { createI18n } from 'vue-i18n';
import en from './locales/en';
import pt from './locales/pt';
import { uiLocale, formatLocale } from '../lib/userLocale';

export type Locale = 'en' | 'pt';

const messages = { en, pt };

const i18n = createI18n({
  legacy: false,
  locale: uiLocale.value,
  fallbackLocale: 'en',
  messages,
});

export function intlLocale(): string {
  return formatLocale.value;
}

export function htmlLang(): string {
  return formatLocale.value || (uiLocale.value === 'pt' ? 'pt-BR' : 'en');
}

export default i18n;
