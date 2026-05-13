import { onMounted, onUnmounted, ref } from 'vue';

export function useIsMobile(query = '(max-width: 767.98px)') {
  const isMobile = ref(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  let mq: MediaQueryList | null = null;
  const update = (e: MediaQueryListEvent | MediaQueryList) => {
    isMobile.value = e.matches;
  };

  onMounted(() => {
    mq = window.matchMedia(query);
    update(mq);
    mq.addEventListener('change', update);
  });

  onUnmounted(() => {
    mq?.removeEventListener('change', update);
    mq = null;
  });

  return { isMobile };
}
