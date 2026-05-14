<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-4">
      <h1 class="text-xl font-semibold">{{ $t('expenses.title') }}</h1>
      <div class="flex items-baseline gap-2">
        <span class="text-sm text-slate-500">{{ $t('expenses.balanceLabel') }}</span>
        <span :class="['font-semibold', balanceClass]">{{ formatNumber(balance) }}</span>
      </div>
    </div>

    <Toolbar class="mb-4">
      <template #start>
        <div class="flex gap-2 flex-wrap">
          <Button
            icon="pi pi-plus"
            severity="primary"
            size="small"
            :aria-label="$t('expenses.tooltips.add')"
            v-tooltip.bottom="$t('expenses.tooltips.add')"
            @click="openExpense('new', null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('expenses.tooltips.edit')"
            v-tooltip.bottom="$t('expenses.tooltips.edit')"
            @click="openExpense('edit', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-trash"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('expenses.tooltips.delete')"
            v-tooltip.bottom="$t('expenses.tooltips.delete')"
            @click="selected && confirmDeleteFor(selected._id)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-clone"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('expenses.tooltips.clone')"
            v-tooltip.bottom="$t('expenses.tooltips.clone')"
            @click="openExpense('clone', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-dollar"
            severity="primary"
            size="small"
            :disabled="!selected || selected.status !== 'Em aberto'"
            :aria-label="$t('expenses.tooltips.pay')"
            v-tooltip.bottom="$t('expenses.tooltips.pay')"
            @click="selected && confirmPayFor(selected._id)"
          />
          <Button
            icon="pi pi-cog"
            severity="primary"
            size="small"
            :aria-label="$t('expenses.tooltips.generate')"
            v-tooltip.bottom="$t('expenses.tooltips.generate')"
            @click="generatorVisible = true"
          />
        </div>
      </template>

      <template #center>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.beginYear')"
            label="<<"
            @click="navigate('beginYear')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.prevMonth')"
            :label="$t('home.navigation.prevMonthLabel')"
            @click="navigate('prev')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.currentMonth')"
            :label="$t('home.navigation.currentMonthLabel')"
            @click="navigate('actual')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.nextMonth')"
            :label="$t('home.navigation.nextMonthLabel')"
            @click="navigate('next')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.endYear')"
            label=">>"
            @click="navigate('endYear')"
          />
        </div>
      </template>

      <template #end>
        <div class="hidden md:flex flex-wrap items-center gap-2">
          <DatePicker
            v-model="dueDateBegin"
            date-format="dd/mm/yy"
            show-icon
            input-class="!w-32"
          />
          <DatePicker
            v-model="dueDateEnd"
            date-format="dd/mm/yy"
            show-icon
            input-class="!w-32"
          />
          <Button :label="$t('home.filter')" size="small" severity="secondary" @click="fetchAll" />
        </div>
      </template>
    </Toolbar>

    <DataTable
      v-model:selection="selected"
      v-model:context-menu-selection="selected"
      :value="rows"
      :loading="loading"
      data-key="_id"
      selection-mode="single"
      :context-menu="!isMobile"
      removable-sort
      striped-rows
      :paginator="rows.length > 25"
      :rows="25"
      :row-class="rowClass"
      class="p-datatable-sm"
      @row-contextmenu="onRowContext"
    >
      <Column field="dueDate" :header="$t('expenses.headers.dueDate')" sortable style="width: 7rem" class="text-center">
        <template #body="{ data }">{{ formatShortDate(data.dueDate) }}</template>
      </Column>
      <Column field="description" :header="$t('expenses.headers.description')" sortable>
        <template #footer>{{ $t('common.records', { count: rows.length }) }}</template>
      </Column>
      <Column
        field="amount"
        :header="$t('expenses.headers.amount')"
        sortable
        style="width: 7rem"
        header-class="header-end"
      >
        <template #body="{ data }">
          <span class="block text-right">{{
            formatCurrency(data.amount, data._currencyCodes)
          }}</span>
        </template>
        <template #footer>
          <span class="block text-right">{{ formatNumber(amountTotal) }}</span>
        </template>
      </Column>
      <Column
        field="_accountNames"
        :header="$t('expenses.headers.account')"
        sortable
        style="width: 12rem"
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column
        field="_categoryNames"
        :header="$t('expenses.headers.category')"
        sortable
        style="width: 15rem"
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column field="status" sortable style="width: 4rem" class="text-center">
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
        field="amountPaid"
        :header="$t('expenses.headers.paidAmount')"
        sortable
        style="width: 10rem"
        class="hidden md:table-cell"
        header-class="header-end hidden md:table-cell"
        footer-class="hidden md:table-cell"
      >
        <template #body="{ data }">
          <span class="block text-right">{{
            formatCurrency(data.amountPaid, data._currencyCodes)
          }}</span>
        </template>
        <template #footer>
          <span class="block text-right">{{ formatNumber(amountPaidTotal) }}</span>
        </template>
      </Column>
      <Column
        style="width: 4rem"
        class="text-center hidden md:table-cell"
        header-class="hidden md:table-cell"
      >
        <template #header>
          <i
            class="pi pi-calendar text-lg"
            :aria-label="$t('expenses.headers.scheduled')"
            v-tooltip.bottom="$t('expenses.headers.scheduled')"
          />
        </template>
        <template #body="{ data }">
          <i v-if="data.scheduledPayment" class="pi pi-check text-slate-600" />
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
      <template #empty>{{ $t('expenses.table.empty') }}</template>
    </DataTable>

    <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
    <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

    <ExpenseFormDialog
      :visible="expenseDialog.visible"
      :mode="expenseDialog.mode"
      :expense-id="expenseDialog.expenseId"
      @submit="onExpenseSubmit"
      @close="closeExpenseDialog"
      @load-error="onLoadError"
    />

    <GeneratorFormDialog
      :visible="generatorVisible"
      @submit="onGeneratorSubmit"
      @close="generatorVisible = false"
      @load-error="onLoadError"
      @save-error="onSaveError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import {
  useExpenses,
  type Expense,
  type ExpenseFormPayload,
} from '../composables/useExpenses';
import { useIsMobile } from '../composables/useIsMobile';
import {
  formatCurrency,
  formatNumber,
  formatShortDate,
  getActualMonth,
  getBeginOfYear,
  getEndOfYear,
  getNextMonth,
  getPreviousMonth,
  isLatePayment,
} from '../lib/dateUtils';
import ExpenseFormDialog from './expenses/ExpenseFormDialog.vue';
import GeneratorFormDialog from './expenses/GeneratorFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();
const { isMobile } = useIsMobile();

const { rows, loading, selected, balance, fetchAll: fetchExpenses, create, update, remove, pay } =
  useExpenses();

const { begin: initialBegin, end: initialEnd } = getActualMonth();
const dueDateBegin = ref<Date | null>(initialBegin);
const dueDateEnd = ref<Date | null>(initialEnd);

const generatorVisible = ref(false);

const expenseDialog = reactive<{ visible: boolean; mode: 'new' | 'edit' | 'clone'; expenseId: string | null }>({
  visible: false,
  mode: 'new',
  expenseId: null,
});

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<Expense | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: t('expenses.menu.edit'),
      icon: 'pi pi-pencil',
      command: () => openExpense('edit', row._id),
    },
    {
      label: t('expenses.menu.delete'),
      icon: 'pi pi-trash',
      command: () => confirmDeleteFor(row._id),
    },
    {
      label: t('expenses.menu.clone'),
      icon: 'pi pi-clone',
      command: () => openExpense('clone', row._id),
    },
    {
      label: t('expenses.menu.pay'),
      icon: 'pi pi-dollar',
      visible: row.status === 'Em aberto',
      command: () => confirmPayFor(row._id),
    },
  ];
});

const amountTotal = computed(() => rows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0));
const amountPaidTotal = computed(() =>
  rows.value.reduce((acc, r) => acc + (r.amountPaid ?? 0), 0),
);
const balanceClass = computed(() => {
  if (balance.value < 0) return 'text-red-600';
  if (balance.value === 0) return 'text-slate-500';
  return 'text-green-600';
});

onMounted(fetchAll);

async function fetchAll() {
  if (!dueDateBegin.value || !dueDateEnd.value) return;
  try {
    await fetchExpenses(dueDateBegin.value, dueDateEnd.value);
  } catch (err) {
    onLoadError(extractStatus(err));
  }
}

function rowClass(data: Expense): string {
  return isLatePayment(data.status === 'Em aberto', data.dueDate) ? 'late-payment' : '';
}

function navigate(target: 'beginYear' | 'prev' | 'actual' | 'next' | 'endYear') {
  const base = dueDateBegin.value ?? new Date();
  let range;
  switch (target) {
    case 'beginYear':
      range = getBeginOfYear(base);
      break;
    case 'prev':
      range = getPreviousMonth(base);
      break;
    case 'actual':
      range = getActualMonth();
      break;
    case 'next':
      range = getNextMonth(base);
      break;
    case 'endYear':
      range = getEndOfYear(base);
      break;
  }
  dueDateBegin.value = range.begin;
  dueDateEnd.value = range.end;
  fetchAll();
}

function openExpense(mode: 'new' | 'edit' | 'clone', id: string | null) {
  if ((mode === 'edit' || mode === 'clone') && !id) return;
  expenseDialog.mode = mode;
  expenseDialog.expenseId = id;
  expenseDialog.visible = true;
}

function openRowMenu(e: MouseEvent, row: Expense) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: Expense }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
}

function closeExpenseDialog() {
  expenseDialog.visible = false;
}

async function onExpenseSubmit(
  payload: ExpenseFormPayload,
  mode: 'new' | 'edit' | 'clone',
) {
  closeExpenseDialog();
  try {
    if (mode === 'edit') {
      await update(payload);
      toast.add({
        severity: 'success',
        summary: t('expenses.success.edited'),
        life: 4000,
      });
    } else {
      await create(payload);
      toast.add({
        severity: 'success',
        summary: t('expenses.success.added'),
        life: 4000,
      });
    }
    await fetchAll();
  } catch (err) {
    onSaveError(extractStatus(err));
  }
}

function onGeneratorSubmit() {
  generatorVisible.value = false;
  toast.add({
    severity: 'success',
    summary: t('expenses.success.generated'),
    life: 4000,
  });
  fetchAll();
}

function confirmDeleteFor(id: string) {
  confirm.require({
    message: t('expenses.confirm.deleteMessage'),
    header: t('expenses.confirm.deleteHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await remove(id);
        toast.add({
          severity: 'success',
          summary: t('expenses.success.deleted'),
          life: 4000,
        });
        await fetchAll();
      } catch (err) {
        onSaveError(extractStatus(err));
      }
    },
  });
}

function confirmPayFor(id: string) {
  confirm.require({
    message: t('expenses.confirm.payMessage'),
    header: t('expenses.confirm.payHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await pay(id);
        toast.add({
          severity: 'success',
          summary: t('expenses.success.paid'),
          life: 4000,
        });
        await fetchAll();
      } catch (err) {
        onSaveError(extractStatus(err));
      }
    },
  });
}

function onLoadError(status: number | string) {
  toast.add({
    severity: 'error',
    summary: t('common.errors.loadingFailed', { status }),
    life: 6000,
  });
}

function onSaveError(status: number | string) {
  toast.add({
    severity: 'error',
    summary: t('common.errors.savingFailed', { status }),
    life: 6000,
  });
}

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>

<style>
.late-payment td {
  color: #b91c1c;
}
</style>
