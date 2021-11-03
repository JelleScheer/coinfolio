<template>
  <header-menu></header-menu>
  <div class="max-w-screen-lg mx-auto mt-12">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import HeaderMenu from '@/components/HeaderMenu.vue';

export default defineComponent({
  name: 'App',
  components: {
    'header-menu': HeaderMenu,
  },
});
</script>

<style lang="scss">
  #app {
    @apply bg-gray-50 min-h-screen;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  .section-title {
    @apply font-semibold text-2xl;
  }
</style>
