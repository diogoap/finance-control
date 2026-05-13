<template>
  <Panel
    :class="['home-box', borderClass]"
    :toggleable="isMobile"
    v-model:collapsed="collapsed"
    :pt="{
      header: {
        onClick: onHeaderClick,
        class: ['home-box-header', headerBgClass, isMobile ? 'cursor-pointer' : ''],
      },
    }"
  >
    <template #header>
      <span class="text-sm font-semibold flex items-center gap-1.5">
        <i :class="['pi', iconClass, 'home-icon']" aria-hidden="true"></i>
        {{ title }}
      </span>
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

const headerBgClass = computed(() =>
  props.severity === 'success'
    ? 'bg-green-50 dark:bg-green-900/20'
    : 'bg-red-50 dark:bg-red-900/20',
);

const iconClass = computed(() =>
  props.severity === 'success' ? 'pi-arrow-up' : 'pi-arrow-down',
);

const { isMobile } = useIsMobile();
const collapsed = ref(isMobile.value);

watch(isMobile, (mobile) => {
  collapsed.value = mobile;
});

function onHeaderClick(event: MouseEvent) {
  if (!isMobile.value) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest('button')) return;
  collapsed.value = !collapsed.value;
}
</script>
