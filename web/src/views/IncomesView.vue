<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-4">
      <h1 class="text-xl font-semibold">Cadastro de receitas</h1>
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
            @click="openIncome('new', null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :disabled="!selected"
            aria-label="Editar"
            v-tooltip.bottom="'Editar'"
            @click="openIncome('edit', selected?._id ?? null)"
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
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-clone"
            severity="primary"
            size="small"
            :disabled="!selected"
            aria-label="Clonar"
            v-tooltip.bottom="'Clonar'"
            @click="openIncome('clone', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-dollar"
            severity="primary"
            size="small"
            :disabled="!selected || selected.status !== 'Em aberto'"
            aria-label="Receber"
            v-tooltip.bottom="'Receber'"
            @click="selected && confirmReceiveFor(selected._id)"
          />
          <Button
            icon="pi pi-cog"
            severity="primary"
            size="small"
            aria-label="Gerar"
            v-tooltip.bottom="'Gerar'"
            @click="generatorVisible = true"
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
      :row-class="rowClass"
      class="p-datatable-sm"
      @row-contextmenu="onRowContext"
    >
      <Column field="dueDate" header="Vencimento" sortable style="width: 9rem" class="text-center">
        <template #body="{ data }">{{ formatShortDate(data.dueDate) }}</template>
      </Column>
      <Column field="description" header="Descrição" sortable>
        <template #footer>{{ rows.length }} registros</template>
      </Column>
      <Column
        field="amount"
        header="Valor"
        sortable
        style="width: 10rem"
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
        header="Conta"
        sortable
        style="width: 12rem"
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column
        field="_categoryNames"
        header="Categoria"
        sortable
        style="width: 15rem"
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column field="status" header="Situação" sortable style="width: 7rem" class="text-center" />
      <Column
        field="amountReceived"
        header="Valor receb."
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
            aria-label="Ações"
            aria-haspopup="menu"
            @click.stop="openRowMenu($event, data)"
          />
        </template>
      </Column>
      <template #empty>Nenhuma receita encontrada.</template>
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
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import {
  useIncomes,
  type Income,
  type IncomeFormPayload,
} from '../composables/useIncomes';
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
import IncomeFormDialog from './incomes/IncomeFormDialog.vue';
import GeneratorFormDialog from './incomes/GeneratorFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { isMobile } = useIsMobile();

const { rows, loading, selected, balance, fetchAll: fetchIncomes, create, update, remove, receive } =
  useIncomes();

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
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => openIncome('edit', row._id),
    },
    {
      label: 'Excluir',
      icon: 'pi pi-trash',
      command: () => confirmDeleteFor(row._id),
    },
    {
      label: 'Clonar',
      icon: 'pi pi-clone',
      command: () => openIncome('clone', row._id),
    },
    {
      label: 'Receber',
      icon: 'pi pi-dollar',
      visible: row.status === 'Em aberto',
      command: () => confirmReceiveFor(row._id),
    },
  ];
});

const amountTotal = computed(() => rows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0));
const amountReceivedTotal = computed(() =>
  rows.value.reduce((acc, r) => acc + (r.amountReceived ?? 0), 0),
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
        summary: 'Receita editada com sucesso!',
        life: 4000,
      });
    } else {
      await create(payload);
      toast.add({
        severity: 'success',
        summary: 'Receita adicionada com sucesso!',
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
    summary: 'Receita(s) gerada(s) com sucesso!',
    life: 4000,
  });
  fetchAll();
}

function confirmDeleteFor(id: string) {
  confirm.require({
    message: 'Confirma a exclusão da receita?',
    header: 'Excluir receita',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: async () => {
      try {
        await remove(id);
        toast.add({
          severity: 'success',
          summary: 'Receita excluída com sucesso!',
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
    message: 'Confirma o recebimento da receita?',
    header: 'Receber receita',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: async () => {
      try {
        await receive(id);
        toast.add({
          severity: 'success',
          summary: 'Receita recebida com sucesso!',
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

<style>
.late-payment td {
  color: #b91c1c;
}
</style>
