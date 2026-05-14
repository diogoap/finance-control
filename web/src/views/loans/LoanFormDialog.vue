<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: 'min(40rem, 92vw)' }"
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
        <label for="loanDescription" class="text-sm font-medium">{{ $t('common.fields.description') }}</label>
        <InputText
          id="loanDescription"
          v-model="form.description"
          :invalid="submitted && !!errors.description"
          autofocus
          autocomplete="off"
        />
        <small v-if="submitted && errors.description" class="text-red-600">{{
          errors.description
        }}</small>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex flex-col gap-1 flex-1">
          <label for="loanTransactionDate" class="text-sm font-medium">{{ $t('loans.form.fields.transactionDate') }}</label>
          <DatePicker
            id="loanTransactionDate"
            v-model="form.transactionDate"
            date-format="dd/mm/yy"
            show-icon
            :invalid="submitted && !!errors.transactionDate"
          />
          <small v-if="submitted && errors.transactionDate" class="text-red-600">{{
            errors.transactionDate
          }}</small>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <label for="loanDueDate" class="text-sm font-medium">{{ $t('loans.form.fields.dueDate') }}</label>
          <DatePicker
            id="loanDueDate"
            v-model="form.dueDate"
            date-format="dd/mm/yy"
            show-icon
            :min-date="form.transactionDate ?? undefined"
            :invalid="submitted && !!errors.dueDate"
          />
          <small v-if="submitted && errors.dueDate" class="text-red-600">{{ errors.dueDate }}</small>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex flex-col gap-1 sm:w-32">
          <label for="loanCurrency" class="text-sm font-medium">{{ $t('common.fields.currency') }}</label>
          <Select
            id="loanCurrency"
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
          <label for="loanAmount" class="text-sm font-medium">{{ $t('common.fields.amount') }}</label>
          <InputNumber
            id="loanAmount"
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

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex flex-col gap-1 flex-1">
          <label for="loanType" class="text-sm font-medium">{{ $t('loans.form.fields.loanType') }}</label>
          <Select
            id="loanType"
            v-model="form.type"
            :options="loanTypes"
            option-label="label"
            option-value="value"
            :invalid="submitted && !!errors.type"
            :placeholder="$t('common.placeholders.select')"
          />
          <small v-if="submitted && errors.type" class="text-red-600">{{ errors.type }}</small>
        </div>

        <div class="flex flex-col gap-1 flex-1">
          <label for="loanStatus" class="text-sm font-medium">{{ $t('common.fields.status') }}</label>
          <Select
            id="loanStatus"
            v-model="form.status"
            :options="loanStatuses"
            option-label="label"
            option-value="value"
            :invalid="submitted && !!errors.status"
            :placeholder="$t('common.placeholders.select')"
          />
          <small v-if="submitted && errors.status" class="text-red-600">{{ errors.status }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="loanAccount" class="text-sm font-medium">{{ $t('common.fields.account') }}</label>
        <Select
          id="loanAccount"
          v-model="form.account_id"
          :options="accounts"
          option-label="name"
          option-value="_id"
          :invalid="submitted && !!errors.account_id"
          :placeholder="$t('common.placeholders.select')"
        />
        <small v-if="submitted && errors.account_id" class="text-red-600">{{
          errors.account_id
        }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="loanNotes" class="text-sm font-medium">{{ $t('common.fields.notes') }}</label>
        <Textarea id="loanNotes" v-model="form.notes" rows="3" auto-resize autocomplete="off" />
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
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useI18n } from 'vue-i18n';
import type {
  Loan,
  LoanFormPayload,
  LoanStatus,
  LoanType,
} from '../../composables/useLoans';
import { useLoans } from '../../composables/useLoans';
import { useReferenceData, type Account, type Currency } from '../../composables/useReferenceData';
import { getDateDst } from '../../lib/dateUtils';
import { intlLocale } from '../../i18n';

type Mode = 'new' | 'edit' | 'clone';

const props = defineProps<{
  visible: boolean;
  mode: Mode;
  loanId: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', value: LoanFormPayload, mode: Mode): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
}>();

const { t } = useI18n();

const loanTypes = computed<{ label: string; value: LoanType }[]>(() => [
  { label: t('enums.loanType.Tomado'), value: 'Tomado' },
  { label: t('enums.loanType.Concedido'), value: 'Concedido' },
]);

const loanStatuses = computed<{ label: string; value: LoanStatus }[]>(() => [
  { label: t('enums.loanStatus.Em aberto'), value: 'Em aberto' },
  { label: t('enums.loanStatus.Quitado'), value: 'Quitado' },
]);

const numberLocale = computed(() => intlLocale());

const { getById } = useLoans();
const { loadCurrencies, loadAccounts, getDefaultCurrencyId } = useReferenceData();

const currencies = ref<Currency[]>([]);
const accounts = ref<Account[]>([]);
const loaded = ref<Loan | null>(null);
const loading = ref(false);
const submitted = ref(false);

const form = reactive<{
  _id?: string;
  description: string;
  transactionDate: Date | null;
  dueDate: Date | null;
  amount: number | null;
  currency_id: string;
  account_id: string;
  type: LoanType | null;
  status: LoanStatus | null;
  notes: string;
}>({
  _id: undefined,
  description: '',
  transactionDate: null,
  dueDate: null,
  amount: null,
  currency_id: '',
  account_id: '',
  type: null,
  status: 'Em aberto',
  notes: '',
});

const title = computed(() => {
  if (props.mode === 'new') return t('loans.form.addTitle');
  if (props.mode === 'clone') return t('loans.form.cloneTitle');
  return t('loans.form.editTitle');
});

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  const description = form.description?.trim() ?? '';
  if (!description) out.description = t('common.errors.requiredField', { field: t('common.fields.description') });
  else if (description.length < 3)
    out.description = t('common.errors.minLength', { field: t('common.fields.description'), min: 3 });
  else if (description.length > 100)
    out.description = t('common.errors.maxLength', { field: t('common.fields.description'), max: 100 });

  if (!form.transactionDate || isNaN(form.transactionDate.getTime()))
    out.transactionDate = t('common.errors.requiredField', { field: t('loans.form.fields.transactionDate') });
  if (!form.dueDate || isNaN(form.dueDate.getTime())) {
    out.dueDate = t('common.errors.requiredField', { field: t('loans.form.fields.dueDate') });
  } else if (form.transactionDate && !isNaN(form.transactionDate.getTime())) {
    const tx = stripTime(form.transactionDate);
    const due = stripTime(form.dueDate);
    if (due < tx) out.dueDate = t('loans.form.validation.dueDateAfterTransaction');
  }

  if (form.amount == null || isNaN(form.amount) || form.amount <= 0)
    out.amount = t('common.errors.requiredField', { field: t('common.fields.amount') });
  if (!form.currency_id) out.currency_id = t('common.errors.requiredField', { field: t('common.fields.currency') });
  if (!form.type) out.type = t('common.errors.requiredField', { field: t('loans.form.fields.loanType') });
  if (!form.status) out.status = t('common.errors.requiredField', { field: t('common.fields.status') });
  if (!form.account_id) out.account_id = t('common.errors.requiredField', { field: t('common.fields.account') });
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
  () => [props.visible, props.mode, props.loanId] as const,
  async ([visible, mode, id]) => {
    if (!visible) return;
    submitted.value = false;
    if (mode === 'new') {
      loaded.value = null;
      form._id = undefined;
      form.description = '';
      form.transactionDate = new Date();
      form.dueDate = new Date();
      form.amount = null;
      form.account_id = '';
      form.type = null;
      form.status = 'Em aberto';
      form.notes = '';
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
        const loan = await getById(id);
        loaded.value = loan;
        form._id = mode === 'clone' ? undefined : loan._id;
        form.description =
          mode === 'clone'
            ? `${loan.description}${t('common.cloneSuffix')}`
            : loan.description;
        form.transactionDate = new Date(loan.transactionDate);
        form.dueDate = new Date(loan.dueDate);
        form.amount = loan.amount;
        form.currency_id = loan.currency_id;
        form.account_id = loan.account_id;
        form.type = loan.type;
        form.status = loan.status;
        form.notes = loan.notes ?? '';
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
    description: form.description.trim(),
    transactionDate: getDateDst(form.transactionDate as Date).toISOString(),
    dueDate: getDateDst(form.dueDate as Date).toISOString(),
    amount: form.amount as number,
    currency_id: form.currency_id,
    account_id: form.account_id,
    type: form.type as LoanType,
    status: form.status as LoanStatus,
    notes: form.notes ?? '',
  };
  let payload: LoanFormPayload;
  if (props.mode === 'edit' && loaded.value) {
    payload = { ...loaded.value, ...overrides } as LoanFormPayload;
  } else {
    payload = overrides as LoanFormPayload;
  }
  emit('submit', payload, props.mode);
}

function handleClose() {
  emit('close');
}

function stripTime(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>
