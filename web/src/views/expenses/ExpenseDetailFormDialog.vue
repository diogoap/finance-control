<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: 'min(34rem, 92vw)' }"
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
        <label for="expenseDetailDescription" class="text-sm font-medium">{{ $t('common.fields.description') }}</label>
        <InputText
          id="expenseDetailDescription"
          v-model="form.description"
          :invalid="submitted && !!errors.description"
          autofocus
          autocomplete="off"
          maxlength="100"
        />
        <small v-if="submitted && errors.description" class="text-red-600">{{
          errors.description
        }}</small>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-4 flex flex-col gap-1">
          <label for="expenseDetailCurrency" class="text-sm font-medium">{{ $t('common.fields.currency') }}</label>
          <Select
            id="expenseDetailCurrency"
            v-model="form.currency_id"
            :options="currencies"
            option-label="currencyCode"
            option-value="_id"
            :invalid="submitted && !!errors.currency_id"
            :placeholder="$t('common.fields.currency')"
          />
          <small v-if="submitted && errors.currency_id" class="text-red-600">{{
            errors.currency_id
          }}</small>
        </div>
        <div class="col-span-8 flex flex-col gap-1">
          <label for="expenseDetailAmount" class="text-sm font-medium">{{ $t('common.fields.amount') }}</label>
          <InputNumber
            id="expenseDetailAmount"
            v-model="form.amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :invalid="submitted && !!errors.amount"
            :locale="numberLocale"
            input-class="text-right"
          />
          <small v-if="submitted && errors.amount" class="text-red-600">{{ errors.amount }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="expenseDetailAccount" class="text-sm font-medium">{{ $t('common.fields.account') }}</label>
        <Select
          id="expenseDetailAccount"
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
        <label for="expenseDetailCategory" class="text-sm font-medium">{{ $t('common.fields.category') }}</label>
        <Select
          id="expenseDetailCategory"
          v-model="form.category_id"
          :options="categories"
          option-label="name"
          option-value="_id"
          :invalid="submitted && !!errors.category_id"
          :placeholder="$t('common.placeholders.select')"
        />
        <small v-if="submitted && errors.category_id" class="text-red-600">{{
          errors.category_id
        }}</small>
      </div>

      <div class="flex flex-col gap-1 max-w-[14rem]">
        <label for="expenseDetailStatus" class="text-sm font-medium">{{ $t('common.fields.status') }}</label>
        <Select
          id="expenseDetailStatus"
          v-model="form.status"
          :options="expenseStatusOptions"
          option-label="label"
          option-value="value"
          :invalid="submitted && !!errors.status"
          :placeholder="$t('common.placeholders.select')"
        />
        <small v-if="submitted && errors.status" class="text-red-600">{{ errors.status }}</small>
      </div>
    </form>

    <template #footer>
      <Button :label="$t('common.actions.cancel')" severity="secondary" text @click="handleClose" />
      <Button :label="$t('common.actions.confirm')" :disabled="loading" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useI18n } from 'vue-i18n';
import type { ExpenseDetail, ExpenseStatus } from '../../composables/useExpenses';
import {
  useReferenceData,
  type Account,
  type CategoryRef,
  type Currency,
} from '../../composables/useReferenceData';
import { intlLocale } from '../../i18n';

type Mode = 'new' | 'edit' | 'clone';

const props = defineProps<{
  visible: boolean;
  mode: Mode;
  detail: ExpenseDetail | null;
}>();

const emit = defineEmits<{
  (e: 'submit', value: ExpenseDetail, mode: Mode, originalKey: string | null): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
}>();

const { t } = useI18n();

const expenseStatusOptions = computed<{ label: string; value: ExpenseStatus }[]>(() => [
  { label: t('enums.expenseStatus.Em aberto'), value: 'Em aberto' },
  { label: t('enums.expenseStatus.Pago'), value: 'Pago' },
]);

const numberLocale = computed(() => intlLocale());

const { loadCurrencies, loadAccounts, loadCategories, getDefaultCurrencyId } = useReferenceData();

const loading = ref(false);
const submitted = ref(false);
const currencies = ref<Currency[]>([]);
const accounts = ref<Account[]>([]);
const categories = ref<CategoryRef[]>([]);

const form = reactive<{
  _id?: string;
  description: string;
  amount: number | null;
  account_id: string;
  category_id: string;
  currency_id: string;
  status: ExpenseStatus;
}>({
  _id: undefined,
  description: '',
  amount: null,
  account_id: '',
  category_id: '',
  currency_id: '',
  status: 'Em aberto',
});

const originalKey = ref<string | null>(null);

const title = computed(() => {
  if (props.mode === 'new') return t('expenses.detail.addTitle');
  if (props.mode === 'clone') return t('expenses.detail.cloneTitle');
  return t('expenses.detail.editTitle');
});

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  const desc = form.description?.trim() ?? '';
  if (!desc) out.description = t('common.errors.requiredField', { field: t('common.fields.description') });
  else if (desc.length > 100)
    out.description = t('common.errors.maxLength', { field: t('common.fields.description'), max: 100 });
  if (!form.currency_id) out.currency_id = t('common.errors.requiredField', { field: t('common.fields.currency') });
  if (!form.amount || form.amount <= 0) out.amount = t('common.errors.requiredField', { field: t('common.fields.amount') });
  if (!form.account_id) out.account_id = t('common.errors.requiredField', { field: t('common.fields.account') });
  if (!form.category_id) out.category_id = t('common.errors.requiredField', { field: t('common.fields.category') });
  if (!form.status) out.status = t('common.errors.requiredField', { field: t('common.fields.status') });
  return out;
});

watch(
  () => [props.visible, props.mode] as const,
  async ([visible, mode]) => {
    if (!visible) return;
    submitted.value = false;
    loading.value = true;
    try {
      const [cur, acc, cat] = await Promise.all([
        loadCurrencies(),
        loadAccounts(),
        loadCategories('Despesa'),
      ]);
      currencies.value = cur;
      accounts.value = acc;
      categories.value = cat;

      if (mode === 'new') {
        originalKey.value = null;
        form._id = undefined;
        form.description = '';
        form.amount = null;
        form.account_id = '';
        form.category_id = '';
        form.currency_id = getDefaultCurrencyId(cur);
        form.status = 'Em aberto';
      } else if (props.detail) {
        originalKey.value = props.detail._key ?? null;
        form._id = mode === 'clone' ? undefined : props.detail._id;
        form.description =
          mode === 'clone'
            ? `${props.detail.description}${t('common.cloneSuffix')}`
            : props.detail.description;
        form.amount = props.detail.amount;
        form.account_id = props.detail.account_id;
        form.category_id = props.detail.category_id;
        form.currency_id = props.detail.currency_id;
        form.status = props.detail.status;
      }
    } catch (err) {
      emit('load-error', extractStatus(err));
      emit('close');
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (Object.keys(errors.value).length > 0) {
    submitted.value = true;
    return;
  }
  const account = accounts.value.find((a) => a._id === form.account_id);
  const category = categories.value.find((c) => c._id === form.category_id);
  const currency = currencies.value.find((c) => c._id === form.currency_id);

  const payload: ExpenseDetail = {
    _id: form._id,
    description: form.description.trim(),
    amount: form.amount as number,
    account_id: form.account_id,
    category_id: form.category_id,
    currency_id: form.currency_id,
    status: form.status,
    _account: account,
    _category: category,
    _currency: currency,
  };
  emit('submit', payload, props.mode, originalKey.value);
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
