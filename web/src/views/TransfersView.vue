<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-4">
      <h1 class="text-xl font-semibold">Cadastro de transferências</h1>
      <div class="flex items-baseline gap-2">
        <span class="text-sm text-slate-500">Saldo:</span>
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
            aria-label="Adicionar"
            v-tooltip.bottom="'Adicionar'"
            @click="openTransfer('new', null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :disabled="!selected"
            aria-label="Editar"
            v-tooltip.bottom="'Editar'"
            @click="openTransfer('edit', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-trash"
            severity="primary"
            size="small"
            :disabled="!selected"
            aria-label="Excluir"
            v-tooltip.bottom="'Excluir'"
            @click="selected && confirmDeleteFor(selected._id)"
          />
        </div>
      </template>

      <template #center>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o início do ano'"
            label="<<"
            @click="navigate('beginYear')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o mês anterior'"
            label="-1 Mês"
            @click="navigate('prev')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o mês atual'"
            label="Atual"
            @click="navigate('actual')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o próximo mês'"
            label="+1 Mês"
            @click="navigate('next')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o fim do ano'"
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
          <Button label="Filtrar" size="small" severity="secondary" @click="fetchAll" />
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
      class="p-datatable-sm"
      @row-contextmenu="onRowContext"
    >
      <Column
        field="date"
        header="Data"
        sortable
        class="text-center w-1/4 md:w-36"
      >
        <template #body="{ data }">{{ formatShortDate(data.date) }}</template>
        <template #footer>{{ rows.length }} registros</template>
      </Column>
      <Column
        field="amount"
        header="Valor"
        sortable
        class="w-1/4 md:w-44"
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
      <Column field="_accountOrigin.name" header="Conta Origem" sortable />
      <Column
        field="_accountTarget.name"
        header="Conta Destino"
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
            aria-label="Ações"
            aria-haspopup="menu"
            @click.stop="openRowMenu($event, data)"
          />
        </template>
      </Column>
      <template #empty>Nenhuma transferência encontrada.</template>
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
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import {
  useTransfers,
  type Transfer,
  type TransferFormPayload,
} from '../composables/useTransfers';
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
} from '../lib/dateUtils';
import TransferFormDialog from './transfers/TransferFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { isMobile } = useIsMobile();

const { rows, loading, selected, balance, fetchAll: fetchTransfers, create, update, remove } =
  useTransfers();

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
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => openTransfer('edit', row._id),
    },
    {
      label: 'Excluir',
      icon: 'pi pi-trash',
      command: () => confirmDeleteFor(row._id),
    },
  ];
});

const amountTotal = computed(() => rows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0));
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
        summary: 'Transferência editada com sucesso!',
        life: 4000,
      });
    } else {
      await create(payload);
      toast.add({
        severity: 'success',
        summary: 'Transferência adicionada com sucesso!',
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
    message: 'Confirma a exclusão da transferência?',
    header: 'Excluir transferência',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: async () => {
      try {
        await remove(id);
        toast.add({
          severity: 'success',
          summary: 'Transferência excluída com sucesso!',
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
    summary: `Erro ao carregar os dados: ${status}`,
    life: 6000,
  });
}

function onSaveError(status: number | string) {
  toast.add({
    severity: 'error',
    summary: `Erro ao salvar os dados: ${status}`,
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
