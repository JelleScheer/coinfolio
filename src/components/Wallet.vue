<template>
  <div class="ml-7">
    <Holding v-for="holding in holdings" :holding="holding" :key="holding.id" class="mb-6"></Holding>

    <div class="flex items-center justify-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 active:bg-gray-200 select-none" style="height: 72px;" @click="initNewHolding" v-if="!newHolding">
      <fa class="mr-2" :icon="['fa', 'plus']"></fa>
      <p class="font-semibold pt-px">Add holding</p>
    </div>

    <Coin v-else :newCoin="true" :coin="newHolding" @saveNewHolding="saveNewHolding"></Coin>
  </div>
</template>

<script lang='ts'>
import {
  defineComponent,
  ref,
  computed,
} from 'vue';
import axios from 'axios';
import HoldingModel from '@/lib/types/Holding';
import Holding from '@/components/Holding.vue';
import { useState } from '@/store';
import Listing from '@/lib/types/Listing';
import CoinListing from '@/lib/types/CoinListing';
import Coin from '@/components/Coin.vue';

export default defineComponent({
  name: 'Wallet',
  components: {
    Coin,
    Holding,
  },
  async setup() {
    const store: Symbol = useState();

    const newHolding: Listing | boolean = computed(() => store.newHolding);
    const holdings: Holding[] = computed(() => store.holdings);

    await axios.get('http://127.0.0.1:3001/holdings').then((response) => {
      store.holdings = response.data;
    });

    function initNewHolding() {
      store.overlay = true;
    }

    function saveNewHolding(value: string, coin: CoinListing) {
      store.newHolding = false;

      const newHoldingRecord = new HoldingModel();

      newHoldingRecord.coinId = coin.id;
      newHoldingRecord.amount = value;
      newHoldingRecord.createdAt = '2021-10-01 20:41:00';
      newHoldingRecord.updatedAt = '2021-10-01 20:41:00';
      newHoldingRecord.saving = true;

      store.holdings.push(newHoldingRecord);

      axios.post('http://127.0.0.1:3001/holdings', newHoldingRecord).then(() => {
        store.holdings[store.holdings.length - 1].saving = false;
      }).catch(() => {
        store.holdings.pop();
      });
    }

    return {
      holdings, initNewHolding, saveNewHolding, newHolding,
    };
  },
});
</script>
