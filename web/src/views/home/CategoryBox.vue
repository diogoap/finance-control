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
    <template #icons>
      <button
        v-if="filtered.length"
        type="button"
        class="p-panel-header-icon p-link"
        :aria-label="$t(view === 'list' ? 'home.categoryBox.viewChart' : 'home.categoryBox.viewList')"
        v-tooltip.bottom="$t(view === 'list' ? 'home.categoryBox.viewChart' : 'home.categoryBox.viewList')"
        @click.stop="toggleView"
      >
        <i :class="['pi', view === 'list' ? 'pi-chart-pie' : 'pi-list', 'home-icon']" aria-hidden="true"></i>
      </button>
    </template>
    <table v-if="filtered.length && view === 'list'" class="w-full text-xs">
      <tbody>
        <tr v-for="category in filtered" :key="category._id">
          <td class="py-0.5 text-left">{{ category.name }}:</td>
          <td class="py-0.5 text-right tabular-nums">
            {{ formatNumber(category.totalAmount) }}
          </td>
        </tr>
      </tbody>
    </table>
    <Chart
      v-else-if="filtered.length && view === 'chart'"
      type="pie"
      :data="chartData"
      :options="chartOptions"
      class="w-full"
    />
    <p v-else class="text-xs text-slate-500">{{ $t('home.categoryBox.empty') }}</p>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Panel from 'primevue/panel';
import Chart from 'primevue/chart';
import { useI18n } from 'vue-i18n';
import { formatNumber } from '../../lib/dateUtils';
import { useIsMobile } from '../../composables/useIsMobile';
import { useTheme } from '../../composables/useTheme';
import type { CategoryTotal } from '../../composables/useTotals';

const props = defineProps<{
  title: string;
  severity: 'success' | 'danger';
  categories: CategoryTotal[];
  type: 'Receita' | 'Despesa';
  storageKey: string;
}>();

const { t } = useI18n();

const filtered = computed(() =>
  props.categories
    .filter((c) => c.type === props.type && c.enabled && c.totalAmount > 0)
    .slice()
    .sort((a, b) => b.totalAmount - a.totalAmount),
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
  props.severity === 'success' ? 'pi-plus-circle' : 'pi-minus-circle',
);

const { isMobile } = useIsMobile();
const collapsed = ref(isMobile.value);
const view = ref<'list' | 'chart'>(readStoredView(props.storageKey));

watch(isMobile, (mobile) => {
  collapsed.value = mobile;
});

watch(view, (next) => {
  writeStoredView(props.storageKey, next);
});

function readStoredView(key: string): 'list' | 'chart' {
  if (typeof window === 'undefined') return 'list';
  const stored = window.localStorage.getItem(key);
  return stored === 'chart' ? 'chart' : 'list';
}

function writeStoredView(key: string, value: 'list' | 'chart') {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}

function onHeaderClick(event: MouseEvent) {
  if (!isMobile.value) return;
  const target = event.target as HTMLElement | null;
  if (target?.closest('button')) return;
  collapsed.value = !collapsed.value;
}

function toggleView() {
  view.value = view.value === 'list' ? 'chart' : 'list';
}

const PALETTE = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#a855f7', '#eab308', '#22c55e', '#f43f5e',
];

const TOP_N = 9;

const { isDark } = useTheme();

const chartSlices = computed<{ label: string; value: number }[]>(() => {
  const items = filtered.value;
  if (items.length <= TOP_N + 1) {
    return items.map((c) => ({ label: c.name, value: c.totalAmount }));
  }
  const top = items.slice(0, TOP_N).map((c) => ({ label: c.name, value: c.totalAmount }));
  const othersTotal = items.slice(TOP_N).reduce((sum, c) => sum + c.totalAmount, 0);
  return [...top, { label: t('home.categoryBox.others'), value: othersTotal }];
});

const chartData = computed(() => ({
  labels: chartSlices.value.map((s) => s.label),
  datasets: [
    {
      data: chartSlices.value.map((s) => s.value),
      backgroundColor: chartSlices.value.map((_, i) => PALETTE[i % PALETTE.length]),
      borderColor: isDark.value ? '#1e293b' : '#ffffff',
      borderWidth: 2,
    },
  ],
}));

const chartOptions = computed(() => {
  const textColor = isDark.value ? '#f1f5f9' : '#1e293b';
  return {
    responsive: true,
    maintainAspectRatio: true,
    color: textColor,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { size: 11 },
          boxWidth: 12,
          generateLabels: (chart: {
            data: { labels?: string[]; datasets: { data: number[]; backgroundColor: string[]; borderColor?: string; borderWidth?: number }[] };
          }) => {
            const labels = chart.data.labels ?? [];
            const dataset = chart.data.datasets[0];
            return labels.map((label, i) => ({
              text: `${label}: ${formatNumber(dataset.data[i])}`,
              fillStyle: dataset.backgroundColor[i],
              strokeStyle: dataset.borderColor ?? dataset.backgroundColor[i],
              lineWidth: dataset.borderWidth ?? 0,
              fontColor: textColor,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label?: string; parsed: number }) =>
            `${ctx.label ?? ''}: ${formatNumber(ctx.parsed)}`,
        },
      },
    },
  };
});
</script>
