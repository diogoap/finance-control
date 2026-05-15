<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-xl font-semibold mb-4">{{ $t('categories.title') }}</h1>

    <Toolbar class="mb-4">
      <template #start>
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            severity="primary"
            size="small"
            :aria-label="$t('categories.tooltips.add')"
            v-tooltip.bottom="$t('categories.tooltips.add')"
            @click="openNew"
          />
          <Button
            class="hidden md:inline-flex"
            icon="pi pi-pencil"
            severity="primary"
            size="small"
            :aria-label="$t('categories.tooltips.edit')"
            :disabled="!selected"
            v-tooltip.bottom="$t('categories.tooltips.edit')"
            @click="selected && openEditFor(selected._id)"
          />
          <Button
            v-if="selected?.enabled === true"
            class="hidden md:inline-flex"
            icon="pi pi-times"
            severity="primary"
            size="small"
            :aria-label="$t('categories.tooltips.deactivate')"
            v-tooltip.bottom="$t('categories.tooltips.deactivate')"
            @click="confirmToggleFor(selected._id, false)"
          />
          <Button
            v-if="selected?.enabled === false"
            class="hidden md:inline-flex"
            icon="pi pi-check"
            severity="primary"
            size="small"
            :aria-label="$t('categories.tooltips.activate')"
            v-tooltip.bottom="$t('categories.tooltips.activate')"
            @click="confirmToggleFor(selected._id, true)"
          />
        </div>
      </template>

      <template #end>
        <label class="flex items-center gap-2 text-sm">
          <Checkbox v-model="listDisabled" binary @change="fetchAll" />
          {{ $t('categories.options.listInactive') }}
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
      :paginator="rows.length > pageSize"
      :rows="pageSize"
      class="p-datatable-sm"
      @row-contextmenu="onRowContext"
    >
      <template #footer>{{ $t('common.records', { count: rows.length }) }}</template>
      <Column field="name" :header="$t('categories.headers.description')" sortable />
      <Column field="type" :header="$t('categories.headers.type')" sortable style="width: 7rem">
        <template #body="{ data }">{{ $t('enums.categoryType.' + data.type) }}</template>
      </Column>
      <Column :header="$t('categories.headers.active')" style="width: 5rem" class="text-center">
        <template #body="{ data }">
          <i
            :class="data.enabled ? 'pi pi-check text-green-600' : 'pi pi-times text-red-600'"
            :aria-label="data.enabled ? $t('categories.activeLabel') : $t('categories.inactiveLabel')"
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
            :aria-label="$t('categories.headers.actions')"
            aria-haspopup="menu"
            @click.stop="openRowMenu($event, data)"
          />
        </template>
      </Column>
      <template #empty>{{ $t('categories.table.empty') }}</template>
    </DataTable>

    <Menu ref="rowMenu" :model="rowMenuItems" :popup="true" append-to="body" />
    <ContextMenu v-if="!isMobile" ref="ctxMenu" :model="rowMenuItems" append-to="body" />

    <CategoryFormDialog
      :visible="dialog.visible"
      :mode="dialog.mode"
      :category-id="dialog.categoryId"
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
import { useI18n } from 'vue-i18n';
import { useCategories, type Category, type NewCategory } from '../composables/useCategories';
import { useIsMobile } from '../composables/useIsMobile';
import { pageSize } from '../composables/usePagination';
import CategoryFormDialog from './categories/CategoryFormDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();
const { isMobile } = useIsMobile();

const { rows, loading, selected, listDisabled, fetchAll, create, update, toggleEnabled } =
  useCategories();

const dialog = reactive<{ visible: boolean; mode: 'new' | 'edit'; categoryId: string | null }>({
  visible: false,
  mode: 'new',
  categoryId: null,
});

const rowMenu = ref();
const ctxMenu = ref();
const rowMenuTarget = ref<Category | null>(null);
const rowMenuItems = computed<MenuItem[]>(() => {
  const row = rowMenuTarget.value;
  if (!row) return [];
  return [
    {
      label: t('categories.menu.edit'),
      icon: 'pi pi-pencil',
      command: () => openEditFor(row._id),
    },
    {
      label: row.enabled ? t('categories.menu.deactivate') : t('categories.menu.activate'),
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
  dialog.categoryId = null;
  dialog.visible = true;
}

function openEditFor(id: string) {
  dialog.mode = 'edit';
  dialog.categoryId = id;
  dialog.visible = true;
}

function openRowMenu(e: MouseEvent, row: Category) {
  rowMenuTarget.value = row;
  rowMenu.value?.toggle(e);
}

function onRowContext(e: { originalEvent: Event; data: Category }) {
  rowMenuTarget.value = e.data;
  ctxMenu.value?.show(e.originalEvent);
}

function closeDialog() {
  dialog.visible = false;
}

async function onDialogSubmit(payload: Category | NewCategory, mode: 'new' | 'edit') {
  closeDialog();
  try {
    if (mode === 'new') {
      await create(payload as NewCategory);
      toast.add({
        severity: 'success',
        summary: t('categories.success.added'),
        life: 4000,
      });
    } else {
      await update(payload as Category);
      toast.add({ severity: 'success', summary: t('categories.success.edited'), life: 4000 });
    }
    await fetchAll();
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.errors.savingFailed', { status: extractStatus(err) }),
      life: 6000,
    });
  }
}

function confirmToggleFor(id: string, enable: boolean) {
  confirm.require({
    message: enable
      ? t('categories.confirm.activateMessage')
      : t('categories.confirm.deactivateMessage'),
    header: enable ? t('categories.confirm.activateHeader') : t('categories.confirm.deactivateHeader'),
    rejectProps: { label: t('common.actions.cancel'), severity: 'secondary', text: true },
    acceptProps: { label: t('common.actions.confirm') },
    accept: async () => {
      try {
        await toggleEnabled(id, enable);
        toast.add({
          severity: 'success',
          summary: enable
            ? t('categories.success.activated')
            : t('categories.success.deactivated'),
          life: 4000,
        });
        await fetchAll();
      } catch (err) {
        toast.add({
          severity: 'error',
          summary: t('common.errors.savingFailed', { status: extractStatus(err) }),
          life: 6000,
        });
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

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>
