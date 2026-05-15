<template>
  <Dialog
    :visible="visible"
    :header="$t('localeSettings.title')"
    modal
    :style="{ width: 'min(32rem, 92vw)' }"
    :closable="false"
    @update:visible="handleClose"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="localeUi" class="text-sm font-medium">{{ $t('localeSettings.uiLanguage') }}</label>
        <Select
          id="localeUi"
          v-model="uiChoice"
          :options="uiOptions"
          option-label="label"
          option-value="value"
        />
        <small class="text-slate-500">{{ $t('localeSettings.uiLanguageHint') }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="localeFormat" class="text-sm font-medium">{{ $t('localeSettings.formatLocale') }}</label>
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
          :placeholder="$t('localeSettings.customPlaceholder')"
          autocomplete="off"
        />
        <small class="text-slate-500">{{ $t('localeSettings.formatLocaleHint') }}</small>
      </div>

      <div class="flex flex-col gap-1 pt-3 border-t border-surface-200 dark:border-surface-700">
        <span class="text-xs font-semibold text-slate-500 uppercase">{{ $t('localeSettings.preview') }}</span>
        <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <span class="text-slate-500">{{ $t('localeSettings.previewDate') }}:</span>
          <span class="tabular-nums">{{ previewDate }}</span>
          <span class="text-slate-500">{{ $t('localeSettings.previewNumber') }}:</span>
          <span class="tabular-nums">{{ previewNumber }}</span>
          <span class="text-slate-500">{{ $t('localeSettings.previewCurrency') }}:</span>
          <span class="tabular-nums">{{ previewCurrency }}</span>
        </div>
        <small class="text-slate-500 mt-2">{{ $t('localeSettings.applyHint') }}</small>
      </div>
    </div>

    <template #footer>
      <Button :label="$t('common.actions.cancel')" severity="secondary" text @click="handleClose" />
      <Button :label="$t('localeSettings.apply')" :disabled="!canApply" @click="apply" />
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

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { t } = useI18n();

const AUTO = '__auto';
const CUSTOM = '__custom';

const uiChoice = ref<UiLocale | typeof AUTO>(AUTO);
const formatChoice = ref<string>(AUTO);
const customFormat = ref<string>('');

const uiOptions = computed(() => [
  { value: AUTO, label: `${t('localeSettings.autoOption')} (${detectUiLocale() === 'pt' ? t('localeSettings.languageOptions.pt') : t('localeSettings.languageOptions.en')})` },
  { value: 'en' as UiLocale, label: t('localeSettings.languageOptions.en') },
  { value: 'pt' as UiLocale, label: t('localeSettings.languageOptions.pt') },
]);

const formatOptions = computed(() => [
  { value: AUTO, label: `${t('localeSettings.autoOption')} (${detectFormatLocale()})` },
  ...FORMAT_LOCALE_OPTIONS.map((o) => ({ value: o.value, label: `${t(o.labelKey)} — ${o.value}` })),
  { value: CUSTOM, label: t('localeSettings.customOption') },
]);

watch(
  () => props.visible,
  (v) => {
    if (!v) return;
    const storedUi = getStoredUi();
    uiChoice.value = storedUi ?? AUTO;

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

  window.location.reload();
}

function handleClose() {
  emit('close');
}
</script>
