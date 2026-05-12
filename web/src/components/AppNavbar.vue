<template>
  <Menubar :model="items" class="rounded-none border-x-0 border-t-0 px-4">
    <template #start>
      <a href="/" class="flex items-center gap-2 font-semibold text-lg no-underline text-current">
        Finance Control
      </a>
    </template>

    <template #item="{ item, props, hasSubmenu }">
      <router-link
        v-if="item.to"
        v-slot="{ href, navigate, isActive }"
        :to="item.to"
        custom
      >
        <a
          v-bind="props.action"
          :href="href"
          :class="{ 'p-menubar-item-active': isActive }"
          @click="navigate"
        >
          <span v-if="item.icon" :class="['p-menubar-item-icon', item.icon]" />
          <span class="p-menubar-item-label">{{ item.label }}</span>
        </a>
      </router-link>
      <a v-else v-bind="props.action" :href="item.url">
        <span v-if="item.icon" :class="['p-menubar-item-icon', item.icon]" />
        <span class="p-menubar-item-label">{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-angle-down ml-2" />
      </a>
    </template>

    <template #end>
      <div v-if="session.userId" class="flex items-center gap-3">
        <img
          v-if="session.photo"
          :src="session.photo"
          :alt="session.name"
          class="h-7 w-7 rounded-full"
        />
        <span class="hidden sm:inline text-sm">{{ session.name }}</span>
        <Button
          :icon="themeIcon"
          severity="secondary"
          text
          rounded
          aria-label="Tema"
          v-tooltip.bottom="themeTooltip"
          @click="toggleThemeMenu"
        />
        <Menu ref="themeMenu" :model="themeItems" :popup="true" />
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          text
          aria-label="Sair"
          @click="toggleLogoff"
        />
        <Menu ref="logoffMenu" :model="logoffItems" :popup="true" />
      </div>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import type { MenuItem } from 'primevue/menuitem';
import { getSession } from '../lib/session';
import { useTheme, type ThemeMode } from '../composables/useTheme';

const session = getSession();
const { mode: themeMode, setMode } = useTheme();

interface NavItem extends MenuItem {
  to?: string;
}

const items = ref<NavItem[]>([
  { label: 'Despesas', icon: 'pi pi-minus-circle', to: '/expenses' },
  { label: 'Receitas', icon: 'pi pi-plus-circle', to: '/incomes' },
  { label: 'Transferências', icon: 'pi pi-arrows-h', to: '/transfers' },
  { label: 'Empréstimos', icon: 'pi pi-dollar', to: '/loans' },
  { label: 'Categorias', icon: 'pi pi-list', to: '/categories' },
  { label: 'Contas', icon: 'pi pi-building', to: '/accounts' },
]);

const themeMeta: Record<ThemeMode, { label: string; icon: string }> = {
  system: { label: 'Sistema', icon: 'pi pi-desktop' },
  light: { label: 'Claro', icon: 'pi pi-sun' },
  dark: { label: 'Escuro', icon: 'pi pi-moon' },
};
const THEME_ORDER: ThemeMode[] = ['system', 'light', 'dark'];

const themeIcon = computed(() => themeMeta[themeMode.value].icon);
const themeTooltip = computed(() => `Tema: ${themeMeta[themeMode.value].label}`);

const themeMenu = ref();
const themeItems = computed<MenuItem[]>(() =>
  THEME_ORDER.map((value) => ({
    label: themeMeta[value].label,
    icon: themeMeta[value].icon,
    class: themeMode.value === value ? 'p-menubar-item-active' : undefined,
    command: () => setMode(value),
  })),
);

function toggleThemeMenu(event: Event) {
  themeMenu.value?.toggle(event);
}

const logoffMenu = ref();
const logoffItems = ref<MenuItem[]>([
  {
    label: 'Sair (Desta sessão)',
    icon: 'pi pi-sign-out',
    url: '/logoff?all=false',
  },
  {
    label: 'Sair (Todas sessões)',
    icon: 'pi pi-sign-out',
    url: '/logoff?all=true',
  },
]);

function toggleLogoff(event: Event) {
  logoffMenu.value?.toggle(event);
}
</script>
