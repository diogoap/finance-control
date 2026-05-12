<template>
  <Dialog
    :visible="visible"
    :header="'Gerar receitas'"
    modal
    :style="{ width: 'min(46rem, 95vw)' }"
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
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="genInitialDate" class="text-sm font-medium">Data inicial</label>
          <DatePicker
            id="genInitialDate"
            v-model="form.initialDate"
            date-format="dd/mm/yy"
            show-icon
            :invalid="submitted && !!errors.initialDate"
          />
          <small v-if="submitted && errors.initialDate" class="text-red-600">{{
            errors.initialDate
          }}</small>
        </div>
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="genInstallments" class="text-sm font-medium">Número de parcelas</label>
          <InputNumber
            id="genInstallments"
            v-model="form.installments"
            :min="1"
            :max="999"
            :invalid="submitted && !!errors.installments"
            :use-grouping="false"
          />
          <small v-if="submitted && errors.installments" class="text-red-600">{{
            errors.installments
          }}</small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="genDueDateType" class="text-sm font-medium">Vencimento</label>
          <Select
            id="genDueDateType"
            v-model="form.dueDateType"
            :options="dueDateTypeOptions"
            option-label="label"
            option-value="value"
            :invalid="submitted && !!errors.dueDateType"
            placeholder="Selecione"
          />
          <small v-if="submitted && errors.dueDateType" class="text-red-600">{{
            errors.dueDateType
          }}</small>
        </div>
        <div
          v-if="form.dueDateType === 'DiaEspecifico'"
          class="col-span-12 sm:col-span-3 flex flex-col gap-1"
        >
          <label for="genDueDateTypeDay" class="text-sm font-medium">Dia</label>
          <InputNumber
            id="genDueDateTypeDay"
            v-model="form.dueDateTypeDay"
            :min="1"
            :max="31"
            :invalid="submitted && !!errors.dueDateTypeDay"
            :use-grouping="false"
          />
          <small v-if="submitted && errors.dueDateTypeDay" class="text-red-600">{{
            errors.dueDateTypeDay
          }}</small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-4 sm:col-span-3 flex flex-col gap-1">
          <label for="genCurrency" class="text-sm font-medium">Moeda</label>
          <Select
            id="genCurrency"
            v-model="form.currency_id"
            :options="currencies"
            option-label="currencyCode"
            option-value="_id"
            :invalid="submitted && !!errors.currency_id"
            placeholder="Moeda"
          />
          <small v-if="submitted && errors.currency_id" class="text-red-600">{{
            errors.currency_id
          }}</small>
        </div>
        <div class="col-span-8 sm:col-span-3 flex flex-col gap-1">
          <label for="genAmount" class="text-sm font-medium">Valor</label>
          <InputNumber
            id="genAmount"
            v-model="form.amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :invalid="submitted && !!errors.amount"
            locale="pt-BR"
            input-class="text-right"
          />
          <small v-if="submitted && errors.amount" class="text-red-600">{{
            errors.amount
          }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="genDescription" class="text-sm font-medium">Descrição</label>
        <InputText
          id="genDescription"
          v-model="form.description"
          maxlength="100"
          autocomplete="off"
          :invalid="submitted && !!errors.description"
        />
        <small v-if="submitted && errors.description" class="text-red-600">{{
          errors.description
        }}</small>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox
          v-model="form.descriptionInstallmentNumber"
          inputId="genDescInstallment"
          binary
        />
        <label for="genDescInstallment" class="text-sm">
          Inserir o número da parcela na descrição
        </label>
      </div>

      <div class="flex flex-col gap-1">
        <label for="genAccount" class="text-sm font-medium">Conta</label>
        <Select
          id="genAccount"
          v-model="form.account_id"
          :options="accounts"
          option-label="name"
          option-value="_id"
          :invalid="submitted && !!errors.account_id"
          placeholder="Selecione"
        />
        <small v-if="submitted && errors.account_id" class="text-red-600">{{
          errors.account_id
        }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="genCategory" class="text-sm font-medium">Categoria</label>
        <Select
          id="genCategory"
          v-model="form.category_id"
          :options="categories"
          option-label="name"
          option-value="_id"
          :invalid="submitted && !!errors.category_id"
          placeholder="Selecione"
        />
        <small v-if="submitted && errors.category_id" class="text-red-600">{{
          errors.category_id
        }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="genNotes" class="text-sm font-medium">Observações</label>
        <Textarea id="genNotes" v-model="form.notes" rows="1" autocomplete="off" />
      </div>
    </form>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="handleClose" />
      <Button label="Confirmar" :disabled="submitting || loading" @click="handleSubmit" />
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
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import ProgressSpinner from 'primevue/progressspinner';
import api from '../../lib/api';
import {
  useReferenceData,
  type Account,
  type CategoryRef,
  type Currency,
} from '../../composables/useReferenceData';
import { getDateDst } from '../../lib/dateUtils';

type DueDateType = 'PrimeiroDia' | 'UltimoDia' | 'DiaEspecifico';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
  (e: 'save-error', status: number | string): void;
}>();

const dueDateTypeOptions: { value: DueDateType; label: string }[] = [
  { value: 'PrimeiroDia', label: 'Primeiro dia do mês' },
  { value: 'UltimoDia', label: 'Último dia do mês' },
  { value: 'DiaEspecifico', label: 'Dia específico' },
];

const { loadCurrencies, loadAccounts, loadCategories, getDefaultCurrencyId } = useReferenceData();

const loading = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const currencies = ref<Currency[]>([]);
const accounts = ref<Account[]>([]);
const categories = ref<CategoryRef[]>([]);

const form = reactive<{
  initialDate: Date | null;
  installments: number | null;
  dueDateType: DueDateType;
  dueDateTypeDay: number | null;
  currency_id: string;
  amount: number | null;
  description: string;
  descriptionInstallmentNumber: boolean;
  account_id: string;
  category_id: string;
  notes: string;
}>({
  initialDate: new Date(),
  installments: null,
  dueDateType: 'PrimeiroDia',
  dueDateTypeDay: null,
  currency_id: '',
  amount: null,
  description: '',
  descriptionInstallmentNumber: false,
  account_id: '',
  category_id: '',
  notes: '',
});

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  if (!form.initialDate) out.initialDate = 'O campo Data inicial é obrigatório.';
  if (!form.installments || form.installments <= 0)
    out.installments = 'O campo Número de parcelas é obrigatório.';
  if (!form.dueDateType) out.dueDateType = 'O campo Vencimento é obrigatório.';
  if (form.dueDateType === 'DiaEspecifico' && (!form.dueDateTypeDay || form.dueDateTypeDay <= 0))
    out.dueDateTypeDay = 'O campo Dia é obrigatório.';
  if (!form.currency_id) out.currency_id = 'O campo Moeda é obrigatório.';
  if (!form.amount || form.amount <= 0) out.amount = 'O campo Valor é obrigatório.';
  const desc = form.description?.trim() ?? '';
  if (!desc) out.description = 'O campo Descrição é obrigatório.';
  else if (desc.length < 3)
    out.description = 'O campo Descrição deve possuir no mínimo 3 caracteres.';
  else if (desc.length > 100)
    out.description = 'O campo Descrição deve possuir no máximo 100 caracteres.';
  if (!form.account_id) out.account_id = 'O campo Conta é obrigatório.';
  if (!form.category_id) out.category_id = 'O campo Categoria é obrigatório.';
  return out;
});

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    submitted.value = false;
    loading.value = true;
    try {
      const [cur, acc, cat] = await Promise.all([
        loadCurrencies(),
        loadAccounts(),
        loadCategories('Receita'),
      ]);
      currencies.value = cur;
      accounts.value = acc;
      categories.value = cat;

      form.initialDate = new Date();
      form.installments = null;
      form.dueDateType = 'PrimeiroDia';
      form.dueDateTypeDay = null;
      form.currency_id = getDefaultCurrencyId(cur);
      form.amount = null;
      form.description = '';
      form.descriptionInstallmentNumber = false;
      form.account_id = '';
      form.category_id = '';
      form.notes = '';
    } catch (err) {
      emit('load-error', extractStatus(err));
      emit('close');
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (Object.keys(errors.value).length > 0) {
    submitted.value = true;
    return;
  }
  submitting.value = true;
  try {
    const payload: Record<string, unknown> = {
      type: 'Receita',
      initialDate: getDateDst(form.initialDate as Date).toISOString(),
      installments: form.installments,
      dueDateType: form.dueDateType,
      currency_id: form.currency_id,
      amount: form.amount,
      description: form.description.trim(),
      descriptionInstallmentNumber: form.descriptionInstallmentNumber,
      account_id: form.account_id,
      category_id: form.category_id,
      notes: form.notes ?? '',
    };
    if (form.dueDateType === 'DiaEspecifico') {
      payload.dueDateTypeDay = form.dueDateTypeDay;
    }
    await api.post('/generator', payload);
    emit('submit');
  } catch (err) {
    emit('save-error', extractStatus(err));
  } finally {
    submitting.value = false;
  }
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
