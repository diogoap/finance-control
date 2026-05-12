<template>
  <div class="container mx-auto px-4 py-6">
    <Toolbar class="mb-4">
      <template #start>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o início do ano'"
            label="<<"
            @click="navigate('beginYear')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o mês anterior'"
            label="-1 Mês"
            @click="navigate('prev')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o mês atual'"
            label="Atual"
            @click="navigate('actual')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o próximo mês'"
            label="+1 Mês"
            @click="navigate('next')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="'Ir para o fim do ano'"
            label=">>"
            @click="navigate('endYear')"
          />
        </div>
      </template>

      <template #end>
        <div class="flex flex-wrap items-center gap-2">
          <DatePicker
            v-model="dateBegin"
            date-format="dd/mm/yy"
            show-icon
            input-class="!w-32"
          />
          <DatePicker
            v-model="dateEnd"
            date-format="dd/mm/yy"
            show-icon
            input-class="!w-32"
          />
          <Button label="Filtrar" size="small" severity="secondary" @click="fetchAll" />
        </div>
      </template>
    </Toolbar>

    <section class="mb-6">
      <h2 class="text-base font-semibold mb-3">Previsões - Todos os lançamentos</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <TotalsSummary :bucket="allBucket" />
        <AccountsBox :accounts="allBucket.accounts" />
        <CategoryBox
          title="Receitas"
          severity="success"
          :categories="allBucket.categories"
          type="Receita"
        />
        <CategoryBox
          title="Despesas"
          severity="danger"
          :categories="allBucket.categories"
          type="Despesa"
        />
      </div>
    </section>

    <section>
      <h2 class="text-base font-semibold mb-3">Caixa - Lançamentos realizados</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <TotalsSummary :bucket="completedBucket" />
        <AccountsBox :accounts="completedBucket.accounts" />
        <CategoryBox
          title="Receitas"
          severity="success"
          :categories="completedBucket.categories"
          type="Receita"
        />
        <CategoryBox
          title="Despesas"
          severity="danger"
          :categories="completedBucket.categories"
          type="Despesa"
        />
      </div>
    </section>

    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 pointer-events-none"
    >
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { useTotals, emptyBucket } from '../composables/useTotals';
import {
  getActualMonth,
  getBeginOfYear,
  getEndOfYear,
  getNextMonth,
  getPreviousMonth,
} from '../lib/dateUtils';
import TotalsSummary from './home/TotalsSummary.vue';
import AccountsBox from './home/AccountsBox.vue';
import CategoryBox from './home/CategoryBox.vue';

const toast = useToast();
const { totals, loading, fetchAll: fetchTotals } = useTotals();

const { begin: initialBegin, end: initialEnd } = getActualMonth();
const dateBegin = ref<Date | null>(initialBegin);
const dateEnd = ref<Date | null>(initialEnd);

const allBucket = computed(() => totals.value?.current.all ?? emptyBucket());
const completedBucket = computed(() => totals.value?.current.completed ?? emptyBucket());

onMounted(fetchAll);

async function fetchAll() {
  if (!dateBegin.value || !dateEnd.value) return;
  try {
    await fetchTotals(dateBegin.value, dateEnd.value);
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: `Erro ao carregar os dados: ${extractStatus(err)}`,
      life: 6000,
    });
  }
}

function navigate(target: 'beginYear' | 'prev' | 'actual' | 'next' | 'endYear') {
  const base = dateBegin.value ?? new Date();
  let range;
  switch (target) {
    case 'beginYear':
      range = getBeginOfYear(base);
      break;
    case 'prev':
      range = getPreviousMonth(base);
      break;
    case 'actual':
      range = getActualMonth();
      break;
    case 'next':
      range = getNextMonth(base);
      break;
    case 'endYear':
      range = getEndOfYear(base);
      break;
  }
  dateBegin.value = range.begin;
  dateEnd.value = range.end;
  fetchAll();
}

function extractStatus(err: unknown): number | string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { status?: number } }).response;
    return r?.status ?? 'erro';
  }
  return 'erro';
}
</script>
