import Aura from '@primevue/themes/aura';

interface PrimeVueLocale {
  accept: string;
  reject: string;
  choose: string;
  upload: string;
  cancel: string;
  apply: string;
  clear: string;
  today: string;
  weekHeader: string;
  firstDayOfWeek: number;
  dayNames: string[];
  dayNamesShort: string[];
  dayNamesMin: string[];
  monthNames: string[];
  monthNamesShort: string[];
  emptyMessage: string;
  emptyFilterMessage: string;
  noFilter: string;
  pending: string;
}

export function buildPrimevueConfig(locale: PrimeVueLocale) {
  return {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
      },
    },
    locale,
  };
}
