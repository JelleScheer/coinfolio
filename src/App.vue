<template>
  <div v-if="overlay" class="fixed w-full h-full bg-black opacity-25"></div>
  <HeaderMenu></HeaderMenu>
  <div class="max-w-screen-lg mx-auto my-12">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
} from 'vue';
import HeaderMenu from '@/components/HeaderMenu.vue';
import { useState } from '@/store';

export default defineComponent({
  name: 'App',
  components: {
    HeaderMenu,
  },
  setup() {
    const overlay: boolean = computed(() => useState().overlay);

    return { overlay };
  },
});
</script>

<style lang="scss">
  body {
    @apply bg-gray-50 min-h-screen;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  .section-title {
    @apply font-semibold text-2xl;
  }
</style>
