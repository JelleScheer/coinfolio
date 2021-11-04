import { reactive, provide, inject } from 'vue';
import Listing from '@/lib/types/Listing';
import Holding from "@/lib/types/Holding";

export const stateSymbol = Symbol('state');
export const createState = () => reactive({
  coins: [] as Listing[],
  overlay: false as boolean,
  newHolding: false as Listing | false,
  holdings: [] as Holding[],
});

export const useState = () => inject(stateSymbol);
export const provideState = () => provide(
  stateSymbol,
  createState(),
);
