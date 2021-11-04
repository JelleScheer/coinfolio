<template>
  <div class="bg-white shadow-sm w-full p-4">
    <div class="flex items-center justify-end max-w-screen-lg mx-auto">
      <div class="border-r border-gray-100 mr-4 pr-4 py-2">
        <span class="text-gray-500 pt-px">${{ totalValue.toFixed(2) }}</span>
      </div>
      <img id="profile-avatar" src="https://cdn.thehuddle.nl/uploads/tenants/21/202111/192945-ds2021-01-02-436.jpg">
      <p class="font-medium">Jelle</p>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent } from 'vue';
import { useState } from '@/store';
import Holding from '@/components/Holding.vue';
import CoinListing from '@/lib/types/CoinListing';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  setup() {
    const store: Symbol = useState();

    const holdings: Holding[] = computed(() => store.holdings);

    const totalValue: number = computed(() => {
      let value = 0;

      const coinList = useState().coins;

      if (coinList.length > 0) {
        for (let i = 0; i < holdings.value.length; i += 1) {
          const listing: CoinListing = coinList.find((coinRecord) => coinRecord.id === holdings.value[i].coinId);

          if (typeof listing !== 'undefined') {
            value += (listing.quote.USD.price * holdings.value[i].amount);
          }
        }
      }

      return value;
    });

    return { totalValue };
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
