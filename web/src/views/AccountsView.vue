<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-xl font-semibold mb-4">Cadastro de contas</h1>

    <Toolbar class="mb-4">
      <template #start>
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            severity="primary"
            size="small"
            aria-label="Adicionar"
            v-tooltip.bottom="'Adicionar'"
            @click="openNew"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            aria-label="Editar"
            :disabled="!selected"
            v-tooltip.bottom="'Editar'"
            @click="selected && openEditFor(selected._id)"
          />
          <Button
            v-if="selected?.enabled === true"
            class="hidden md:inline-flex"
            icon="pi pi-times"
            severity="primary"
            size="small"
            aria-label="Inativar"
            v-tooltip.bottom="'Inativar'"
            @click="confirmToggleFor(selected._id, false)"
          />
          <Button
            v-if="selected?.enabled === false"
            class="hidden md:inline-flex"
            icon="pi pi-check"
            severity="primary"
            size="small"
            aria-label="Ativar"
            v-tooltip.bottom="'Ativar'"
            @click="confirmToggleFor(selected._id, true)"
          />
        </div>
      </template>

      <template #end>
        <label class="flex items-center gap-2 text-sm">
          <Checkbox v-model="listDisabled" binary @change="fetchAll" />
          Listar contas inativas?
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
      <template #footer>{{ rows.length }} registros</template>
      <Column field="name" header="Nome" sortable />
      <Column
        field="initialBalance"
        header="Saldo inicial"
        sortable
        style="width: 11rem"
        header-class="header-end"
      >
        <template #body="{ data }">
          <span class="block text-right">{{
            formatCurrency(data.initialBalance, data._currency?.currencyCode)
          }}</span>
        </template>
      </Column>
      <Column
        field="order"
        header="Ordem"
        sortable
        style="width: 6rem"
        class="text-center hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column header="Ativa?" style="width: 6rem" class="text-center">
        <template #body="{ data }">
          <i
            :class="data.enabled ? 'pi pi-check text-green-600' : 'pi pi-times text-red-600'"
            :aria-label="data.enabled ? 'Ativa' : 'Inativa'"
          />
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
      <template #empty>Nenhuma conta encontrada.</template>
    </DataTable>

    <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
    <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

    <AccountFormDialog
      :visible="dialog.visible"
      :mode="dialog.mode"
      :account-id="dialog.accountId"
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
import { useAccounts, type Account, type NewAccount } from '../composables/useAccounts';
import { useReferenceData } from '../composables/useReferenceData';
import { useIsMobile } from '../composables/useIsMobile';
import { formatCurrency } from '../lib/dateUtils';
import AccountFormDialog from './accounts/AccountFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { isMobile } = useIsMobile();

const { rows, loading, selected, listDisabled, fetchAll, create, update, toggleEnabled } =
  useAccounts();
const { invalidate } = useReferenceData();

const dialog = reactive<{ visible: boolean; mode: 'new' | 'edit'; accountId: string | null }>({
  visible: false,
  mode: 'new',
  accountId: null,
});

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<Account | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => openEditFor(row._id),
    },
    {
      label: row.enabled ? 'Inativar' : 'Ativar',
      icon: row.enabled ? 'pi pi-times' : 'pi pi-check',
      command: () => confirmToggleFor(row._id, !row.enabled),
    },
  ];
});

onMounted(() => {
  fetchAll().catch((err) => onLoadError(extractStatus(err)));
});

function openNew() {
  dialog.mode = 'new';
  dialog.accountId = null;
  dialog.visible = true;
}

function openEditFor(id: string) {
  dialog.mode = 'edit';
  dialog.accountId = id;
  dialog.visible = true;
}

function openRowMenu(e: MouseEvent, row: Account) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: Account }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
}

function closeDialog() {
  dialog.visible = false;
}

async function onDialogSubmit(payload: Account | NewAccount, mode: 'new' | 'edit') {
  closeDialog();
  try {
    if (mode === 'new') {
      await create(payload as NewAccount);
      toast.add({ severity: 'success', summary: 'Conta adicionada com sucesso!', life: 4000 });
    } else {
      await update(payload as Account);
      toast.add({ severity: 'success', summary: 'Conta editada com sucesso!', life: 4000 });
    }
    invalidate('accounts');
    await fetchAll();
  } catch (err) {
    onSaveError(extractStatus(err));
  }
}

function confirmToggleFor(id: string, enable: boolean) {
  confirm.require({
    message: enable ? 'Confirma a ativação da conta?' : 'Confirma a inativação da conta?',
    header: enable ? 'Ativar conta' : 'Inativar conta',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Confirmar' },
    accept: async () => {
      try {
        await toggleEnabled(id, enable);
        toast.add({
          severity: 'success',
          summary: enable ? 'Conta ativada com sucesso!' : 'Conta inativada com sucesso!',
          life: 4000,
        });
        invalidate('accounts');
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
