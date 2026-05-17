<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-xl font-semibold mb-4">{{ $t('accounts.title') }}</h1>

    <Toolbar class="mb-4">
      <template #start>
        <div class="flex gap-2 flex-wrap">
          <Button
            icon="pi pi-plus"
            severity="primary"
            size="small"
            :aria-label="$t('accounts.tooltips.add')"
            v-tooltip.bottom="$t('accounts.tooltips.add')"
            @click="openNew"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :aria-label="$t('accounts.tooltips.edit')"
            :disabled="!selected"
            v-tooltip.bottom="$t('accounts.tooltips.edit')"
            @click="selected && openEditFor(selected._id)"
          />
          <Button
            v-if="selected?.enabled === true"
            class="hidden md:inline-flex"
            icon="pi pi-times"
            severity="primary"
            size="small"
            :aria-label="$t('accounts.tooltips.deactivate')"
            v-tooltip.bottom="$t('accounts.tooltips.deactivate')"
            @click="confirmToggleFor(selected._id, false)"
          />
          <Button
            v-if="selected?.enabled === false"
            class="hidden md:inline-flex"
            icon="pi pi-check"
            severity="primary"
            size="small"
            :aria-label="$t('accounts.tooltips.activate')"
            v-tooltip.bottom="$t('accounts.tooltips.activate')"
            @click="confirmToggleFor(selected._id, true)"
          />
          <InputText
            v-model="searchTerm"
            size="small"
            class="!w-40 md:!w-56"
            :placeholder="$t('accounts.searchPlaceholder')"
            :aria-label="$t('accounts.searchPlaceholder')"
          />
        </div>
      </template>

      <template #end>
        <label class="flex items-center gap-2 text-sm">
          <Checkbox v-model="listDisabled" binary @change="fetchAll" />
          {{ $t('accounts.options.listInactive') }}
        </label>
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
      <template #footer>{{ $t('common.records', { count: filteredRows.length }) }}</template>
      <Column field="name" :header="$t('accounts.headers.name')" sortable />
      <Column
        field="initialBalance"
        :header="$t('accounts.headers.initialBalance')"
        sortable
        style="width: 8rem"
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
        :header="$t('accounts.headers.order')"
        sortable
        style="width: 6rem"
        class="text-center hidden md:table-cell"
        header-class="hidden md:table-cell"
      />
      <Column :header="$t('accounts.headers.active')" style="width: 5rem" class="text-center">
        <template #body="{ data }">
          <i
            :class="data.enabled ? 'pi pi-check text-green-600' : 'pi pi-times text-red-600'"
            :aria-label="data.enabled ? $t('accounts.activeLabel') : $t('accounts.inactiveLabel')"
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
            :aria-label="$t('accounts.headers.actions')"
            aria-haspopup="menu"
            @click.stop="openRowMenu($event, data)"
          />
        </template>
      </Column>
      <template #empty>{{ $t('accounts.table.empty') }}</template>
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
import InputText from 'primevue/inputtext';
import Toolbar from 'primevue/toolbar';
import Checkbox from 'primevue/checkbox';
import Menu from 'primevue/menu';
import ContextMenu from 'primevue/contextmenu';
import type { MenuItem } from 'primevue/menuitem';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import { useAccounts, type Account, type NewAccount } from '../composables/useAccounts';
import { useReferenceData } from '../composables/useReferenceData';
import { useIsMobile } from '../composables/useIsMobile';
import { pageSize } from '../composables/usePagination';
import { useSearchFilter } from '../composables/useSearchFilter';
import { formatCurrency } from '../lib/dateUtils';
import AccountFormDialog from './accounts/AccountFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();
const { isMobile } = useIsMobile();

const { rows, loading, selected, listDisabled, fetchAll, create, update, toggleEnabled } =
  useAccounts();
const { invalidate } = useReferenceData();

const { searchTerm, filteredRows } = useSearchFilter(rows);

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
      label: t('accounts.menu.edit'),
      icon: 'pi pi-pencil',
      command: () => openEditFor(row._id),
    },
    {
      label: row.enabled ? t('accounts.menu.deactivate') : t('accounts.menu.activate'),
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
      toast.add({ severity: 'success', summary: t('accounts.success.added'), life: 4000 });
    } else {
      await update(payload as Account);
      toast.add({ severity: 'success', summary: t('accounts.success.edited'), life: 4000 });
    }
    invalidate('accounts');
    await fetchAll();
  } catch (err) {
    onSaveError(extractStatus(err));
  }
}

function confirmToggleFor(id: string, enable: boolean) {
  confirm.require({
    message: enable ? t('accounts.confirm.activateMessage') : t('accounts.confirm.deactivateMessage'),
    header: enable ? t('accounts.confirm.activateHeader') : t('accounts.confirm.deactivateHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await toggleEnabled(id, enable);
        toast.add({
          severity: 'success',
          summary: enable ? t('accounts.success.activated') : t('accounts.success.deactivated'),
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
  toast.add({ severity: 'error', summary: t('common.errors.loadingFailed', { status }), life: 6000 });
}

function onSaveError(status: number | string) {
  toast.add({ severity: 'error', summary: t('common.errors.savingFailed', { status }), life: 6000 });
}

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>
