<template>
  <Card :class="cardClass">
    <template #title>
      <span class="text-base">{{ title }}</span>
    </template>
    <template #content>
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
      <p v-else class="text-sm text-slate-500">Nenhum lançamento no período.</p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import { formatNumber } from '../../lib/dateUtils';
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

const cardClass = computed(() =>
  props.severity === 'success'
    ? 'border-l-4 border-l-green-500'
    : 'border-l-4 border-l-red-500',
);
</script>
