import { intlLocale } from '../i18n';

function getDstTimezoneOffset(date: Date): number {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const maxOffSet = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const timezoneOffSet = date.getTimezoneOffset();
  if (timezoneOffSet > 0) {
    return maxOffSet - timezoneOffSet;
  }
  return Math.abs(timezoneOffSet);
}

export function getDateDst(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    getDstTimezoneOffset(date),
  );
}

export interface DateRange {
  begin: Date;
  end: Date;
}

export function getActualMonth(): DateRange {
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth();
  return { begin: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
}

export function getPreviousMonth(actualDate: Date | null | undefined): DateRange {
  const base = actualDate && !isNaN(actualDate.getTime()) ? actualDate : new Date();
  const y = base.getFullYear();
  const m = base.getMonth();
  return { begin: new Date(y, m - 1, 1), end: new Date(y, m, 0) };
}

export function getNextMonth(actualDate: Date | null | undefined): DateRange {
  const base = actualDate && !isNaN(actualDate.getTime()) ? actualDate : new Date();
  const y = base.getFullYear();
  const m = base.getMonth();
  return { begin: new Date(y, m + 1, 1), end: new Date(y, m + 2, 0) };
}

export function getBeginOfYear(actualDate: Date | null | undefined): DateRange {
  const base = actualDate && !isNaN(actualDate.getTime()) ? actualDate : new Date();
  let y = base.getFullYear();
  const m = base.getMonth();
  if (m === 0) y--;
  return { begin: new Date(y, 0, 1), end: new Date(y, 1, 0) };
}

export function getEndOfYear(actualDate: Date | null | undefined): DateRange {
  const base = actualDate && !isNaN(actualDate.getTime()) ? actualDate : new Date();
  let y = base.getFullYear();
  const m = base.getMonth();
  if (m === 11) y++;
  return { begin: new Date(y, 11, 1), end: new Date(y, 12, 0) };
}

export function isLatePayment(isOpen: boolean, dueDate: string | Date): boolean {
  if (!isOpen) return false;
  const today = getDateDst(new Date()).toISOString();
  const due = typeof dueDate === 'string' ? dueDate : dueDate.toISOString();
  return due < today;
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(): Intl.DateTimeFormat {
  const locale = intlLocale();
  let f = dateFormatters.get(locale);
  if (f) return f;
  f = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
  dateFormatters.set(locale, f);
  return f;
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return '';
  return getDateFormatter().format(d);
}

const numberFormatters = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(): Intl.NumberFormat {
  const locale = intlLocale();
  let f = numberFormatters.get(locale);
  if (f) return f;
  f = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  numberFormatters.set(locale, f);
  return f;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '';
  return getNumberFormatter().format(value);
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(code: string): Intl.NumberFormat | null {
  const locale = intlLocale();
  const key = `${locale}|${code}`;
  let f = currencyFormatters.get(key);
  if (f) return f;
  try {
    f = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(key, f);
    return f;
  } catch {
    return null;
  }
}

export function formatCurrency(
  value: number | null | undefined,
  code: string | null | undefined,
): string {
  if (value == null || isNaN(value)) return '';
  if (!code) return formatNumber(value);
  if (code.includes(' - ')) return `${code} ${formatNumber(value)}`;
  const f = getCurrencyFormatter(code);
  return f ? f.format(value) : `${code} ${formatNumber(value)}`;
}
