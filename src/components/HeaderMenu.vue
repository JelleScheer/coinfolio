<template>
  <div class="bg-white shadow-sm w-full p-6">
    <div class="flex items-center justify-end max-w-screen-lg mx-auto">
      <img id="profile-avatar" src="https://cdn.thehuddle.nl/uploads/tenants/21/202111/192945-ds2021-01-02-436.jpg">
      <p class="font-medium">Jelle</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
});
</script>

<style lang="scss" scoped>
  #profile-avatar {
    @apply rounded-full mr-3;
    width: 30px;
    height: 30px;
  }
</style>
