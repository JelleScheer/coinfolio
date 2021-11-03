/* eslint-disable camelcase */
interface CoinListingQuote {
  price: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_60d: number;
  percent_change_90d: number;
}

class CoinListing {
  id: number;

  circulating_supply: number;

  cmc_rank: number;

  date_added: string;

  last_updated: string;

  max_supply: number;

  name: string;

  num_market_pairs: number;

  slug: string;

  symbol: string;

  platform?: string;

  quote: Record<string, CoinListingQuote>;
}

export default CoinListing;
