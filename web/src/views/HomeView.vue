<template>
  <div class="container mx-auto px-4 py-4">
    <Toolbar class="mb-3">
      <template #start>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.beginYear')"
            label="<<"
            @click="navigate('beginYear')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.prevMonth')"
            :label="$t('home.navigation.prevMonthLabel')"
            @click="navigate('prev')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.currentMonth')"
            :label="$t('home.navigation.currentMonthLabel')"
            @click="navigate('actual')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.nextMonth')"
            :label="$t('home.navigation.nextMonthLabel')"
            @click="navigate('next')"
          />
          <Button
            size="small"
            severity="success"
            v-tooltip.bottom="$t('home.navigation.endYear')"
            label=">>"
            @click="navigate('endYear')"
          />
        </div>
      </template>

      <template #end>
        <div class="hidden md:flex flex-wrap items-center gap-2">
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
          <Button :label="$t('home.filter')" size="small" severity="secondary" @click="fetchAll" />
        </div>
      </template>
    </Toolbar>

    <section class="mb-4">
      <h2 class="text-sm font-semibold mb-2">{{ $t('home.forecasts') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <TotalsSummary :bucket="allBucket" />
        <AccountsBox :accounts="allBucket.accounts" />
        <CategoryBox
          :title="$t('home.categoryBox.incomes')"
          severity="success"
          :categories="allBucket.categories"
          type="Receita"
          storage-key="home.categoryBox.view.forecasts.incomes"
        />
        <CategoryBox
          :title="$t('home.categoryBox.expenses')"
          severity="danger"
          :categories="allBucket.categories"
          type="Despesa"
          storage-key="home.categoryBox.view.forecasts.expenses"
        />
      </div>
    </section>

    <section>
      <h2 class="text-sm font-semibold mb-2">{{ $t('home.cashbox') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <TotalsSummary :bucket="completedBucket" />
        <AccountsBox :accounts="completedBucket.accounts" />
        <CategoryBox
          :title="$t('home.categoryBox.incomes')"
          severity="success"
          :categories="completedBucket.categories"
          type="Receita"
          storage-key="home.categoryBox.view.cashbox.incomes"
        />
        <CategoryBox
          :title="$t('home.categoryBox.expenses')"
          severity="danger"
          :categories="completedBucket.categories"
          type="Despesa"
          storage-key="home.categoryBox.view.cashbox.expenses"
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
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();
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
      summary: t('common.errors.loadingFailed', { status: extractStatus(err) }),
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
