<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: 'min(56rem, 95vw)' }"
    :closable="false"
    @update:visible="handleClose"
  >
    <div v-if="loading" class="flex justify-center py-8">
      <ProgressSpinner style="width: 3rem; height: 3rem" />
    </div>

    <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-8 flex flex-col gap-1">
          <label for="expenseDescription" class="text-sm font-medium">Descrição</label>
          <InputText
            id="expenseDescription"
            v-model="form.description"
            :invalid="submitted && !!errors.description"
            autofocus
            maxlength="100"
          />
          <small v-if="submitted && errors.description" class="text-red-600">{{
            errors.description
          }}</small>
        </div>
        <div class="col-span-12 sm:col-span-4 flex items-end">
          <div class="flex items-center gap-2 mb-1.5">
            <Checkbox
              v-model="form.scheduledPayment"
              inputId="expenseScheduledPayment"
              binary
            />
            <label for="expenseScheduledPayment" class="text-sm">Pagamento agendado</label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-4 flex flex-col gap-1">
          <label for="expenseDueDate" class="text-sm font-medium">Vencimento</label>
          <DatePicker
            id="expenseDueDate"
            v-model="form.dueDate"
            date-format="dd/mm/yy"
            show-icon
            :invalid="submitted && !!errors.dueDate"
          />
          <small v-if="submitted && errors.dueDate" class="text-red-600">{{
            errors.dueDate
          }}</small>
        </div>
        <div class="col-span-4 sm:col-span-3 flex flex-col gap-1">
          <label for="expenseCurrency" class="text-sm font-medium">Moeda</label>
          <Select
            id="expenseCurrency"
            v-model="form.currency_id"
            :options="currencies"
            option-label="currencyCode"
            option-value="_id"
            :disabled="hasDetail"
            :invalid="submitted && !!errors.currency_id"
            placeholder="Moeda"
          />
          <small v-if="submitted && errors.currency_id" class="text-red-600">{{
            errors.currency_id
          }}</small>
        </div>
        <div class="col-span-8 sm:col-span-5 flex flex-col gap-1">
          <label for="expenseAmount" class="text-sm font-medium">Valor</label>
          <InputNumber
            id="expenseAmount"
            v-model="form.amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :readonly="hasDetail"
            :invalid="submitted && !!errors.amount"
            locale="pt-BR"
            input-class="text-right"
          />
          <small v-if="submitted && errors.amount" class="text-red-600">{{ errors.amount }}</small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseAccount" class="text-sm font-medium">Conta</label>
          <Select
            id="expenseAccount"
            v-model="form.account_id"
            :options="accounts"
            option-label="name"
            option-value="_id"
            :disabled="hasDetail"
            :invalid="submitted && !!errors.account_id"
            placeholder="Selecione"
          />
          <small v-if="submitted && errors.account_id" class="text-red-600">{{
            errors.account_id
          }}</small>
        </div>
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseCategory" class="text-sm font-medium">Categoria</label>
          <Select
            id="expenseCategory"
            v-model="form.category_id"
            :options="categories"
            option-label="name"
            option-value="_id"
            :disabled="hasDetail"
            :invalid="submitted && !!errors.category_id"
            placeholder="Selecione"
          />
          <small v-if="submitted && errors.category_id" class="text-red-600">{{
            errors.category_id
          }}</small>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseStatus" class="text-sm font-medium">Situação</label>
          <Select
            id="expenseStatus"
            v-model="form.status"
            :options="expenseStatusOptions"
            :disabled="hasDetail"
            :invalid="submitted && !!errors.status"
            placeholder="Selecione"
            @change="onChangeStatus"
          />
          <small v-if="submitted && errors.status" class="text-red-600">{{ errors.status }}</small>
        </div>
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseAmountPaid" class="text-sm font-medium">Valor pago</label>
          <InputNumber
            id="expenseAmountPaid"
            v-model="form.amountPaid"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :readonly="hasDetail"
            :invalid="submitted && !!errors.amountPaid"
            locale="pt-BR"
            input-class="text-right"
          />
          <small v-if="submitted && errors.amountPaid" class="text-red-600">{{
            errors.amountPaid
          }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="expenseNotes" class="text-sm font-medium">Observações</label>
        <Textarea id="expenseNotes" v-model="form.notes" rows="2" />
      </div>

      <div class="flex flex-col gap-2">
        <Toolbar class="!p-2">
          <template #start>
            <div class="flex gap-2">
              <Button
                icon="pi pi-plus"
                size="small"
                aria-label="Adicionar"
                v-tooltip.bottom="'Adicionar'"
                @click="openDetail('new', null)"
              />
              <Button
                icon="pi pi-pencil"
                size="small"
                :disabled="!selectedDetail"
                aria-label="Editar"
                v-tooltip.bottom="'Editar'"
                @click="openDetail('edit', selectedDetail)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                :disabled="!selectedDetail"
                aria-label="Excluir"
                v-tooltip.bottom="'Excluir'"
                @click="confirmDeleteDetail"
              />
              <Button
                icon="pi pi-clone"
                size="small"
                :disabled="!selectedDetail"
                aria-label="Clonar"
                v-tooltip.bottom="'Clonar'"
                @click="openDetail('clone', selectedDetail)"
              />
              <Button
                icon="pi pi-dollar"
                size="small"
                :disabled="!selectedDetail || selectedDetail.status !== 'Em aberto'"
                aria-label="Pagar"
                v-tooltip.bottom="'Pagar'"
                @click="payDetail"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          v-model:selection="selectedDetail"
          :value="form.detail"
          data-key="_key"
          selection-mode="single"
          striped-rows
          class="p-datatable-sm"
          :rows="5"
        >
          <Column field="description" header="Descrição">
            <template #footer>{{ form.detail.length }} registros</template>
          </Column>
          <Column header="Moeda" style="width: 5rem" class="text-center">
            <template #body="{ data }">{{ data._currency?.currencyCode ?? '' }}</template>
          </Column>
          <Column header="Valor" style="width: 8rem" class="text-right">
            <template #body="{ data }">{{ formatNumber(data.amount) }}</template>
            <template #footer>
              <span class="block text-right">{{ formatNumber(detailTotal) }}</span>
            </template>
          </Column>
          <Column header="Conta" style="width: 12rem">
            <template #body="{ data }">{{ data._account?.name ?? '' }}</template>
          </Column>
          <Column header="Categoria" style="width: 12rem">
            <template #body="{ data }">{{ data._category?.name ?? '' }}</template>
          </Column>
          <Column field="status" header="Situação" style="width: 8rem" class="text-center" />
          <template #empty>
            <div class="text-center text-sm text-slate-500 py-4">Nenhum detalhe adicionado.</div>
          </template>
        </DataTable>
      </div>
    </form>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="handleClose" />
      <Button label="Confirmar" :disabled="loading" @click="handleSubmit" />
    </template>
  </Dialog>

  <ExpenseDetailFormDialog
    :visible="detailDialog.visible"
    :mode="detailDialog.mode"
    :detail="detailDialog.detail"
    @submit="onDetailSubmit"
    @close="closeDetailDialog"
    @load-error="onDetailLoadError"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';
import {
  useExpenses,
  compareDetails,
  type Expense,
  type ExpenseDetail,
  type ExpenseFormPayload,
  type ExpenseStatus,
} from '../../composables/useExpenses';
import {
  useReferenceData,
  type Account,
  type CategoryRef,
  type Currency,
} from '../../composables/useReferenceData';
import { formatNumber, getDateDst } from '../../lib/dateUtils';
import ExpenseDetailFormDialog from './ExpenseDetailFormDialog.vue';

type Mode = 'new' | 'edit' | 'clone';

const props = defineProps<{
  visible: boolean;
  mode: Mode;
  expenseId: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', value: ExpenseFormPayload, mode: Mode): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
}>();

const expenseStatusOptions: ExpenseStatus[] = ['Em aberto', 'Pago'];

const { getById } = useExpenses();
const { loadCurrencies, loadAccounts, loadCategories, getDefaultCurrencyId } = useReferenceData();
const confirm = useConfirm();

const loading = ref(false);
const submitted = ref(false);
const currencies = ref<Currency[]>([]);
const accounts = ref<Account[]>([]);
const categories = ref<CategoryRef[]>([]);
const loaded = ref<Expense | null>(null);

const form = reactive<{
  _id?: string;
  description: string;
  dueDate: Date | null;
  scheduledPayment: boolean;
  amount: number | null;
  amountPaid: number | null;
  currency_id: string;
  account_id: string;
  category_id: string;
  status: ExpenseStatus;
  notes: string;
  detail: ExpenseDetail[];
}>({
  _id: undefined,
  description: '',
  dueDate: null,
  scheduledPayment: false,
  amount: null,
  amountPaid: null,
  currency_id: '',
  account_id: '',
  category_id: '',
  status: 'Em aberto',
  notes: '',
  detail: [],
});

const selectedDetail = ref<ExpenseDetail | null>(null);

const detailDialog = reactive<{ visible: boolean; mode: Mode; detail: ExpenseDetail | null }>({
  visible: false,
  mode: 'new',
  detail: null,
});

const hasDetail = computed(() => form.detail.length > 0);

const detailTotal = computed(() =>
  form.detail.reduce((acc, d) => acc + (d.amount ?? 0), 0),
);

const title = computed(() => {
  if (props.mode === 'new') return 'Adicionar despesa';
  if (props.mode === 'clone') return 'Clonar despesa';
  return 'Editar despesa';
});

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  const desc = form.description?.trim() ?? '';
  if (!desc) out.description = 'O campo Descrição é obrigatório.';
  else if (desc.length < 3)
    out.description = 'O campo Descrição deve possuir no mínimo 3 caracteres.';
  else if (desc.length > 100)
    out.description = 'O campo Descrição deve possuir no máximo 100 caracteres.';
  if (!form.dueDate) out.dueDate = 'O campo Vencimento é obrigatório.';
  if (!form.status) out.status = 'O campo Situação é obrigatório.';
  if (!hasDetail.value) {
    if (!form.currency_id) out.currency_id = 'O campo Moeda é obrigatório.';
    if (!form.amount || form.amount <= 0) out.amount = 'O campo Valor é obrigatório.';
    if (!form.account_id) out.account_id = 'O campo Conta é obrigatório.';
    if (!form.category_id) out.category_id = 'O campo Categoria é obrigatório.';
    if (form.status === 'Pago' && (!form.amountPaid || form.amountPaid <= 0)) {
      out.amountPaid = 'O campo Valor pago é obrigatório.';
    }
  }
  return out;
});

watch(
  () => [props.visible, props.mode, props.expenseId] as const,
  async ([visible, mode, id]) => {
    if (!visible) return;
    submitted.value = false;
    selectedDetail.value = null;
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
        loaded.value = null;
        form._id = undefined;
        form.description = '';
        form.dueDate = new Date();
        form.scheduledPayment = false;
        form.amount = null;
        form.amountPaid = 0;
        form.currency_id = getDefaultCurrencyId(cur);
        form.account_id = '';
        form.category_id = '';
        form.status = 'Em aberto';
        form.notes = '';
        form.detail = [];
      } else if (id) {
        const expense = await getById(id);
        loaded.value = expense;
        form._id = mode === 'clone' ? undefined : expense._id;
        form.description = expense.description ?? '';
        const due = new Date(expense.dueDate);
        if (mode === 'clone') {
          form._id = undefined;
          due.setMonth(due.getMonth() + 1);
        }
        form.dueDate = due;
        form.scheduledPayment = !!expense.scheduledPayment;
        form.amount = expense.amount;
        form.amountPaid = expense.amountPaid ?? 0;
        form.currency_id = expense.currency_id ?? '';
        form.account_id = expense.account_id ?? '';
        form.category_id = expense.category_id ?? '';
        form.status = expense.status;
        form.notes = expense.notes ?? '';
        form.detail = (expense.detail ?? []).map((d, idx) => ({
          ...d,
          _key: `loaded-${idx}-${d._id ?? Math.random().toString(36).slice(2)}`,
        }));
        recomputeTotals();
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

function onChangeStatus() {
  if (form.status === 'Pago' && (!form.amountPaid || form.amountPaid === 0)) {
    form.amountPaid = form.amount ?? 0;
  }
}

function recomputeTotals() {
  if (form.detail.length === 0) return;
  form.account_id = '';
  form.category_id = '';
  form.currency_id = '';
  let amount = 0;
  let paid = 0;
  form.detail.forEach((d) => {
    amount += d.amount ?? 0;
    if (d.status === 'Pago') paid += d.amount ?? 0;
  });
  form.amount = amount;
  form.amountPaid = paid;
  form.status = amount === paid ? 'Pago' : 'Em aberto';
}

function openDetail(mode: Mode, detail: ExpenseDetail | null) {
  detailDialog.mode = mode;
  detailDialog.detail = detail;
  detailDialog.visible = true;
}

function closeDetailDialog() {
  detailDialog.visible = false;
}

function onDetailSubmit(detail: ExpenseDetail, mode: Mode, originalKey: string | null) {
  closeDetailDialog();
  const newKey = `det-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const withKey: ExpenseDetail = { ...detail, _key: newKey };
  if (mode === 'new' || mode === 'clone') {
    form.detail.push(withKey);
  } else if (originalKey) {
    const idx = form.detail.findIndex((d) => d._key === originalKey);
    if (idx >= 0) {
      form.detail[idx] = { ...withKey, _key: originalKey };
    }
  }
  form.detail.sort(compareDetails);
  selectedDetail.value = null;
  recomputeTotals();
}

function onDetailLoadError(status: number | string) {
  emit('load-error', status);
}

function confirmDeleteDetail() {
  if (!selectedDetail.value) return;
  const key = selectedDetail.value._key;
  confirm.require({
    message: 'Confirma a exclusão do detalhe?',
    header: 'Excluir detalhe',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: () => {
      const idx = form.detail.findIndex((d) => d._key === key);
      if (idx >= 0) form.detail.splice(idx, 1);
      selectedDetail.value = null;
      recomputeTotals();
    },
  });
}

function payDetail() {
  if (!selectedDetail.value) return;
  const key = selectedDetail.value._key;
  const idx = form.detail.findIndex((d) => d._key === key);
  if (idx >= 0) {
    form.detail[idx] = { ...form.detail[idx], status: 'Pago' };
  }
  selectedDetail.value = null;
  recomputeTotals();
}

function handleSubmit() {
  if (Object.keys(errors.value).length > 0) {
    submitted.value = true;
    return;
  }
  recomputeTotals();
  const due = form.dueDate as Date;
  const dueIso = getDateDst(due).toISOString();

  const detailPayload = form.detail.map((d) => ({
    _id: d._id,
    description: d.description,
    amount: d.amount,
    account_id: d.account_id,
    category_id: d.category_id,
    currency_id: d.currency_id,
    status: d.status,
  }));

  let payload: ExpenseFormPayload;
  if (props.mode === 'edit' && loaded.value) {
    payload = {
      ...loaded.value,
      _id: loaded.value._id,
      description: form.description.trim(),
      dueDate: dueIso,
      scheduledPayment: form.scheduledPayment,
      amount: form.amount as number,
      amountPaid: form.amountPaid ?? 0,
      currency_id: form.currency_id || undefined,
      account_id: form.account_id || undefined,
      category_id: form.category_id || undefined,
      status: form.status,
      notes: form.notes ?? '',
      detail: detailPayload,
    };
  } else {
    payload = {
      description: form.description.trim(),
      dueDate: dueIso,
      scheduledPayment: form.scheduledPayment,
      amount: form.amount as number,
      amountPaid: form.amountPaid ?? 0,
      currency_id: form.currency_id || undefined,
      account_id: form.account_id || undefined,
      category_id: form.category_id || undefined,
      status: form.status,
      notes: form.notes ?? '',
      detail: detailPayload,
    };
  }

  // omit empty optional ids so the server schema's anyOf can match the detail branch
  if (form.detail.length > 0) {
    payload.account_id = undefined;
    payload.category_id = undefined;
    payload.currency_id = undefined;
  }

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
