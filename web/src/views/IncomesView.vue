<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-4">
      <h1 class="text-xl font-semibold">{{ $t('incomes.title') }}</h1>
      <div class="flex items-baseline gap-2">
        <span class="text-sm text-slate-500">{{ $t('incomes.balanceLabel') }}</span>
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
            :aria-label="$t('incomes.tooltips.add')"
            v-tooltip.bottom="$t('incomes.tooltips.add')"
            @click="openIncome('new', null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('incomes.tooltips.edit')"
            v-tooltip.bottom="$t('incomes.tooltips.edit')"
            @click="openIncome('edit', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-trash"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('incomes.tooltips.delete')"
            v-tooltip.bottom="$t('incomes.tooltips.delete')"
            @click="selected && confirmDeleteFor(selected._id)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-clone"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('incomes.tooltips.clone')"
            v-tooltip.bottom="$t('incomes.tooltips.clone')"
            @click="openIncome('clone', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-dollar"
            severity="primary"
            size="small"
            :disabled="!selected || selected.status !== 'Em aberto'"
            :aria-label="$t('incomes.tooltips.receive')"
            v-tooltip.bottom="$t('incomes.tooltips.receive')"
            @click="selected && confirmReceiveFor(selected._id)"
          />
          <Button
            icon="pi pi-cog"
            severity="primary"
            size="small"
            :aria-label="$t('incomes.tooltips.generate')"
            v-tooltip.bottom="$t('incomes.tooltips.generate')"
            @click="generatorVisible = true"
          />
          <ToolbarSearch
            v-model="searchTerm"
            :placeholder="$t('incomes.searchPlaceholder')"
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
      :value="filteredRows"
      :loading="loading"
      data-key="_id"
      selection-mode="single"
      :context-menu="!isMobile"
      removable-sort
      striped-rows
      :paginator="filteredRows.length > pageSize"
      :rows="pageSize"
      :row-class="rowClass"
      class="p-datatable-sm"
      @row-contextmenu="onRowContext"
    >
      <Column field="dueDate" :header="$t('incomes.headers.dueDate')" sortable style="width: 6rem" class="text-center">
        <template #body="{ data }">{{ formatShortDate(data.dueDate) }}</template>
      </Column>
      <Column field="description" :header="$t('incomes.headers.description')" sortable>
        <template #footer>{{ $t('common.records', { count: filteredRows.length }) }}</template>
      </Column>
      <Column
        field="amount"
        :header="$t('incomes.headers.amount')"
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
        :header="$t('incomes.headers.account')"
        sortable
        style="width: 12rem"
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column
        field="_categoryNames"
        :header="$t('incomes.headers.category')"
        sortable
        style="width: 15rem"
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column field="status" sortable style="width: 3rem" class="text-center">
        <template #header>
          <i
            class="pi pi-wallet text-lg"
            :aria-label="$t('incomes.headers.received')"
            v-tooltip.bottom="$t('incomes.headers.received')"
          />
        </template>
        <template #body="{ data }">
          <i v-if="data.status === 'Recebido'" class="pi pi-check text-green-600" />
        </template>
      </Column>
      <Column
        field="amountReceived"
        :header="$t('incomes.headers.receivedAmount')"
        sortable
        style="width: 10rem"
        class="hidden md:table-cell"
        header-class="header-end hidden md:table-cell"
        footer-class="hidden md:table-cell"
      >
        <template #body="{ data }">
          <span class="block text-right">{{
            formatCurrency(data.amountReceived, data._currencyCodes)
          }}</span>
        </template>
        <template #footer>
          <span class="block text-right">{{ formatNumber(amountReceivedTotal) }}</span>
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
            :aria-label="$t('incomes.headers.actions')"
            aria-haspopup="menu"
            @click.stop="openRowMenu($event, data)"
          />
        </template>
      </Column>
      <template #empty>{{ $t('incomes.table.empty') }}</template>
    </DataTable>

    <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
    <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

    <IncomeFormDialog
      :visible="incomeDialog.visible"
      :mode="incomeDialog.mode"
      :income-id="incomeDialog.incomeId"
      @submit="onIncomeSubmit"
      @close="closeIncomeDialog"
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
import ToolbarSearch from '../components/ToolbarSearch.vue';
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import {
  useIncomes,
  type Income,
  type IncomeFormPayload,
} from '../composables/useIncomes';
import { useIsMobile } from '../composables/useIsMobile';
import { pageSize } from '../composables/usePagination';
import { useSearchFilter } from '../composables/useSearchFilter';
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
import IncomeFormDialog from './incomes/IncomeFormDialog.vue';
import GeneratorFormDialog from './incomes/GeneratorFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();
const { isMobile } = useIsMobile();

const { rows, loading, selected, balance, fetchAll: fetchIncomes, create, update, remove, receive } =
  useIncomes();

const { searchTerm, filteredRows } = useSearchFilter(rows);

const { begin: initialBegin, end: initialEnd } = getActualMonth();
const dueDateBegin = ref<Date | null>(initialBegin);
const dueDateEnd = ref<Date | null>(initialEnd);

const generatorVisible = ref(false);

const incomeDialog = reactive<{ visible: boolean; mode: 'new' | 'edit' | 'clone'; incomeId: string | null }>({
  visible: false,
  mode: 'new',
  incomeId: null,
});

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<Income | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: t('incomes.menu.edit'),
      icon: 'pi pi-pencil',
      command: () => openIncome('edit', row._id),
    },
    {
      label: t('incomes.menu.delete'),
      icon: 'pi pi-trash',
      command: () => confirmDeleteFor(row._id),
    },
    {
      label: t('incomes.menu.clone'),
      icon: 'pi pi-clone',
      command: () => openIncome('clone', row._id),
    },
    {
      label: t('incomes.menu.receive'),
      icon: 'pi pi-dollar',
      visible: row.status === 'Em aberto',
      command: () => confirmReceiveFor(row._id),
    },
  ];
});

const amountTotal = computed(() => filteredRows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0));
const amountReceivedTotal = computed(() =>
  filteredRows.value.reduce((acc, r) => acc + (r.amountReceived ?? 0), 0),
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
    await fetchIncomes(dueDateBegin.value, dueDateEnd.value);
  } catch (err) {
    onLoadError(extractStatus(err));
  }
}

function rowClass(data: Income): string {
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

function openIncome(mode: 'new' | 'edit' | 'clone', id: string | null) {
  if ((mode === 'edit' || mode === 'clone') && !id) return;
  incomeDialog.mode = mode;
  incomeDialog.incomeId = id;
  incomeDialog.visible = true;
}

function openRowMenu(e: MouseEvent, row: Income) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: Income }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
}

function closeIncomeDialog() {
  incomeDialog.visible = false;
}

async function onIncomeSubmit(
  payload: IncomeFormPayload,
  mode: 'new' | 'edit' | 'clone',
) {
  closeIncomeDialog();
  try {
    if (mode === 'edit') {
      await update(payload);
      toast.add({
        severity: 'success',
        summary: t('incomes.success.edited'),
        life: 4000,
      });
    } else {
      await create(payload);
      toast.add({
        severity: 'success',
        summary: t('incomes.success.added'),
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
    summary: t('incomes.success.generated'),
    life: 4000,
  });
  fetchAll();
}

function confirmDeleteFor(id: string) {
  confirm.require({
    message: t('incomes.confirm.deleteMessage'),
    header: t('incomes.confirm.deleteHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await remove(id);
        toast.add({
          severity: 'success',
          summary: t('incomes.success.deleted'),
          life: 4000,
        });
        await fetchAll();
      } catch (err) {
        onSaveError(extractStatus(err));
      }
    },
  });
}

function confirmReceiveFor(id: string) {
  confirm.require({
    message: t('incomes.confirm.receiveMessage'),
    header: t('incomes.confirm.receiveHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await receive(id);
        toast.add({
          severity: 'success',
          summary: t('incomes.success.received'),
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
