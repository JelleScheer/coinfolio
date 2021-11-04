<template>
  <div class="coin-listing flex items-center justify-between p-3 bg-white rounded-lg shadow">
    <div class="flex items-center">
      <img :src="'/src/assets/' + coin.slug + '.png'">
      <div class="flex flex-col ml-4">
        <h3 class="font-semibold" v-if="!newCoin">
          {{ coin.name }}
        </h3>
        <input v-model="newHoldingAmount" type="number" placeholder="Amount.." class="outline-none" @keypress.enter="saveNewHolding" v-else v-focus>
        <p class="text-gray-500">
          <slot name="description"></slot>
        </p>
      </div>
    </div>
    <div class="flex flex-col items-end">
      <div class="flex items-center text-sm">
        <fa v-if="!newCoin" :icon="['fad', coin.quote.USD.percent_change_24h > 0 ? 'arrow-up' : 'arrow-down']" :class="coin.quote.USD.percent_change_24h > 0 ? 'text-green-500' : 'text-red-500'"></fa>

        <p class="font-semibold ml-1 mt-1" :class="coin.quote.USD.percent_change_24h > 0 ? 'text-green-500' : 'text-red-500'">
          <slot name="current"></slot>
        </p>
      </div>
      <slot name="sub"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import CoinListing from '@/lib/types/CoinListing';

export default defineComponent({
  name: 'Coin',
  props: {
    coin: {
      type: Object as () => CoinListing,
      required: true,
    },
    newCoin: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, context) {
    const newHoldingAmount = ref() as number;

    function saveNewHolding() {
      if (typeof newHoldingAmount.value !== 'undefined') {
        context.emit('saveNewHolding', newHoldingAmount.value, props.coin);
      }
    }

    return { newHoldingAmount, saveNewHolding };
  },
});
</script>

<style lang="scss" scoped>
.coin-listing {
  img {
    @apply rounded-full;
    width: 48px;
    height: 48px;
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
