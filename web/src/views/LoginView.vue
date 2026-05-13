<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-8">
    <div class="w-full max-w-sm rounded-lg border border-surface-200 bg-surface-0 p-8 shadow-sm dark:border-surface-700 dark:bg-surface-900">
      <h1 class="mb-6 text-center text-2xl font-semibold">Bem-vindo!</h1>
      <a
        href="/auth/google"
        class="flex w-full items-center justify-center gap-2 rounded-md bg-[#dd4b39] px-4 py-2 text-sm font-medium text-white no-underline hover:bg-[#c23321] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dd4b39]"
      >
        <i class="pi pi-google" />
        <span>Entrar com Google</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

onMounted(() => {
  const error = route.query.error;
  if (typeof error === 'string' && error.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'Falha no login',
      detail: error,
      life: 5000,
    });
    router.replace({ query: {} });
  }
});
</script>
