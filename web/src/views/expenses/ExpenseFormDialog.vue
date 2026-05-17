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

    <form
      v-else
      class="flex flex-col gap-4"
      data-form-type="other"
      @submit.prevent="handleSubmit"
    >
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-8 flex flex-col gap-1">
          <label for="expenseDescription" class="text-sm font-medium">{{ $t('common.fields.description') }}</label>
          <InputText
            id="expenseDescription"
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
        <div class="col-span-12 sm:col-span-4 flex items-end">
          <div class="flex items-center gap-2 mb-1.5">
            <Checkbox
              v-model="form.scheduledPayment"
              inputId="expenseScheduledPayment"
              binary
            />
            <label for="expenseScheduledPayment" class="text-sm">{{ $t('expenses.form.scheduledPayment') }}</label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-4 flex flex-col gap-1">
          <label for="expenseDueDate" class="text-sm font-medium">{{ $t('common.fields.dueDate') }}</label>
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
        <div v-if="!hasDetail" class="col-span-4 sm:col-span-3 flex flex-col gap-1">
          <label for="expenseCurrency" class="text-sm font-medium">{{ $t('common.fields.currency') }}</label>
          <Select
            id="expenseCurrency"
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
        <div
          :class="[
            hasDetail
              ? 'col-span-12 min-[480px]:col-span-6 sm:col-span-4'
              : 'col-span-8 sm:col-span-5',
            'flex flex-col gap-1',
          ]"
        >
          <label for="expenseAmount" class="text-sm font-medium">{{ $t('common.fields.amount') }}</label>
          <InputNumber
            id="expenseAmount"
            v-model="form.amount"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :disabled="hasDetail"
            :invalid="submitted && !!errors.amount"
            :locale="numberLocale"
            input-class="text-right"
          />
          <small v-if="submitted && errors.amount" class="text-red-600">{{ errors.amount }}</small>
        </div>
        <div v-if="hasDetail" class="col-span-12 min-[480px]:col-span-6 sm:col-span-4 flex flex-col gap-1">
          <label for="expenseAmountPaid" class="text-sm font-medium">{{ $t('common.fields.paidAmount') }}</label>
          <InputNumber
            id="expenseAmountPaid"
            v-model="form.amountPaid"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            disabled
            :locale="numberLocale"
            input-class="text-right"
          />
        </div>
      </div>

      <div v-if="!hasDetail" class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseAccount" class="text-sm font-medium">{{ $t('common.fields.account') }}</label>
          <Select
            id="expenseAccount"
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
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseCategory" class="text-sm font-medium">{{ $t('common.fields.category') }}</label>
          <Select
            id="expenseCategory"
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
      </div>

      <div v-if="!hasDetail" class="grid grid-cols-12 gap-3">
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseStatus" class="text-sm font-medium">{{ $t('common.fields.status') }}</label>
          <Select
            id="expenseStatus"
            v-model="form.status"
            :options="expenseStatusOptions"
            option-label="label"
            option-value="value"
            :invalid="submitted && !!errors.status"
            :placeholder="$t('common.placeholders.select')"
            @change="onChangeStatus"
          />
          <small v-if="submitted && errors.status" class="text-red-600">{{ errors.status }}</small>
        </div>
        <div class="col-span-12 sm:col-span-6 flex flex-col gap-1">
          <label for="expenseAmountPaid" class="text-sm font-medium">{{ $t('common.fields.paidAmount') }}</label>
          <InputNumber
            id="expenseAmountPaid"
            v-model="form.amountPaid"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            :disabled="hasDetail"
            :invalid="submitted && !!errors.amountPaid"
            :locale="numberLocale"
            input-class="text-right"
          />
          <small v-if="submitted && errors.amountPaid" class="text-red-600">{{
            errors.amountPaid
          }}</small>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="expenseNotes" class="text-sm font-medium">{{ $t('common.fields.notes') }}</label>
        <Textarea id="expenseNotes" v-model="form.notes" rows="2" autocomplete="off" />
      </div>

      <div class="flex flex-col gap-2">
        <Toolbar class="!p-2">
          <template #start>
            <div class="flex gap-2">
              <Button
                icon="pi pi-plus"
                size="small"
                :aria-label="$t('common.actions.add')"
                v-tooltip.bottom="$t('common.actions.add')"
                @click="openDetail('new', null)"
              />
              <Button
                class="hidden md:inline-flex"
                icon="pi pi-pencil"
                size="small"
                :disabled="!selectedDetail"
                :aria-label="$t('common.actions.edit')"
                v-tooltip.bottom="$t('common.actions.edit')"
                @click="openDetail('edit', selectedDetail)"
              />
              <Button
                class="hidden md:inline-flex"
                icon="pi pi-trash"
                size="small"
                :disabled="!selectedDetail"
                :aria-label="$t('common.actions.delete')"
                v-tooltip.bottom="$t('common.actions.delete')"
                @click="confirmDeleteDetailFor(selectedDetail?._key ?? null)"
              />
              <Button
                class="hidden md:inline-flex"
                icon="pi pi-clone"
                size="small"
                :disabled="!selectedDetail"
                :aria-label="$t('common.actions.clone')"
                v-tooltip.bottom="$t('common.actions.clone')"
                @click="openDetail('clone', selectedDetail)"
              />
              <Button
                class="hidden md:inline-flex"
                icon="pi pi-dollar"
                size="small"
                :disabled="!selectedDetail || selectedDetail.status !== 'Em aberto'"
                :aria-label="$t('common.actions.pay')"
                v-tooltip.bottom="$t('common.actions.pay')"
                @click="payDetailFor(selectedDetail?._key ?? null)"
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          v-model:selection="selectedDetail"
          v-model:context-menu-selection="selectedDetail"
          :value="form.detail"
          data-key="_key"
          selection-mode="single"
          :context-menu="!isMobile"
          striped-rows
          class="p-datatable-sm"
          :rows="5"
          @row-contextmenu="onRowContext"
        >
          <Column field="description" :header="$t('common.fields.description')">
            <template #footer>{{ $t('common.records', { count: form.detail.length }) }}</template>
          </Column>
          <Column :header="$t('common.fields.amount')" style="width: 9rem" header-class="header-end">
            <template #body="{ data }">
              <span class="block text-right">{{
                formatCurrency(data.amount, data._currency?.currencyCode)
              }}</span>
            </template>
            <template #footer>
              <span class="block text-right">{{ formatNumber(detailTotal) }}</span>
            </template>
          </Column>
          <Column :header="$t('common.fields.account')" style="width: 12rem">
            <template #body="{ data }">{{ data._account?.name ?? '' }}</template>
          </Column>
          <Column :header="$t('common.fields.category')" style="width: 12rem">
            <template #body="{ data }">{{ data._category?.name ?? '' }}</template>
          </Column>
          <Column field="status" style="width: 3rem" class="text-center">
            <template #header>
              <i
                class="pi pi-money-bill text-lg"
                :aria-label="$t('expenses.headers.paid')"
                v-tooltip.bottom="$t('expenses.headers.paid')"
              />
            </template>
            <template #body="{ data }">
              <i v-if="data.status === 'Pago'" class="pi pi-check text-green-600" />
            </template>
          </Column>
          <Column
            class="md:hidden text-center"
            header-class="md:hidden"
            style="width: 3rem"
          >
            <template #body="{ data }">
              <Button
                icon="pi pi-ellipsis-v"
                text
                rounded
                size="small"
                :aria-label="$t('expenses.headers.actions')"
                aria-haspopup="menu"
                @click.stop="openRowMenu($event, data)"
              />
            </template>
          </Column>
          <template #empty>
            <div class="text-center text-sm text-slate-500 py-4">{{ $t('expenses.form.detailTable.empty') }}</div>
          </template>
        </DataTable>
      </div>
    </form>

    <template #footer>
      <Button :label="$t('common.actions.cancel')" severity="secondary" text @click="handleClose" />
      <Button :label="$t('common.actions.confirm')" :disabled="loading" @click="handleSubmit" />
    </template>
  </Dialog>

  <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
  <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

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
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
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
import { useIsMobile } from '../../composables/useIsMobile';
import { formatCurrency, formatNumber, getDateDst } from '../../lib/dateUtils';
import { intlLocale } from '../../i18n';
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

const { t } = useI18n();

const expenseStatusOptions = computed<{ label: string; value: ExpenseStatus }[]>(() => [
  { label: t('enums.expenseStatus.Em aberto'), value: 'Em aberto' },
  { label: t('enums.expenseStatus.Pago'), value: 'Pago' },
]);

const numberLocale = computed(() => intlLocale());

const { getById } = useExpenses();
const { loadCurrencies, loadAccounts, loadCategories, getDefaultCurrencyId } = useReferenceData();
const { isMobile } = useIsMobile();
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

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<ExpenseDetail | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: t('common.actions.edit'),
      icon: 'pi pi-pencil',
      command: () => openDetail('edit', row),
    },
    {
      label: t('common.actions.delete'),
      icon: 'pi pi-trash',
      command: () => confirmDeleteDetailFor(row._key ?? null),
    },
    {
      label: t('common.actions.clone'),
      icon: 'pi pi-clone',
      command: () => openDetail('clone', row),
    },
    {
      label: t('common.actions.pay'),
      icon: 'pi pi-dollar',
      visible: row.status === 'Em aberto',
      command: () => payDetailFor(row._key ?? null),
    },
  ];
});

const hasDetail = computed(() => form.detail.length > 0);

const detailTotal = computed(() =>
  form.detail.reduce((acc, d) => acc + (d.amount ?? 0), 0),
);

const title = computed(() => {
  if (props.mode === 'new') return t('expenses.form.addTitle');
  if (props.mode === 'clone') return t('expenses.form.cloneTitle');
  return t('expenses.form.editTitle');
});

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  const desc = form.description?.trim() ?? '';
  if (!desc) out.description = t('common.errors.requiredField', { field: t('common.fields.description') });
  else if (desc.length < 3)
    out.description = t('common.errors.minLength', { field: t('common.fields.description'), min: 3 });
  else if (desc.length > 100)
    out.description = t('common.errors.maxLength', { field: t('common.fields.description'), max: 100 });
  if (!form.dueDate) out.dueDate = t('common.errors.requiredField', { field: t('common.fields.dueDate') });
  if (!form.status) out.status = t('common.errors.requiredField', { field: t('common.fields.status') });
  if (!hasDetail.value) {
    if (!form.currency_id) out.currency_id = t('common.errors.requiredField', { field: t('common.fields.currency') });
    if (!form.amount || form.amount <= 0) out.amount = t('common.errors.requiredField', { field: t('common.fields.amount') });
    if (!form.account_id) out.account_id = t('common.errors.requiredField', { field: t('common.fields.account') });
    if (!form.category_id) out.category_id = t('common.errors.requiredField', { field: t('common.fields.category') });
    if (form.status === 'Pago' && (!form.amountPaid || form.amountPaid <= 0)) {
      out.amountPaid = t('common.errors.requiredField', { field: t('common.fields.paidAmount') });
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

function openRowMenu(e: MouseEvent, row: ExpenseDetail) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: ExpenseDetail }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
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

function confirmDeleteDetailFor(key: string | null) {
  if (!key) return;
  confirm.require({
    message: t('expenses.form.detailConfirm.deleteMessage'),
    header: t('expenses.form.detailConfirm.deleteHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: () => {
      const idx = form.detail.findIndex((d) => d._key === key);
      if (idx >= 0) form.detail.splice(idx, 1);
      selectedDetail.value = null;
      recomputeTotals();
    },
  });
}

function payDetailFor(key: string | null) {
  if (!key) return;
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
