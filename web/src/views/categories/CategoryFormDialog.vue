<template>
  <Dialog
    :visible="visible"
    :header="title"
    modal
    :style="{ width: 'min(28rem, 92vw)' }"
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
      <div class="flex flex-col gap-1">
        <label for="categoryDescription" class="text-sm font-medium">{{ $t('common.fields.description') }}</label>
        <InputText
          id="categoryDescription"
          v-model="form.name"
          :invalid="submitted && !!errors.name"
          :readonly="nameReadonly"
          autofocus
          autocomplete="off"
          data-form-type="other"
          data-lpignore="true"
          @focus="nameReadonly = false"
        />
        <small v-if="submitted && errors.name" class="text-red-600">{{ errors.name }}</small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="categoryType" class="text-sm font-medium">{{ $t('common.fields.type') }}</label>
        <Select
          id="categoryType"
          v-model="form.type"
          :options="categoryTypes"
          option-label="label"
          option-value="value"
          :invalid="submitted && !!errors.type"
          :placeholder="$t('common.placeholders.select')"
        />
        <small v-if="submitted && errors.type" class="text-red-600">{{ errors.type }}</small>
      </div>

      <div class="flex items-center gap-2">
        <Checkbox v-model="form.enabled" inputId="categoryEnabled" binary />
        <label for="categoryEnabled" class="text-sm">{{ $t('categories.form.fields.active') }}</label>
      </div>
    </form>

    <template #footer>
      <Button :label="$t('common.actions.cancel')" severity="secondary" text @click="handleClose" />
      <Button :label="$t('common.actions.confirm')" :disabled="loading" @click="handleSubmit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useI18n } from 'vue-i18n';
import type { Category, CategoryType, NewCategory } from '../../composables/useCategories';
import { useCategories } from '../../composables/useCategories';

type Mode = 'new' | 'edit';

const props = defineProps<{
  visible: boolean;
  mode: Mode;
  categoryId: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', value: Category | NewCategory, mode: Mode): void;
  (e: 'close'): void;
  (e: 'load-error', status: number | string): void;
}>();

const { t } = useI18n();

const categoryTypes = computed<{ label: string; value: CategoryType }[]>(() => [
  { label: t('enums.categoryType.Despesa'), value: 'Despesa' },
  { label: t('enums.categoryType.Receita'), value: 'Receita' },
]);

const { getById } = useCategories();
const loaded = ref<Category | null>(null);
const loading = ref(false);
const submitted = ref(false);
const nameReadonly = ref(true);
const form = reactive<{ _id?: string; name: string; type: CategoryType | null; enabled: boolean }>({
  _id: undefined,
  name: '',
  type: null,
  enabled: true,
});

const title = computed(() =>
  props.mode === 'new' ? t('categories.form.addTitle') : t('categories.form.editTitle'),
);

const errors = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {};
  const name = form.name?.trim() ?? '';
  if (!name) out.name = t('common.errors.requiredField', { field: t('common.fields.description') });
  else if (name.length < 3) out.name = t('common.errors.minLength', { field: t('common.fields.description'), min: 3 });
  else if (name.length > 100) out.name = t('common.errors.maxLength', { field: t('common.fields.description'), max: 100 });
  if (!form.type) out.type = t('common.errors.requiredField', { field: t('common.fields.type') });
  return out;
});

watch(
  () => [props.visible, props.mode, props.categoryId] as const,
  async ([visible, mode, id]) => {
    if (!visible) return;
    submitted.value = false;
    nameReadonly.value = true;
    if (mode === 'new') {
      loaded.value = null;
      form._id = undefined;
      form.name = '';
      form.type = null;
      form.enabled = true;
      loading.value = false;
      return;
    }
    if (id) {
      loading.value = true;
      try {
        const category = await getById(id);
        loaded.value = category;
        form._id = category._id;
        form.name = category.name;
        form.type = category.type;
        form.enabled = category.enabled;
      } catch (err: unknown) {
        const status = extractStatus(err);
        emit('load-error', status);
        emit('close');
      } finally {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);

function handleSubmit() {
  if (Object.keys(errors.value).length > 0) {
    submitted.value = true;
    return;
  }
  const overrides = {
    name: form.name.trim(),
    type: form.type as CategoryType,
    enabled: form.enabled,
  };
  const payload =
    props.mode === 'edit' && loaded.value
      ? { ...loaded.value, ...overrides }
      : (overrides as NewCategory);
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
