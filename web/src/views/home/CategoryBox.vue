<template>
  <Panel
    :class="['home-box', borderClass]"
    :toggleable="isMobile"
    v-model:collapsed="collapsed"
  >
    <template #header>
      <span class="text-sm font-semibold">{{ title }}</span>
    </template>
    <table v-if="filtered.length" class="w-full text-xs">
      <tbody>
        <tr v-for="category in filtered" :key="category._id">
          <td class="py-0.5 text-left">{{ category.name }}:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(category.totalAmount) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-xs text-slate-500">Nenhum lançamento no período.</p>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Panel from 'primevue/panel';
import { formatNumber } from '../../lib/dateUtils';
import { useIsMobile } from '../../composables/useIsMobile';
import type { CategoryTotal } from '../../composables/useTotals';

const props = defineProps<{
  title: string;
  severity: 'success' | 'danger';
  categories: CategoryTotal[];
  type: 'Receita' | 'Despesa';
}>();

const filtered = computed(() =>
  props.categories.filter(
    (c) => c.type === props.type && c.enabled && c.totalAmount > 0,
  ),
);

const borderClass = computed(() =>
  props.severity === 'success'
    ? 'border-l-4 border-l-green-500'
    : 'border-l-4 border-l-red-500',
);

const { isMobile } = useIsMobile();
const collapsed = ref(isMobile.value);

watch(isMobile, (mobile) => {
  collapsed.value = mobile;
});
</script>
