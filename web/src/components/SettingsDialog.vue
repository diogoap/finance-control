<template>
  <Dialog
    :visible="visible"
    :header="$t('settings.title')"
    modal
    :style="{ width: 'min(34rem, 92vw)' }"
    :closable="false"
    @update:visible="handleClose"
  >
    <div class="flex flex-col gap-5">
      <section class="flex flex-col gap-4">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide m-0">
          {{ $t('settings.sections.locale') }}
        </h3>

        <div class="flex flex-col gap-1">
          <label for="localeUi" class="text-sm font-medium">{{ $t('settings.locale.uiLanguage') }}</label>
          <Select
            id="localeUi"
            v-model="uiChoice"
            :options="uiOptions"
            option-label="label"
            option-value="value"
          />
          <small class="text-slate-500">{{ $t('settings.locale.uiLanguageHint') }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label for="localeFormat" class="text-sm font-medium">{{ $t('settings.locale.formatLocale') }}</label>
          <Select
            id="localeFormat"
            v-model="formatChoice"
            :options="formatOptions"
            option-label="label"
            option-value="value"
          />
          <InputText
            v-if="formatChoice === '__custom'"
            v-model="customFormat"
            :placeholder="$t('settings.locale.customPlaceholder')"
            autocomplete="off"
          />
          <small class="text-slate-500">{{ $t('settings.locale.formatLocaleHint') }}</small>
        </div>

        <div class="flex flex-col gap-1 pt-3 border-t border-surface-200 dark:border-surface-700">
          <span class="text-xs font-semibold text-slate-500 uppercase">{{ $t('settings.locale.preview') }}</span>
          <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <span class="text-slate-500">{{ $t('settings.locale.previewDate') }}:</span>
            <span class="tabular-nums">{{ previewDate }}</span>
            <span class="text-slate-500">{{ $t('settings.locale.previewNumber') }}:</span>
            <span class="tabular-nums">{{ previewNumber }}</span>
            <span class="text-slate-500">{{ $t('settings.locale.previewCurrency') }}:</span>
            <span class="tabular-nums">{{ previewCurrency }}</span>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide m-0">
          {{ $t('settings.sections.pagination') }}
        </h3>

        <div class="flex flex-col gap-1">
          <label for="pageSize" class="text-sm font-medium">{{ $t('settings.pagination.pageSize') }}</label>
          <Select
            id="pageSize"
            v-model="pageSizeChoice"
            :options="pageSizeOptions"
            option-label="label"
            option-value="value"
          />
          <small class="text-slate-500">{{ $t('settings.pagination.pageSizeHint') }}</small>
        </div>
      </section>

      <small v-if="localeWillReload" class="text-slate-500">{{ $t('settings.applyHintLocale') }}</small>
    </div>

    <template #footer>
      <Button :label="$t('common.actions.cancel')" severity="secondary" text @click="handleClose" />
      <Button :label="$t('settings.apply')" :disabled="!canApply" @click="apply" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import {
  FORMAT_LOCALE_OPTIONS,
  detectFormatLocale,
  detectUiLocale,
  getStoredFormat,
  getStoredUi,
  setFormatLocale,
  setUiLocale,
  type UiLocale,
} from '../lib/userLocale';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  getStoredPageSize,
  setPageSize,
} from '../composables/usePagination';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { t } = useI18n();

const AUTO = '__auto';
const CUSTOM = '__custom';

const uiChoice = ref<UiLocale | typeof AUTO>(AUTO);
const formatChoice = ref<string>(AUTO);
const customFormat = ref<string>('');
const pageSizeChoice = ref<number>(DEFAULT_PAGE_SIZE);

const initialUi = ref<UiLocale | typeof AUTO>(AUTO);
const initialFormat = ref<string>(AUTO);
const initialCustomFormat = ref<string>('');

const uiOptions = computed(() => [
  { value: AUTO, label: `${t('settings.locale.autoOption')} (${detectUiLocale() === 'pt' ? t('settings.locale.languageOptions.pt') : t('settings.locale.languageOptions.en')})` },
  { value: 'en' as UiLocale, label: t('settings.locale.languageOptions.en') },
  { value: 'pt' as UiLocale, label: t('settings.locale.languageOptions.pt') },
]);

const formatOptions = computed(() => [
  { value: AUTO, label: `${t('settings.locale.autoOption')} (${detectFormatLocale()})` },
  ...FORMAT_LOCALE_OPTIONS.map((o) => ({ value: o.value, label: `${t(o.labelKey)} — ${o.value}` })),
  { value: CUSTOM, label: t('settings.locale.customOption') },
]);

const pageSizeOptions = computed(() =>
  PAGE_SIZE_OPTIONS.map((n) => ({ value: n, label: String(n) })),
);

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const storedUi = getStoredUi();
    uiChoice.value = storedUi ?? AUTO;
    initialUi.value = uiChoice.value;

    const storedFmt = getStoredFormat();
    if (!storedFmt) {
      formatChoice.value = AUTO;
      customFormat.value = '';
    } else if (FORMAT_LOCALE_OPTIONS.some((o) => o.value === storedFmt)) {
      formatChoice.value = storedFmt;
      customFormat.value = '';
    } else {
      formatChoice.value = CUSTOM;
      customFormat.value = storedFmt;
    }
    initialFormat.value = formatChoice.value;
    initialCustomFormat.value = customFormat.value;

    pageSizeChoice.value = getStoredPageSize() ?? DEFAULT_PAGE_SIZE;
  },
  { immediate: true },
);

const effectiveFormatLocale = computed(() => {
  if (formatChoice.value === AUTO) return detectFormatLocale();
  if (formatChoice.value === CUSTOM) return customFormat.value.trim();
  return formatChoice.value;
});

function safeFormat(fn: () => string): string {
  try {
    return fn();
  } catch {
    return '—';
  }
}

const previewDate = computed(() =>
  safeFormat(() =>
    new Intl.DateTimeFormat(effectiveFormatLocale.value || undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date()),
  ),
);

const previewNumber = computed(() =>
  safeFormat(() =>
    new Intl.NumberFormat(effectiveFormatLocale.value || undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234567.89),
  ),
);

const previewCurrency = computed(() =>
  safeFormat(() =>
    new Intl.NumberFormat(effectiveFormatLocale.value || undefined, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.56),
  ),
);

const localeWillReload = computed(() => {
  if (uiChoice.value !== initialUi.value) return true;
  if (formatChoice.value !== initialFormat.value) return true;
  if (formatChoice.value === CUSTOM && customFormat.value.trim() !== initialCustomFormat.value.trim()) return true;
  return false;
});

const canApply = computed(() => {
  if (formatChoice.value === CUSTOM && customFormat.value.trim().length === 0) return false;
  return true;
});

function apply() {
  if (uiChoice.value === AUTO) setUiLocale(null);
  else setUiLocale(uiChoice.value as UiLocale);

  if (formatChoice.value === AUTO) setFormatLocale(null);
  else if (formatChoice.value === CUSTOM) setFormatLocale(customFormat.value.trim());
  else setFormatLocale(formatChoice.value);

  setPageSize(pageSizeChoice.value);

  if (localeWillReload.value) {
    window.location.reload();
  } else {
    emit('close');
  }
}

function handleClose() {
  emit('close');
}
</script>
