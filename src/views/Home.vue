<template>
  <div class="flex flex-col">
    <div class="flex justify-between pb-4 mb-10 border-b-2 border-gray-100">
      <h2 class="section-title">
        <fa class="mr-2" :icon="['fad', 'home']"></fa>
        Current market values
      </h2>
      <h2 class="section-title">
        <fa class="mr-2" :icon="['fad', 'money-bill-wave']"></fa>
        Your wallet
      </h2>
    </div>
    <div class="flex">
      <div class="flex flex-2 border-r border-r-2 border-gray-100 mr-2">
        <template v-if="listings.length > 0">
          <div class="grid grid-cols-2 gap-6 w-full mr-8">
            <Coin v-for="coin in recentListing.data" :coin="coin" :key="coin.id" :class="{'z-10 shadow-lg cursor-pointer hover:opacity-75': overlay}" @click="addNewHolding(coin)">
              <template #description>
                ${{ coin.quote.USD.price.toFixed(2) }}
              </template>
              <template #current>
                {{ coin.quote.USD.percent_change_24h.toFixed(2) }}%
              </template>
            </Coin>
          </div>
        </template>
      </div>
      <div class="flex-1" :style="{zIndex: overlay ? -1 : 0}">
        <Suspense>
          <template #default>
            <Wallet></Wallet>
          </template>
          <template #fallback>
            <div class="flex justify-center text-4xl mt-6">
              <fa :icon="['fad', 'spinner']" spin></fa>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  computed,
} from 'vue';
import Pusher from 'pusher-js';
import axios from 'axios';
import PusherListingChunk from '@/lib/types/PusherListingChunk';
import ListingChunk from '@/lib/types/ListingChunk';
import Listing from '@/lib/types/Listing';
import Wallet from '@/components/Wallet.vue';
import Coin from '@/components/Coin.vue';
import { useState } from '@/store';

export default defineComponent({
  name: 'Home',
  components: {
    Wallet,
    Coin,
  },
  setup() {
    const store = useState();

    const state = reactive({
      // chunks: {} as Object<number, PusherListingChunk>,
      chunks: {} as Record<string, ListingChunk>,
      listings: [] as Listing[],
    });

    const overlay: boolean = computed(() => useState().overlay);

    // eslint-disable-next-line max-len
    const recentListing = computed((): Listing => (state.listings[state.listings.length - 1]));

    function parseListingChunk(chunk: PusherListingChunk) {
      if (!Object.prototype.hasOwnProperty.call(state.chunks, chunk.id)) {
        state.chunks[chunk.id] = new ListingChunk();
      }

      const listingChunk: ListingChunk = state.chunks[chunk.id] as ListingChunk;

      listingChunk.chunks.push(chunk.chunk);

      if (chunk.final) {
        listingChunk.finished = true;

        const listing = Object.assign(new Listing(), JSON.parse(listingChunk.chunks.join('')));

        state.listings.push(listing);
        store.coins = listing.data;
      }
    }

    function setupPusher() {
      const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      });

      const channel = pusher.subscribe('listings');

      channel.bind('index', (chunk: PusherListingChunk) => {
        parseListingChunk(chunk);
      });
    }

    onMounted(async () => {
      fetchCoinData();
      setupPusher();
      // fetchStaticCoinData();
    });

    function fetchCoinData() {
      axios.get('http://127.0.0.1:3001/listings');
    }

    function fetchStaticCoinData() {
      axios.get('http://127.0.0.1:3001/example').then((response) => {
        const listing = Object.assign(new Listing(), response.data);
        state.listings.push(listing);
        store.coins = listing.data;
      }).catch((err) => {
        console.log(err);
      });
    }

    function addNewHolding(coin) {
      if (store.overlay === true) {
        store.overlay = false;
        store.newHolding = coin;
      }
    }

    return {
      ...toRefs(state), recentListing, overlay, addNewHolding,
    };
  },
});
</script>
