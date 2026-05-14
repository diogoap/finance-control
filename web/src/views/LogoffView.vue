<template>
  <div class="flex min-h-[70vh] items-center justify-center">
    <ProgressSpinner />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ProgressSpinner from 'primevue/progressspinner';
import { logoff, clearSession } from '../composables/useAuth';

const route = useRoute();

onMounted(async () => {
  const allSessions = route.query.all === 'true';
  try {
    await logoff(allSessions);
  } catch {
    // best-effort: clear session locally even if the server call fails
  }
  clearSession();
  // Full navigation so the navbar (mounted in App.vue) reflects the cleared session.
  window.location.assign('/login');
});
</script>
