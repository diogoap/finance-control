<template>
  <Panel
    class="home-box"
    :toggleable="false"
    :pt="{ header: { class: 'home-box-header' } }"
  >
    <template #header>
      <span class="text-sm font-semibold flex items-center gap-1.5">
        <i class="pi pi-dollar home-icon" aria-hidden="true"></i>
        Totais
      </span>
    </template>
    <table class="w-full text-xs">
      <tbody>
        <tr>
          <td class="py-0.5 text-left">(+) Saldo anterior:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(bucket.previousBalance) }}
          </td>
        </tr>
        <tr>
          <td class="py-0.5 text-left">(+) Receitas:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(bucket.totalIncomes) }}
          </td>
        </tr>
        <tr>
          <td class="py-0.5 text-left">(-) Despesas:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(bucket.totalExpenses * -1) }}
          </td>
        </tr>
        <tr class="border-t border-slate-200 dark:border-slate-700">
          <td class="py-1 text-left text-sm font-semibold">(=) Saldo período:</td>
          <td
            class="py-1 text-right text-sm font-semibold tabular-nums"
            :class="valueClass(bucket.partialBalance)"
          >
            {{ formatNumber(bucket.partialBalance) }}
          </td>
        </tr>
        <tr>
          <td class="py-0.5 text-left">(+) Empréstimos:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(bucket.totalLoans) }}
          </td>
        </tr>
        <tr class="border-t border-slate-200 dark:border-slate-700">
          <td class="py-1 text-left text-sm font-semibold">(=) Saldo final:</td>
          <td
            class="py-1 text-right text-sm font-semibold tabular-nums"
            :class="valueClass(bucket.actualBalance)"
          >
            {{ formatNumber(bucket.actualBalance) }}
          </td>
        </tr>
      </tbody>
    </table>
  </Panel>
</template>

<script setup lang="ts">
import Panel from 'primevue/panel';
import { formatNumber } from '../../lib/dateUtils';
import type { TotalsBucket } from '../../composables/useTotals';

defineProps<{ bucket: Pick<TotalsBucket, 'previousBalance' | 'totalIncomes' | 'totalExpenses' | 'partialBalance' | 'totalLoans' | 'actualBalance'> }>();

function valueClass(value: number): string {
  if (value < 0) return 'text-red-600 dark:text-red-400';
  if (value === 0) return '';
  return 'text-green-600 dark:text-green-400';
}
</script>
