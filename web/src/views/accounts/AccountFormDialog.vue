<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: 'min(32rem, 92vw)' }"
    :closable="false"
    @update:visible="handleClose"
  >
    <div v-if="loading" class="flex justify-center py-8">
      <ProgressSpinner style="width: 3rem; height: 3rem" />
    </div>

    <form
      v-else
      class="flex flex-col gap-4"
      data-form-type="other"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-1">
        <label for="accountLabelInput" class="text-sm font-medium">{{ $t('common.fields.name') }}</label>
        <InputText
          id="accountLabelInput"
          v-model="form.name"
          :invalid="submitted && !!errors.name"
          autofocus
          autocomplete="off"
          data-form-type="other"
          data-lpignore="true"
        />
        <small v-if="submitted && errors.name" class="text-red-600">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex flex-col gap-1 sm:w-32">
          <label for="accountCurrency" class="text-sm font-medium">{{ $t('common.fields.currency') }}</label>
          <Select
            id="accountCurrency"
            v-model="form.currency_id"
            :options="currencies"
            option-label="currencyCode"
            option-value="_id"
            :invalid="submitted && !!errors.currency_id"
            :placeholder="$t('common.placeholders.select')"
          />
          <small v-if="submitted && errors.currency_id" class="text-red-600">{{
            errors.currency_id
          }}</small>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <label for="accountInitialBalance" class="text-sm font-medium">{{ $t('accounts.form.fields.initialBalance') }}</label>
          <InputNumber
            id="accountInitialBalance"
            v-model="form.initialBalance"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :locale="numberLocale"
            :invalid="submitted && !!errors.initialBalance"
            input-class="w-full"
          />
          <small v-if="submitted && errors.initialBalance" class="text-red-600">{{
            errors.initialBalance
          }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1 sm:w-32">
        <label for="accountOrder" class="text-sm font-medium">{{ $t('common.fields.order') }}</label>
        <InputNumber
          id="accountOrder"
          v-model="form.order"
          :min="1"
          :max="999"
          :use-grouping="false"
          :invalid="submitted && !!errors.order"
          input-class="w-full"
        />
        <small v-if="submitted && errors.order" class="text-red-600">{{ errors.order }}</small>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="form.enabled" inputId="accountEnabled" binary />
        <label for="accountEnabled" class="text-sm">{{ $t('accounts.form.fields.active') }}</label>
      </div>
    </form>

    <template #footer>
      <Button :label="$t('common.actions.cancel')" severity="secondary" text @click="handleClose" />
      <Button :label="$t('common.actions.confirm')" :disabled="loading" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useI18n } from 'vue-i18n';
import type { Account, NewAccount } from '../../composables/useAccounts';
import { useAccounts } from '../../composables/useAccounts';
import { useReferenceData, type Currency } from '../../composables/useReferenceData';
import { intlLocale } from '../../i18n';

type Mode = 'new' | 'edit';

const props = defineProps<{
  visible: boolean;
  mode: Mode;
  accountId: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', value: Account | NewAccount, mode: Mode): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
}>();

const { t } = useI18n();
const numberLocale = computed(() => intlLocale());

const { getById } = useAccounts();
const { loadCurrencies, getDefaultCurrencyId } = useReferenceData();

const currencies = ref<Currency[]>([]);
const loaded = ref<Account | null>(null);
const loading = ref(false);
const submitted = ref(false);

const form = reactive<{
  _id?: string;
  name: string;
  currency_id: string;
  initialBalance: number | null;
  order: number | null;
  enabled: boolean;
}>({
  _id: undefined,
  name: '',
  currency_id: '',
  initialBalance: 0,
  order: null,
  enabled: true,
});

const title = computed(() =>
  props.mode === 'new' ? t('accounts.form.addTitle') : t('accounts.form.editTitle'),
);

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  const name = form.name?.trim() ?? '';
  if (!name) out.name = t('common.errors.requiredField', { field: t('common.fields.name') });
  else if (name.length < 3) out.name = t('common.errors.minLength', { field: t('common.fields.name'), min: 3 });
  else if (name.length > 100) out.name = t('common.errors.maxLength', { field: t('common.fields.name'), max: 100 });
  if (!form.currency_id) out.currency_id = t('common.errors.requiredField', { field: t('common.fields.currency') });
  if (form.initialBalance == null || isNaN(form.initialBalance))
    out.initialBalance = t('common.errors.requiredField', { field: t('accounts.form.fields.initialBalance') });
  if (form.order == null || isNaN(form.order) || form.order < 1 || form.order > 999)
    out.order = t('common.errors.requiredField', { field: t('common.fields.order') });
  return out;
});

onMounted(async () => {
  try {
    currencies.value = await loadCurrencies();
  } catch (err: unknown) {
    emit('load-error', extractStatus(err));
  }
});

watch(
  () => [props.visible, props.mode, props.accountId] as const,
  async ([visible, mode, id]) => {
    if (!visible) return;
    submitted.value = false;
    if (mode === 'new') {
      loaded.value = null;
      form._id = undefined;
      form.name = '';
      form.initialBalance = 0;
      form.order = null;
      form.enabled = true;
      try {
        if (currencies.value.length === 0) currencies.value = await loadCurrencies();
        form.currency_id = getDefaultCurrencyId(currencies.value);
      } catch (err: unknown) {
        emit('load-error', extractStatus(err));
        emit('close');
      }
      loading.value = false;
      return;
    }
    if (id) {
      loading.value = true;
      try {
        if (currencies.value.length === 0) currencies.value = await loadCurrencies();
        const account = await getById(id);
        loaded.value = account;
        form._id = account._id;
        form.name = account.name;
        form.currency_id = account.currency_id;
        form.initialBalance = account.initialBalance;
        form.order = account.order;
        form.enabled = account.enabled;
      } catch (err: unknown) {
        emit('load-error', extractStatus(err));
        emit('close');
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (Object.keys(errors.value).length > 0) {
    submitted.value = true;
    return;
  }
  const overrides = {
    name: form.name.trim(),
    currency_id: form.currency_id,
    initialBalance: form.initialBalance as number,
    order: form.order as number,
    enabled: form.enabled,
  };
  const payload =
    props.mode === 'edit' && loaded.value
      ? { ...loaded.value, ...overrides }
      : (overrides as NewAccount);
  emit('submit', payload, props.mode);
}

function handleClose() {
  emit('close');
}

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>
