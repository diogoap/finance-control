<template>
  <Card>
    <template #content>
      <table class="w-full text-sm">
        <tbody>
          <tr>
            <td class="py-1 text-left">(+) Saldo anterior:</td>
            <td class="py-1 text-right tabular-nums">
              {{ formatNumber(bucket.previousBalance) }}
            </td>
          </tr>
          <tr>
            <td class="py-1 text-left">(+) Receitas:</td>
            <td class="py-1 text-right tabular-nums">
              {{ formatNumber(bucket.totalIncomes) }}
            </td>
          </tr>
          <tr>
            <td class="py-1 text-left">(-) Despesas:</td>
            <td class="py-1 text-right tabular-nums">
              {{ formatNumber(bucket.totalExpenses * -1) }}
            </td>
          </tr>
          <tr class="border-t border-slate-200 dark:border-slate-700">
            <td class="py-1 text-left font-semibold">(=) Saldo período:</td>
            <td class="py-1 text-right font-semibold tabular-nums" :class="valueClass(bucket.partialBalance)">
              {{ formatNumber(bucket.partialBalance) }}
            </td>
          </tr>
          <tr>
            <td class="py-1 text-left">(+) Empréstimos:</td>
            <td class="py-1 text-right tabular-nums">
              {{ formatNumber(bucket.totalLoans) }}
            </td>
          </tr>
          <tr class="border-t border-slate-200 dark:border-slate-700">
            <td class="py-1 text-left font-semibold">(=) Saldo final:</td>
            <td class="py-1 text-right font-semibold tabular-nums" :class="valueClass(bucket.actualBalance)">
              {{ formatNumber(bucket.actualBalance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import { formatNumber } from '../../lib/dateUtils';
import type { TotalsBucket } from '../../composables/useTotals';

defineProps<{ bucket: Pick<TotalsBucket, 'previousBalance' | 'totalIncomes' | 'totalExpenses' | 'partialBalance' | 'totalLoans' | 'actualBalance'> }>();

function valueClass(value: number): string {
  if (value < 0) return 'text-red-600 dark:text-red-400';
  if (value === 0) return '';
  return 'text-green-600 dark:text-green-400';
}
</script>
