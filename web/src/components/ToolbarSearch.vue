<template>
  <!-- >=480px: always-visible input -->
  <InputText
    v-if="!isNarrow"
    :model-value="modelValue"
    size="small"
    class="!w-40 md:!w-56"
    :placeholder="placeholder"
    :aria-label="placeholder"
    @update:model-value="emitValue"
  />

  <!-- <480px: collapsed icon, expanded input + close button -->
  <template v-else>
    <Button
      v-if="!expanded"
      icon="pi pi-search"
      size="small"
      :aria-label="placeholder"
      v-tooltip.bottom="placeholder"
      @click="expand"
    />
    <div v-else class="flex items-center gap-1">
      <InputText
        ref="inputRef"
        :model-value="modelValue"
        size="small"
        class="!w-40"
        :placeholder="placeholder"
        :aria-label="placeholder"
        @update:model-value="emitValue"
        @keydown.esc="collapse"
      />
      <Button
        icon="pi pi-times"
        size="small"
        text
        rounded
        :aria-label="$t('common.actions.close')"
        @click="collapse"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useIsMobile } from '../composables/useIsMobile';

defineProps<{
  modelValue: string;
  placeholder: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const { isMobile: isNarrow } = useIsMobile('(max-width: 479.98px)');
const expanded = ref(false);
const inputRef = ref<InstanceType<typeof InputText> | null>(null);

watch(isNarrow, (narrow) => {
  if (!narrow) expanded.value = false;
});

function emitValue(value: string | undefined) {
  emit('update:modelValue', value ?? '');
}

async function expand() {
  expanded.value = true;
  await nextTick();
  const el = (inputRef.value as unknown as { $el?: HTMLElement } | null)?.$el as
    | HTMLInputElement
    | undefined;
  el?.focus();
}

function collapse() {
  emit('update:modelValue', '');
  expanded.value = false;
}
</script>
