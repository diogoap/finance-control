<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import AppNavbar from './components/AppNavbar.vue';
import { htmlLang } from './i18n';

onMounted(() => {
  document.documentElement.lang = htmlLang();
});
</script>
