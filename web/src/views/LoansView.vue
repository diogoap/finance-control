<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-xl font-semibold mb-4">Cadastro de empréstimos</h1>

    <Toolbar class="mb-4">
      <template #start>
        <div class="flex gap-2 flex-wrap">
          <Button
            icon="pi pi-plus"
            severity="primary"
            size="small"
            aria-label="Adicionar"
            v-tooltip.bottom="'Adicionar'"
            @click="openLoan('new', null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :disabled="!selected"
            aria-label="Editar"
            v-tooltip.bottom="'Editar'"
            @click="openLoan('edit', selected?._id ?? null)"
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
            @click="openLoan('clone', selected?._id ?? null)"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-dollar"
            severity="primary"
            size="small"
            :disabled="!selected || selected.status !== 'Em aberto'"
            aria-label="Quitar"
            v-tooltip.bottom="'Quitar'"
            @click="selected && confirmPayFor(selected._id)"
          />
        </div>
      </template>

      <template #end>
        <label class="flex items-center gap-2 text-sm">
          <Checkbox v-model="listPaid" binary @change="fetchAll" />
          Listar empréstimos quitados?
        </label>
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
      <Column field="description" header="Descrição" sortable>
        <template #footer>{{ rows.length }} registros</template>
      </Column>
      <Column
        field="transactionDate"
        header="Data"
        sortable
        style="width: 7rem"
        class="text-center"
      >
        <template #body="{ data }">{{ formatShortDate(data.transactionDate) }}</template>
      </Column>
      <Column
        field="dueDate"
        header="Vencimento"
        sortable
        style="width: 9rem"
        class="text-center hidden md:table-cell"
        header-class="hidden md:table-cell"
      >
        <template #body="{ data }">{{ formatShortDate(data.dueDate) }}</template>
      </Column>
      <Column
        field="amount"
        header="Valor"
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
      <Column
        field="_account.name"
        header="Conta"
        sortable
        class="hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column
        field="type"
        header="Tipo"
        sortable
        style="width: 8rem"
        class="text-center hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column field="status" sortable style="width: 4rem" class="text-center">
        <template #header>
          <i
            class="pi pi-money-bill text-lg"
            aria-label="Quitado"
            v-tooltip.bottom="'Quitado'"
          />
        </template>
        <template #body="{ data }">
          <i v-if="data.status === 'Quitado'" class="pi pi-check text-green-600" />
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
      <template #empty>Nenhum empréstimo encontrado.</template>
    </DataTable>

    <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
    <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

    <LoanFormDialog
      :visible="dialog.visible"
      :mode="dialog.mode"
      :loan-id="dialog.loanId"
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
import Checkbox from 'primevue/checkbox';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useLoans, type Loan, type LoanFormPayload } from '../composables/useLoans';
import { useIsMobile } from '../composables/useIsMobile';
import { formatCurrency, formatNumber, formatShortDate } from '../lib/dateUtils';
import LoanFormDialog from './loans/LoanFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { isMobile } = useIsMobile();

const { rows, loading, selected, listPaid, fetchAll, create, update, remove, pay } = useLoans();

const dialog = reactive<{
  visible: boolean;
  mode: 'new' | 'edit' | 'clone';
  loanId: string | null;
}>({
  visible: false,
  mode: 'new',
  loanId: null,
});

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<Loan | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => openLoan('edit', row._id),
    },
    {
      label: 'Excluir',
      icon: 'pi pi-trash',
      command: () => confirmDeleteFor(row._id),
    },
    {
      label: 'Clonar',
      icon: 'pi pi-clone',
      command: () => openLoan('clone', row._id),
    },
    {
      label: 'Quitar',
      icon: 'pi pi-dollar',
      visible: row.status === 'Em aberto',
      command: () => confirmPayFor(row._id),
    },
  ];
});

const amountTotal = computed(() => rows.value.reduce((acc, r) => acc + (r.amount ?? 0), 0));

onMounted(() => {
  fetchAll().catch((err) => onLoadError(extractStatus(err)));
});

function openLoan(mode: 'new' | 'edit' | 'clone', id: string | null) {
  if ((mode === 'edit' || mode === 'clone') && !id) return;
  dialog.mode = mode;
  dialog.loanId = id;
  dialog.visible = true;
}

function openRowMenu(e: MouseEvent, row: Loan) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: Loan }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
}

function closeDialog() {
  dialog.visible = false;
}

async function onDialogSubmit(payload: LoanFormPayload, mode: 'new' | 'edit' | 'clone') {
  closeDialog();
  try {
    if (mode === 'edit') {
      await update(payload);
      toast.add({ severity: 'success', summary: 'Empréstimo editado com sucesso!', life: 4000 });
    } else {
      await create(payload);
      toast.add({ severity: 'success', summary: 'Empréstimo adicionado com sucesso!', life: 4000 });
    }
    await fetchAll();
  } catch (err) {
    onSaveError(extractStatus(err));
  }
}

function confirmDeleteFor(id: string) {
  confirm.require({
    message: 'Confirma a exclusão do empréstimo?',
    header: 'Excluir empréstimo',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: async () => {
      try {
        await remove(id);
        toast.add({
          severity: 'success',
          summary: 'Empréstimo excluído com sucesso!',
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
    message: 'Confirma a quitação do empréstimo?',
    header: 'Quitar empréstimo',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: async () => {
      try {
        await pay(id);
        toast.add({
          severity: 'success',
          summary: 'Empréstimo quitado com sucesso!',
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
  toast.add({ severity: 'error', summary: `Erro ao carregar os dados: ${status}`, life: 6000 });
}

function onSaveError(status: number | string) {
  toast.add({ severity: 'error', summary: `Erro ao salvar os dados: ${status}`, life: 6000 });
}

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>
