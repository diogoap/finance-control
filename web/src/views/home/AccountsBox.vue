<template>
  <Card>
    <template #title>
      <span class="text-base">Contas</span>
    </template>
    <template #content>
      <table v-if="enabledAccounts.length" class="w-full text-sm">
        <tbody>
          <tr v-for="account in enabledAccounts" :key="account._id">
            <td class="py-0.5 text-left">{{ account.name }}:</td>
            <td class="py-0.5 text-right tabular-nums">
              {{ formatNumber(account.actualBalance) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-sm text-slate-500">Nenhuma conta encontrada.</p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import { formatNumber } from '../../lib/dateUtils';
import type { AccountTotal } from '../../composables/useTotals';

const props = defineProps<{ accounts: AccountTotal[] }>();

const enabledAccounts = computed(() => props.accounts.filter((a) => a.enabled));
</script>
