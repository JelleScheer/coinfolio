<template>
  <template v-if="coin">
    <div class="relative">
      <Coin :coin="coin" :class="{'opacity-50 pointer-events-none': holding.saving === true}">
        <template #description>
          {{ holding.amount }}
        </template>
        <template #current>
          {{ (value * (coin.quote.USD.percent_change_24h / 100)).toFixed(2) }}
        </template>
        <template #sub>
          <span class="text-sm text-gray-500 mt-1">${{ value.toFixed(2) }}</span>
        </template>
      </Coin>
      <fa class="saving-holding-icon text-gray-500 absolute top-0 left-0 right-0 mx-auto" v-if="holding.saving === true" icon="spinner" spin></fa>
    </div>
  </template>
</template>

<script lang='ts'>
import { defineComponent, computed } from 'vue';
import Holding from '@/lib/types/Holding';
import CoinListing from '@/lib/types/CoinListing';
import { useState } from '@/store';
import Coin from './Coin.vue';

export default defineComponent({
  name: 'Holding',
  components: {
    Coin,
  },
  props: {
    holding: {
      type: Object as () => Holding,
      required: true,
    },
  },
  setup(props) {
    const coin = computed((): CoinListing | boolean => {
      const coinList = useState().coins;

      if (coinList.length > 0) {
        const listing: CoinListing = coinList.find((coinRecord) => coinRecord.id === props.holding.coinId);

        if (typeof listing !== 'undefined') {
          return listing;
        }
      }

      return false;
    });

    const value = computed((): number => props.holding.amount * coin.value.quote.USD.price);

    return { coin, value, state: useState() };
  },
});
</script>

<style langg="scss" scoped>
  .saving-holding-icon {
    top: calc(25% + 10px);
  }
</style>
