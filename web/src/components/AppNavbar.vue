<template>
  <Menubar :model="navItems" class="sticky top-0 z-40 rounded-none border-x-0 border-t-0 px-4">
    <template #start>
      <router-link
        to="/"
        class="flex items-center gap-2 font-semibold text-lg no-underline text-current"
      >
        {{ $t('navbar.brand') }}
      </router-link>
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
          icon="pi pi-cog"
          severity="secondary"
          text
          rounded
          :aria-label="$t('navbar.settings')"
          v-tooltip.bottom="$t('navbar.settings')"
          @click="settingsDialogVisible = true"
        />
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          text
          :aria-label="$t('navbar.logout')"
          @click="toggleLogoff"
        />
        <Menu ref="logoffMenu" :model="logoffItems" :popup="true" />
      </div>
    </template>
  </Menubar>

  <SettingsDialog :visible="settingsDialogVisible" @close="settingsDialogVisible = false" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import type { MenuItem } from 'primevue/menuitem';
import { getSession, isLoggedIn } from '../lib/session';
import SettingsDialog from './SettingsDialog.vue';

const session = getSession();
const router = useRouter();
const { t } = useI18n();

const settingsDialogVisible = ref(false);

interface NavItem extends MenuItem {
  to?: string;
}

const items = computed<NavItem[]>(() => [
  { label: t('navbar.items.home'), icon: 'pi pi-home', to: '/' },
  { label: t('navbar.items.expenses'), icon: 'pi pi-minus-circle', to: '/expenses' },
  { label: t('navbar.items.incomes'), icon: 'pi pi-plus-circle', to: '/incomes' },
  { label: t('navbar.items.transfers'), icon: 'pi pi-arrows-h', to: '/transfers' },
  { label: t('navbar.items.loans'), icon: 'pi pi-dollar', to: '/loans' },
  { label: t('navbar.items.categories'), icon: 'pi pi-list', to: '/categories' },
  { label: t('navbar.items.accounts'), icon: 'pi pi-wallet', to: '/accounts' },
]);

const navItems = computed<NavItem[]>(() => (isLoggedIn() ? items.value : []));

const logoffMenu = ref();
const logoffItems = computed<MenuItem[]>(() => [
  {
    label: t('navbar.logoff.currentSession'),
    icon: 'pi pi-sign-out',
    command: () => router.push({ name: 'logoff', query: { all: 'false' } }),
  },
  {
    label: t('navbar.logoff.allSessions'),
    icon: 'pi pi-sign-out',
    command: () => router.push({ name: 'logoff', query: { all: 'true' } }),
  },
]);

function toggleLogoff(event: Event) {
  logoffMenu.value?.toggle(event);
}
</script>
