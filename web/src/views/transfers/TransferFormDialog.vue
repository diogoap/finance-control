<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: 'min(36rem, 92vw)' }"
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
      <div class="flex flex-col gap-1 sm:w-48">
        <label for="transferDate" class="text-sm font-medium">{{ $t('common.fields.date') }}</label>
        <DatePicker
          id="transferDate"
          v-model="form.date"
          date-format="dd/mm/yy"
          show-icon
          :invalid="submitted && !!errors.date"
        />
        <small v-if="submitted && errors.date" class="text-red-600">{{ errors.date }}</small>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex flex-col gap-1 sm:w-32">
          <label for="transferCurrency" class="text-sm font-medium">{{ $t('common.fields.currency') }}</label>
          <Select
            id="transferCurrency"
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
          <label for="transferAmount" class="text-sm font-medium">{{ $t('common.fields.amount') }}</label>
          <InputNumber
            id="transferAmount"
            v-model="form.amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :locale="numberLocale"
            :invalid="submitted && !!errors.amount"
            input-class="w-full"
          />
          <small v-if="submitted && errors.amount" class="text-red-600">{{ errors.amount }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="transferAccountOrigin" class="text-sm font-medium">{{ $t('transfers.headers.origin') }}</label>
        <Select
          id="transferAccountOrigin"
          v-model="form.accountOrigin_id"
          :options="accounts"
          option-label="name"
          option-value="_id"
          :invalid="submitted && !!errors.accountOrigin_id"
          :placeholder="$t('common.placeholders.select')"
        />
        <small v-if="submitted && errors.accountOrigin_id" class="text-red-600">{{
          errors.accountOrigin_id
        }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="transferAccountTarget" class="text-sm font-medium">{{ $t('transfers.headers.target') }}</label>
        <Select
          id="transferAccountTarget"
          v-model="form.accountTarget_id"
          :options="accounts"
          option-label="name"
          option-value="_id"
          :invalid="submitted && !!errors.accountTarget_id"
          :placeholder="$t('common.placeholders.select')"
        />
        <small v-if="submitted && errors.accountTarget_id" class="text-red-600">{{
          errors.accountTarget_id
        }}</small>
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
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useI18n } from 'vue-i18n';
import type { Transfer, TransferFormPayload } from '../../composables/useTransfers';
import { useTransfers } from '../../composables/useTransfers';
import { useReferenceData, type Account, type Currency } from '../../composables/useReferenceData';
import { getDateDst } from '../../lib/dateUtils';
import { intlLocale } from '../../i18n';

type Mode = 'new' | 'edit';

const props = defineProps<{
  visible: boolean;
  mode: Mode;
  transferId: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', value: TransferFormPayload, mode: Mode): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
}>();

const { t } = useI18n();

const numberLocale = computed(() => intlLocale());

const { getById } = useTransfers();
const { loadCurrencies, loadAccounts, getDefaultCurrencyId } = useReferenceData();

const currencies = ref<Currency[]>([]);
const accounts = ref<Account[]>([]);
const loaded = ref<Transfer | null>(null);
const loading = ref(false);
const submitted = ref(false);

const form = reactive<{
  _id?: string;
  date: Date | null;
  amount: number | null;
  currency_id: string;
  accountOrigin_id: string;
  accountTarget_id: string;
}>({
  _id: undefined,
  date: null,
  amount: null,
  currency_id: '',
  accountOrigin_id: '',
  accountTarget_id: '',
});

const title = computed(() =>
  props.mode === 'new' ? t('transfers.form.addTitle') : t('transfers.form.editTitle'),
);

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  if (!form.date || isNaN(form.date.getTime())) out.date = t('common.errors.requiredField', { field: t('common.fields.date') });
  if (!form.currency_id) out.currency_id = t('common.errors.requiredField', { field: t('common.fields.currency') });
  if (form.amount == null || isNaN(form.amount) || form.amount <= 0)
    out.amount = t('common.errors.requiredField', { field: t('common.fields.amount') });
  if (!form.accountOrigin_id) {
    out.accountOrigin_id = t('common.errors.requiredField', { field: t('transfers.headers.origin') });
  } else if (form.accountOrigin_id === form.accountTarget_id) {
    out.accountOrigin_id = t('transfers.form.validation.sameAccount');
  }
  if (!form.accountTarget_id) {
    out.accountTarget_id = t('common.errors.requiredField', { field: t('transfers.headers.target') });
  } else if (form.accountTarget_id === form.accountOrigin_id) {
    out.accountTarget_id = t('transfers.form.validation.sameAccount');
  }
  return out;
});

onMounted(async () => {
  try {
    [currencies.value, accounts.value] = await Promise.all([loadCurrencies(), loadAccounts()]);
  } catch (err: unknown) {
    emit('load-error', extractStatus(err));
  }
});

watch(
  () => [props.visible, props.mode, props.transferId] as const,
  async ([visible, mode, id]) => {
    if (!visible) return;
    submitted.value = false;
    if (mode === 'new') {
      loaded.value = null;
      form._id = undefined;
      form.date = new Date();
      form.amount = null;
      form.accountOrigin_id = '';
      form.accountTarget_id = '';
      try {
        if (currencies.value.length === 0) currencies.value = await loadCurrencies();
        if (accounts.value.length === 0) accounts.value = await loadAccounts();
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
        if (accounts.value.length === 0) accounts.value = await loadAccounts();
        const transfer = await getById(id);
        loaded.value = transfer;
        form._id = transfer._id;
        form.date = new Date(transfer.date);
        form.amount = transfer.amount;
        form.currency_id = transfer.currency_id;
        form.accountOrigin_id = transfer.accountOrigin_id;
        form.accountTarget_id = transfer.accountTarget_id;
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
    date: getDateDst(form.date as Date).toISOString(),
    amount: form.amount as number,
    currency_id: form.currency_id,
    accountOrigin_id: form.accountOrigin_id,
    accountTarget_id: form.accountTarget_id,
  };
  const payload: TransferFormPayload =
    props.mode === 'edit' && loaded.value
      ? ({ ...loaded.value, ...overrides } as TransferFormPayload)
      : (overrides as TransferFormPayload);
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
