<template>
  <Panel
    class="home-box"
    :toggleable="isMobile"
    v-model:collapsed="collapsed"
    :pt="{
      header: {
        onClick: onHeaderClick,
        class: ['home-box-header', isMobile ? 'cursor-pointer' : ''],
      },
    }"
  >
    <template #header>
      <span class="text-sm font-semibold flex items-center gap-1.5">
        <i class="pi pi-wallet home-icon" aria-hidden="true"></i>
        {{ $t('home.accountsBox.title') }}
      </span>
    </template>
    <table v-if="enabledAccounts.length" class="w-full text-xs">
      <tbody>
        <tr v-for="account in enabledAccounts" :key="account._id">
          <td class="py-0.5 text-left">{{ account.name }}:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatCurrency(account.actualBalance, account._currency?.currencyCode) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-xs text-slate-500">{{ $t('home.accountsBox.empty') }}</p>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Panel from 'primevue/panel';
import { formatCurrency } from '../../lib/dateUtils';
import { useIsMobile } from '../../composables/useIsMobile';
import type { AccountTotal } from '../../composables/useTotals';

const props = defineProps<{ accounts: AccountTotal[] }>();

const enabledAccounts = computed(() => props.accounts.filter((a) => a.enabled));

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
