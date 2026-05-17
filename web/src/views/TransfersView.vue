<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-4">
      <h1 class="text-xl font-semibold">{{ $t('transfers.title') }}</h1>
      <div class="flex items-baseline gap-2">
        <span class="text-sm text-slate-500">{{ $t('transfers.balanceLabel') }}</span>
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
            :aria-label="$t('transfers.tooltips.add')"
            v-tooltip.bottom="$t('transfers.tooltips.add')"
            @click="openTransfer('new', null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('transfers.tooltips.edit')"
            v-tooltip.bottom="$t('transfers.tooltips.edit')"
            @click="openTransfer('edit', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-trash"
            severity="primary"
            size="small"
            :disabled="!selected"
            :aria-label="$t('transfers.tooltips.delete')"
            v-tooltip.bottom="$t('transfers.tooltips.delete')"
            @click="selected && confirmDeleteFor(selected._id)"
          />
          <Button
            icon="pi pi-search"
            :severity="searchVisible ? 'secondary' : 'primary'"
            size="small"
            :aria-label="$t('transfers.tooltips.search')"
            v-tooltip.bottom="$t('transfers.tooltips.search')"
            @click="toggleSearch"
          />
          <InputText
            v-if="searchVisible"
            v-model="searchTerm"
            size="small"
            class="!w-40 md:!w-56"
            autofocus
            :placeholder="$t('transfers.searchPlaceholder')"
            :aria-label="$t('transfers.tooltips.search')"
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
            v-model="dateBegin"
            date-format="dd/mm/yy"
            show-icon
            input-class="!w-32"
          />
          <DatePicker
            v-model="dateEnd"
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
      class="p-datatable-sm"
      @row-contextmenu="onRowContext"
    >
      <Column field="date" :header="$t('transfers.headers.date')" sortable style="width: 6rem" class="text-center">
        <template #body="{ data }">{{ formatShortDate(data.date) }}</template>
        <template #footer>{{ $t('common.records', { count: filteredRows.length }) }}</template>
      </Column>
      <Column
        field="amount"
        :header="$t('transfers.headers.amount')"
        sortable
        style="width: 7rem"
        header-class="header-end"
      >
        <template #body="{ data }">
          <span class="block text-right">{{
            formatCurrency(data.amount, data._currency?.currencyCode)
          }}</span>
        </template>
        <template #footer>
          <span class="block text-right">{{ formatNumber(amountTotal) }}</span>
        </template>
      </Column>
      <Column field="_accountOrigin.name" :header="$t('transfers.headers.origin')" sortable />
      <Column
        field="_accountTarget.name"
        :header="$t('transfers.headers.target')"
        sortable
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
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
            :aria-label="$t('transfers.headers.actions')"
            aria-haspopup="menu"
            @click.stop="openRowMenu($event, data)"
          />
        </template>
      </Column>
      <template #empty>{{ $t('transfers.table.empty') }}</template>
    </DataTable>

    <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
    <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

    <TransferFormDialog
      :visible="dialog.visible"
      :mode="dialog.mode"
      :transfer-id="dialog.transferId"
      @submit="onDialogSubmit"
      @close="closeDialog"
      @load-error="onLoadError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import {
  useTransfers,
  type Transfer,
  type TransferFormPayload,
} from '../composables/useTransfers';
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
} from '../lib/dateUtils';
import TransferFormDialog from './transfers/TransferFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();
const { isMobile } = useIsMobile();

const { rows, loading, selected, balance, fetchAll: fetchTransfers, create, update, remove } =
  useTransfers();

const { searchTerm, searchVisible, filteredRows } = useSearchFilter(rows);

function toggleSearch() {
  searchVisible.value = !searchVisible.value;
  if (!searchVisible.value) searchTerm.value = '';
}

const { begin: initialBegin, end: initialEnd } = getActualMonth();
const dateBegin = ref<Date | null>(initialBegin);
const dateEnd = ref<Date | null>(initialEnd);

const dialog = reactive<{ visible: boolean; mode: 'new' | 'edit'; transferId: string | null }>({
  visible: false,
  mode: 'new',
  transferId: null,
});

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<Transfer | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: t('transfers.menu.edit'),
      icon: 'pi pi-pencil',
      command: () => openTransfer('edit', row._id),
    },
    {
      label: t('transfers.menu.delete'),
      icon: 'pi pi-trash',
      command: () => confirmDeleteFor(row._id),
    },
  ];
});

const amountTotal = computed(() => filteredRows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0));
const balanceClass = computed(() => {
  if (balance.value < 0) return 'text-red-600';
  if (balance.value === 0) return 'text-slate-500';
  return 'text-green-600';
});

onMounted(fetchAll);

async function fetchAll() {
  if (!dateBegin.value || !dateEnd.value) return;
  try {
    await fetchTransfers(dateBegin.value, dateEnd.value);
  } catch (err) {
    onLoadError(extractStatus(err));
  }
}

function navigate(target: 'beginYear' | 'prev' | 'actual' | 'next' | 'endYear') {
  const base = dateBegin.value ?? new Date();
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
  dateBegin.value = range.begin;
  dateEnd.value = range.end;
  fetchAll();
}

function openTransfer(mode: 'new' | 'edit', id: string | null) {
  if (mode === 'edit' && !id) return;
  dialog.mode = mode;
  dialog.transferId = id;
  dialog.visible = true;
}

function openRowMenu(e: MouseEvent, row: Transfer) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: Transfer }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
}

function closeDialog() {
  dialog.visible = false;
}

async function onDialogSubmit(payload: TransferFormPayload, mode: 'new' | 'edit') {
  closeDialog();
  try {
    if (mode === 'edit') {
      await update(payload);
      toast.add({
        severity: 'success',
        summary: t('transfers.success.edited'),
        life: 4000,
      });
    } else {
      await create(payload);
      toast.add({
        severity: 'success',
        summary: t('transfers.success.added'),
        life: 4000,
      });
    }
    await fetchAll();
  } catch (err) {
    onSaveError(extractStatus(err));
  }
}

function confirmDeleteFor(id: string) {
  confirm.require({
    message: t('transfers.confirm.deleteMessage'),
    header: t('transfers.confirm.deleteHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await remove(id);
        toast.add({
          severity: 'success',
          summary: t('transfers.success.deleted'),
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
