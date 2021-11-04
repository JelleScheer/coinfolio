<template>
  <div class="flex flex-col">
    <div class="flex justify-between pb-4 mb-10 border-b-2 border-gray-100">
      <h2 class="section-title">Current market values</h2>
      <h2 class="section-title">Your wallet</h2>
    </div>
    <div class="flex">
      <div class="flex flex-col flex-2 border-r border-r-2 border-gray-100">
        <template v-if="listings.length > 0">
          <div class="coin-listing flex items-center mb-8" v-for="coin in recentListing.data" :key="coin.id">
            <img :src="'/src/assets/' + coin.slug + '.png'">
            <div class="flex flex-col ml-4">
              <h3 class="font-semibold">{{ coin.name }}</h3>
              <p class="text-gray-500">
                ${{ coin.quote.USD.price.toFixed(2) }}
                <span class="text-sm font-medium" :class="coin.quote.USD.percent_change_24h > 0 ? 'text-green-500' : 'text-red-500'">
                  {{ coin.quote.USD.percent_change_24h.toFixed(2) }}%
                </span>
              </p>
            </div>
          </div>
        </template>
      </div>
      <p class="flex-1">test</p>
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

export default defineComponent({
  name: 'Home',
  setup() {
    const state = reactive({
      // chunks: {} as Object<number, PusherListingChunk>,
      chunks: {} as Record<string, ListingChunk>,
      listings: [] as Listing[],
    });

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
      }
    }

    function setupPusher() {
      const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      });

      const channel = pusher.subscribe('listings');

      channel.bind('index', (chunk: PusherListingChunk) => {
        parseListingChunk(chunk);
      });
    }

    onMounted(() => {
      // setupPusher();
      fetchStaticCoinData();
    });

    function fetchStaticCoinData() {
      axios.get('http://127.0.0.1:3001/example').then((response) => {
        state.listings.push(Object.assign(new Listing(), response.data));
      }).catch((err) => {
        console.log(err);
      });
    }

    return { ...toRefs(state), recentListing };
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
</style>
