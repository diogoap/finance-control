<template>
  <Panel
    class="home-box"
    :toggleable="isMobile"
    v-model:collapsed="collapsed"
  >
    <template #header>
      <span class="text-sm font-semibold">Contas</span>
    </template>
    <table v-if="enabledAccounts.length" class="w-full text-xs">
      <tbody>
        <tr v-for="account in enabledAccounts" :key="account._id">
          <td class="py-0.5 text-left">{{ account.name }}:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(account.actualBalance) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-xs text-slate-500">Nenhuma conta encontrada.</p>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Panel from 'primevue/panel';
import { formatNumber } from '../../lib/dateUtils';
import { useIsMobile } from '../../composables/useIsMobile';
import type { AccountTotal } from '../../composables/useTotals';

const props = defineProps<{ accounts: AccountTotal[] }>();

const enabledAccounts = computed(() => props.accounts.filter((a) => a.enabled));

const { isMobile } = useIsMobile();
const collapsed = ref(isMobile.value);

watch(isMobile, (mobile) => {
  collapsed.value = mobile;
});
</script>
