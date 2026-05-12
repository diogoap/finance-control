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
import { ref } from 'vue';
import Menubar from 'primevue/menubar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import type { MenuItem } from 'primevue/menuitem';
import { getSession } from '../lib/session';

const session = getSession();

interface NavItem extends MenuItem {
  to?: string;
}

const items = ref<NavItem[]>([
  { label: 'Despesas', icon: 'pi pi-minus-circle', url: '/expenses' },
  { label: 'Receitas', icon: 'pi pi-plus-circle', url: '/incomes' },
  { label: 'Transferências', icon: 'pi pi-arrows-h', url: '/transfers' },
  { label: 'Empréstimos', icon: 'pi pi-dollar', url: '/loans' },
  { label: 'Categorias', icon: 'pi pi-list', to: '/categories' },
  { label: 'Contas', icon: 'pi pi-building', url: '/accounts' },
]);

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
