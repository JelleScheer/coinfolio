import { AxiosResponse } from 'axios';
import { createConnection, Connection, getConnection, InsertResult } from 'typeorm';
import Holding from './src/entity/Holding';

const axios = require('axios');
const Pusher = require('pusher');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const port = 3001;

// setup .env file usage
dotenv.config();

// allow cors
app.use(cors({
  origin(origin: any, callback: any) {
    if (!origin) return callback(null, true);
    if (['http://localhost:3000'].indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
}));

// allows us to get the body of a request
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

// setup pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

// database placeholder
let database: Connection;

// setup axios instance
const axiosInstance = axios.create({
  baseURL: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency',
  // baseURL: 'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency',
  headers: {
    'X-CMC_PRO_API_KEY': process.env.COINMARKET_API_KEY,
    // 'X-CMC_PRO_API_KEY': process.env.COINMARKET_SANDBOX_KEY,
  },
});

function pushChunk(eventsArray: Object[]) {
  const events = [];

  for (let i = 0; i < eventsArray.length; i += 1) {
    events.push({
      channel: 'listings',
      name: 'index',
      data: eventsArray[i],
    });
  }

  pusher.triggerBatch(events).then(() => {
    console.log('successfully send batch');
  }).catch((err: any) => {
    console.log('could not send batch, error:');
    console.log(err);
  });
}

function splitToChunks(data: Object) {
  const chunkSize = 9000;
  const str = JSON.stringify(data);
  const msgId = `${Math.random()} `;
  let eventsArray: Object[] = [];

  for (let i = 0; i * chunkSize < str.length; i += 1) {
    eventsArray.push({
      id: msgId,
      index: i,
      chunk: str.substr(i * chunkSize, chunkSize),
      final: chunkSize * (i + 1) >= str.length,
    });

    if (eventsArray.length === 10) {
      pushChunk(eventsArray);

      eventsArray = [];
    }
  }

  if (eventsArray.length > 0) {
    pushChunk(eventsArray);
  }
}

function pollListings() {
  console.log('fetching listings');

  axiosInstance.get('/listings/latest?start=1&limit=25').then((res: AxiosResponse) => {
    splitToChunks(res.data);
  }).catch((err: any) => {
    console.log('error fetching listings:');
    console.log(err);
  });
}

// example endpint for some coin data
app.get('/example', (req: any, res: any) => {
  const response = '{"status":{"timestamp":"2021-11-03T17:28:20.176Z","error_code":0,"error_message":null,"elapsed":19,"credit_count":1,"notice":null,"total_count":7040},"data":[{"id":1,"name":"Bitcoin","symbol":"BTC","slug":"bitcoin","num_market_pairs":8292,"date_added":"2013-04-28T00:00:00.000Z","tags":["mineable","pow","sha-256","store-of-value","state-channels","coinbase-ventures-portfolio","three-arrows-capital-portfolio","polychain-capital-portfolio","binance-labs-portfolio","arrington-xrp-capital","blockchain-capital-portfolio","boostvc-portfolio","cms-holdings-portfolio","dcg-portfolio","dragonfly-capital-portfolio","electric-capital-portfolio","fabric-ventures-portfolio","framework-ventures","galaxy-digital-portfolio","huobi-capital","alameda-research-portfolio","a16z-portfolio","1confirmation-portfolio","winklevoss-capital","usv-portfolio","placeholder-ventures-portfolio","pantera-capital-portfolio","multicoin-capital-portfolio","paradigm-xzy-screener"],"max_supply":21000000,"circulating_supply":18862787,"total_supply":18862787,"platform":null,"cmc_rank":1,"last_updated":"2021-11-03T17:27:02.000Z","quote":{"USD":{"price":62508.65103058283,"volume_24h":33769357264.249496,"volume_change_24h":-7.0639,"percent_change_1h":0.12697029,"percent_change_24h":-1.70056776,"percent_change_7d":5.67764818,"percent_change_30d":28.83941561,"percent_change_60d":26.15578116,"percent_change_90d":55.1973104,"market_cap":1179087370047.2144,"market_cap_dominance":43.2521,"fully_diluted_market_cap":1312681671642.24,"last_updated":"2021-11-03T17:27:02.000Z"}}},{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","num_market_pairs":4534,"date_added":"2015-08-07T00:00:00.000Z","tags":["mineable","pow","smart-contracts","ethereum","binance-smart-chain","coinbase-ventures-portfolio","three-arrows-capital-portfolio","polychain-capital-portfolio","binance-labs-portfolio","arrington-xrp-capital","blockchain-capital-portfolio","boostvc-portfolio","cms-holdings-portfolio","dcg-portfolio","dragonfly-capital-portfolio","electric-capital-portfolio","fabric-ventures-portfolio","framework-ventures","hashkey-capital-portfolio","kinetic-capital","huobi-capital","alameda-research-portfolio","a16z-portfolio","1confirmation-portfolio","winklevoss-capital","usv-portfolio","placeholder-ventures-portfolio","pantera-capital-portfolio","multicoin-capital-portfolio","paradigm-xzy-screener"],"max_supply":null,"circulating_supply":118193275.749,"total_supply":118193275.749,"platform":null,"cmc_rank":2,"last_updated":"2021-11-03T17:27:02.000Z","quote":{"USD":{"price":4551.024046394998,"volume_24h":19886140910.687023,"volume_change_24h":4.2656,"percent_change_1h":-0.02894865,"percent_change_24h":1.42738645,"percent_change_7d":13.72833546,"percent_change_30d":35.29700547,"percent_change_60d":18.00842428,"percent_change_90d":62.96433547,"market_cap":537900440055.89374,"market_cap_dominance":19.7231,"fully_diluted_market_cap":537900440055.89,"last_updated":"2021-11-03T17:27:02.000Z"}}},{"id":1839,"name":"Binance Coin","symbol":"BNB","slug":"binance-coin","num_market_pairs":545,"date_added":"2017-07-25T00:00:00.000Z","tags":["marketplace","centralized-exchange","payments","smart-contracts","binance-smart-chain","alameda-research-portfolio","multicoin-capital-portfolio"],"max_supply":166801148,"circulating_supply":166801148,"total_supply":166801148,"platform":null,"cmc_rank":3,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":553.6998946714427,"volume_24h":2279886387.2546444,"volume_change_24h":-10.187,"percent_change_1h":0.46597956,"percent_change_24h":-1.12103445,"percent_change_7d":20.90380441,"percent_change_30d":31.25449534,"percent_change_60d":12.56721182,"percent_change_90d":65.20401685,"market_cap":92357778078.67574,"market_cap_dominance":3.3927,"fully_diluted_market_cap":92357778078.68,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":825,"name":"Tether","symbol":"USDT","slug":"tether","num_market_pairs":18505,"date_added":"2015-02-25T00:00:00.000Z","tags":["payments","stablecoin","stablecoin-asset-backed","binance-smart-chain","avalanche-ecosystem","solana-ecosystem"],"max_supply":null,"circulating_supply":71045760760.65137,"total_supply":72357845272.48163,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0xdac17f958d2ee523a2206206994597c13d831ec7"},"cmc_rank":4,"last_updated":"2021-11-03T17:26:09.000Z","quote":{"USD":{"price":1.00095183156468,"volume_24h":84400194016.60901,"volume_change_24h":-32.9252,"percent_change_1h":0.00289144,"percent_change_24h":0.03790187,"percent_change_7d":0.03245916,"percent_change_30d":0.06709458,"percent_change_60d":0.02878725,"percent_change_90d":0.08084929,"market_cap":71113384358.28006,"market_cap_dominance":2.6101,"fully_diluted_market_cap":72426717753.56,"last_updated":"2021-11-03T17:26:09.000Z"}}},{"id":2010,"name":"Cardano","symbol":"ADA","slug":"cardano","num_market_pairs":306,"date_added":"2017-10-01T00:00:00.000Z","tags":["mineable","dpos","pos","platform","research","smart-contracts","staking","binance-smart-chain","cardano-ecosystem"],"max_supply":45000000000,"circulating_supply":33270310245.542,"total_supply":33676945631.8,"platform":null,"cmc_rank":5,"last_updated":"2021-11-03T17:26:10.000Z","quote":{"USD":{"price":2.05740781214351,"volume_24h":4401985576.216341,"volume_change_24h":77.0414,"percent_change_1h":-0.90061221,"percent_change_24h":3.28434063,"percent_change_7d":3.52802191,"percent_change_30d":-5.98514389,"percent_change_60d":-26.90937722,"percent_change_90d":48.62686712,"market_cap":68450596211.61638,"market_cap_dominance":2.5145,"fully_diluted_market_cap":92583351546.46,"last_updated":"2021-11-03T17:26:10.000Z"}}},{"id":5426,"name":"Solana","symbol":"SOL","slug":"solana","num_market_pairs":177,"date_added":"2020-04-10T00:00:00.000Z","tags":["pos","platform","solana-ecosystem","cms-holdings-portfolio","kinetic-capital","alameda-research-portfolio","multicoin-capital-portfolio"],"max_supply":null,"circulating_supply":301075571.50144964,"total_supply":508181559.2148058,"platform":null,"cmc_rank":6,"last_updated":"2021-11-03T17:27:05.000Z","quote":{"USD":{"price":225.5593544875703,"volume_24h":5160570451.927937,"volume_change_24h":130.0583,"percent_change_1h":-0.3184383,"percent_change_24h":6.62408353,"percent_change_7d":18.19627316,"percent_change_30d":34.85508106,"percent_change_60d":64.23028315,"percent_change_90d":511.44500256,"market_cap":67910411559.84329,"market_cap_dominance":2.4926,"fully_diluted_market_cap":114625104458.98,"last_updated":"2021-11-03T17:27:05.000Z"}}},{"id":52,"name":"XRP","symbol":"XRP","slug":"xrp","num_market_pairs":636,"date_added":"2013-08-04T00:00:00.000Z","tags":["medium-of-exchange","enterprise-solutions","binance-chain","arrington-xrp-capital","galaxy-digital-portfolio","a16z-portfolio","pantera-capital-portfolio"],"max_supply":100000000000,"circulating_supply":47081679946,"total_supply":99990161790,"platform":null,"cmc_rank":7,"last_updated":"2021-11-03T17:27:03.000Z","quote":{"USD":{"price":1.17794688518376,"volume_24h":5964724999.890799,"volume_change_24h":73.6347,"percent_change_1h":0.40579541,"percent_change_24h":3.88662218,"percent_change_7d":14.60617587,"percent_change_30d":13.66622287,"percent_change_60d":-5.07756305,"percent_change_90d":61.95132686,"market_cap":55459718241.6094,"market_cap_dominance":2.0335,"fully_diluted_market_cap":117794688518.38,"last_updated":"2021-11-03T17:27:03.000Z"}}},{"id":6636,"name":"Polkadot","symbol":"DOT","slug":"polkadot-new","num_market_pairs":241,"date_added":"2020-08-19T00:00:00.000Z","tags":["substrate","polkadot","binance-chain","binance-smart-chain","polkadot-ecosystem","three-arrows-capital-portfolio","polychain-capital-portfolio","blockchain-capital-portfolio","boostvc-portfolio","cms-holdings-portfolio","coinfund-portfolio","fabric-ventures-portfolio","fenbushi-capital-portfolio","hashkey-capital-portfolio","kinetic-capital","1confirmation-portfolio","placeholder-ventures-portfolio","pantera-capital-portfolio","exnetwork-capital-portfolio"],"max_supply":null,"circulating_supply":987579314.957085,"total_supply":1103303471.382273,"platform":null,"cmc_rank":8,"last_updated":"2021-11-03T17:27:06.000Z","quote":{"USD":{"price":52.9066479760295,"volume_24h":3059492444.7233887,"volume_change_24h":-32.419,"percent_change_1h":-0.04593291,"percent_change_24h":2.83237196,"percent_change_7d":27.15108129,"percent_change_30d":71.22199226,"percent_change_60d":64.54227696,"percent_change_90d":177.29595343,"market_cap":52249511164.84286,"market_cap_dominance":1.9177,"fully_diluted_market_cap":58372088371.15,"last_updated":"2021-11-03T17:27:06.000Z"}}},{"id":74,"name":"Dogecoin","symbol":"DOGE","slug":"dogecoin","num_market_pairs":399,"date_added":"2013-12-15T00:00:00.000Z","tags":["mineable","pow","scrypt","medium-of-exchange","memes","payments","binance-smart-chain","doggone-doggerel"],"max_supply":null,"circulating_supply":131956982380.46834,"total_supply":131956982380.46834,"platform":null,"cmc_rank":9,"last_updated":"2021-11-03T17:27:03.000Z","quote":{"USD":{"price":0.26724761817884,"volume_24h":2248492502.4712677,"volume_change_24h":5.8985,"percent_change_1h":0.0672522,"percent_change_24h":-2.12437823,"percent_change_7d":8.71700248,"percent_change_30d":17.00309047,"percent_change_60d":-9.85768159,"percent_change_90d":32.93284152,"market_cap":35265189243.24732,"market_cap_dominance":1.2936,"fully_diluted_market_cap":35265189243.25,"last_updated":"2021-11-03T17:27:03.000Z"}}},{"id":5994,"name":"SHIBA INU","symbol":"SHIB","slug":"shiba-inu","num_market_pairs":156,"date_added":"2020-08-01T00:00:00.000Z","tags":["memes","doggone-doggerel"],"max_supply":null,"circulating_supply":549095509738353,"total_supply":589738956207003.8,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce"},"cmc_rank":10,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":0.00006408393031,"volume_24h":5482618109.165658,"volume_change_24h":22.004,"percent_change_1h":-1.72455591,"percent_change_24h":-5.60371352,"percent_change_7d":-5.38034654,"percent_change_30d":444.35479695,"percent_change_60d":785.72487665,"percent_change_90d":930.24281879,"market_cap":35188198379.606544,"market_cap_dominance":1.2926,"fully_diluted_market_cap":37792790173.52,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":3408,"name":"USD Coin","symbol":"USDC","slug":"usd-coin","num_market_pairs":1461,"date_added":"2018-10-08T00:00:00.000Z","tags":["medium-of-exchange","stablecoin","stablecoin-asset-backed","binance-smart-chain","fantom-ecosystem"],"max_supply":null,"circulating_supply":33540800816.427876,"total_supply":33540800816.427876,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"},"cmc_rank":11,"last_updated":"2021-11-03T17:27:05.000Z","quote":{"USD":{"price":1.00027516044256,"volume_24h":4510629950.325718,"volume_change_24h":6.5999,"percent_change_1h":0.00115225,"percent_change_24h":0.05823805,"percent_change_7d":0.00486322,"percent_change_30d":0.0358725,"percent_change_60d":0.02452072,"percent_change_90d":0.03686159,"market_cap":33550029918.024338,"market_cap_dominance":1.2314,"fully_diluted_market_cap":33550029918.02,"last_updated":"2021-11-03T17:27:05.000Z"}}},{"id":4172,"name":"Terra","symbol":"LUNA","slug":"terra-luna","num_market_pairs":93,"date_added":"2019-07-26T00:00:00.000Z","tags":["cosmos-ecosystem","store-of-value","defi","payments","coinbase-ventures-portfolio","binance-labs-portfolio","solana-ecosystem","arrington-xrp-capital","hashkey-capital-portfolio","kinetic-capital","huobi-capital","pantera-capital-portfolio","terra-ecosystem"],"max_supply":null,"circulating_supply":399918117.3848749,"total_supply":968915846.785326,"platform":null,"cmc_rank":12,"last_updated":"2021-11-03T17:27:03.000Z","quote":{"USD":{"price":47.97038314732725,"volume_24h":1244240311.0306003,"volume_change_24h":114.8698,"percent_change_1h":0.21038645,"percent_change_24h":5.84333673,"percent_change_7d":17.3619834,"percent_change_30d":-1.19209673,"percent_change_60d":54.23797796,"percent_change_90d":229.67366973,"market_cap":19184225318.510242,"market_cap_dominance":0.7034,"fully_diluted_market_cap":46479264407.81,"last_updated":"2021-11-03T17:27:03.000Z"}}},{"id":5805,"name":"Avalanche","symbol":"AVAX","slug":"avalanche","num_market_pairs":104,"date_added":"2020-07-13T00:00:00.000Z","tags":["defi","smart-contracts","binance-smart-chain","polychain-capital-portfolio","avalanche-ecosystem","cms-holdings-portfolio","dragonfly-capital-portfolio"],"max_supply":720000000,"circulating_supply":220286577.20755112,"total_supply":391128418.8675511,"platform":null,"cmc_rank":13,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":73.8674466802561,"volume_24h":973294220.1022292,"volume_change_24h":166.6576,"percent_change_1h":-0.54398293,"percent_change_24h":12.93528302,"percent_change_7d":16.6977644,"percent_change_30d":11.59847069,"percent_change_60d":61.34010835,"percent_change_90d":439.45997476,"market_cap":16272006996.2549,"market_cap_dominance":0.5977,"fully_diluted_market_cap":53184561609.78,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":7083,"name":"Uniswap","symbol":"UNI","slug":"uniswap","num_market_pairs":283,"date_added":"2020-09-17T00:00:00.000Z","tags":["decentralized-exchange","defi","dao","yield-farming","amm","binance-smart-chain","coinbase-ventures-portfolio","three-arrows-capital-portfolio","governance","blockchain-capital-portfolio","defiance-capital","alameda-research-portfolio","a16z-portfolio","pantera-capital-portfolio","parafi-capital","paradigm-xzy-screener","arbitrum-ecosytem"],"max_supply":1000000000,"circulating_supply":627596088.553873,"total_supply":1000000000,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"},"cmc_rank":14,"last_updated":"2021-11-03T17:26:10.000Z","quote":{"USD":{"price":25.90742406133954,"volume_24h":397459351.8312727,"volume_change_24h":40.092,"percent_change_1h":0.31912854,"percent_change_24h":-0.79545678,"percent_change_7d":3.90100581,"percent_change_30d":2.69559577,"percent_change_60d":-8.57649273,"percent_change_90d":4.39871085,"market_cap":16259398005.403189,"market_cap_dominance":0.5973,"fully_diluted_market_cap":25907424061.34,"last_updated":"2021-11-03T17:26:10.000Z"}}},{"id":1975,"name":"Chainlink","symbol":"LINK","slug":"chainlink","num_market_pairs":478,"date_added":"2017-09-20T00:00:00.000Z","tags":["platform","defi","oracles","smart-contracts","substrate","polkadot","binance-smart-chain","polkadot-ecosystem","avalanche-ecosystem","solana-ecosystem","framework-ventures","polygon-ecosystem","fantom-ecosystem","near-protocol-ecosystem"],"max_supply":1000000000,"circulating_supply":462509553.9174637,"total_supply":1000000000,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0x514910771af9ca656af840dff83e8264ecf986ca"},"cmc_rank":15,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":31.33033380936404,"volume_24h":1055276675.0869858,"volume_change_24h":1.007,"percent_change_1h":0.10037412,"percent_change_24h":-3.17508632,"percent_change_7d":5.58018577,"percent_change_30d":18.01646287,"percent_change_60d":5.41923131,"percent_change_90d":30.21912744,"market_cap":14490578714.254192,"market_cap_dominance":0.5319,"fully_diluted_market_cap":31330333809.36,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":3717,"name":"Wrapped Bitcoin","symbol":"WBTC","slug":"wrapped-bitcoin","num_market_pairs":165,"date_added":"2019-01-30T00:00:00.000Z","tags":["medium-of-exchange","defi","wrapped-tokens","fantom-ecosystem"],"max_supply":null,"circulating_supply":230261.41675071,"total_supply":230261.41675071,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"},"cmc_rank":16,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":62531.50714383492,"volume_24h":398521107.6139303,"volume_change_24h":3.091,"percent_change_1h":-0.01850634,"percent_change_24h":-1.74225995,"percent_change_7d":5.72636039,"percent_change_30d":28.8966172,"percent_change_60d":26.09583791,"percent_change_90d":55.84650134,"market_cap":14398593426.49657,"market_cap_dominance":0.5289,"fully_diluted_market_cap":14398593426.5,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":2,"name":"Litecoin","symbol":"LTC","slug":"litecoin","num_market_pairs":690,"date_added":"2013-04-28T00:00:00.000Z","tags":["mineable","pow","scrypt","medium-of-exchange","binance-chain","binance-smart-chain"],"max_supply":84000000,"circulating_supply":68892407.6367999,"total_supply":84000000,"platform":null,"cmc_rank":17,"last_updated":"2021-11-03T17:27:02.000Z","quote":{"USD":{"price":201.36338568422087,"volume_24h":2407589955.556593,"volume_change_24h":9.7349,"percent_change_1h":0.08410282,"percent_change_24h":-1.02603,"percent_change_7d":9.23766461,"percent_change_30d":21.90431067,"percent_change_60d":-4.90130195,"percent_change_90d":41.35937845,"market_cap":13872408449.683502,"market_cap_dominance":0.5089,"fully_diluted_market_cap":16914524397.47,"last_updated":"2021-11-03T17:27:02.000Z"}}},{"id":4687,"name":"Binance USD","symbol":"BUSD","slug":"binance-usd","num_market_pairs":1548,"date_added":"2019-09-20T00:00:00.000Z","tags":["stablecoin","stablecoin-asset-backed","binance-chain","binance-smart-chain"],"max_supply":null,"circulating_supply":13704966705.95,"total_supply":13704966705.95,"platform":{"id":1839,"name":"Binance Chain (BEP2)","symbol":"BNB","slug":"binance-coin","token_address":"BUSD-BD1"},"cmc_rank":18,"last_updated":"2021-11-03T17:27:06.000Z","quote":{"USD":{"price":1.00044401925999,"volume_24h":7091069002.520652,"volume_change_24h":-5.7267,"percent_change_1h":0.01302926,"percent_change_24h":0.0595366,"percent_change_7d":0.02868399,"percent_change_30d":0.04770789,"percent_change_60d":0.03307335,"percent_change_90d":0.03172236,"market_cap":13711051975.124964,"market_cap_dominance":0.5032,"fully_diluted_market_cap":13711051975.12,"last_updated":"2021-11-03T17:27:06.000Z"}}},{"id":3890,"name":"Polygon","symbol":"MATIC","slug":"polygon","num_market_pairs":250,"date_added":"2019-04-28T00:00:00.000Z","tags":["platform","enterprise-solutions","state-channels","binance-smart-chain","coinbase-ventures-portfolio","binance-launchpad","binance-labs-portfolio","polygon-ecosystem"],"max_supply":10000000000,"circulating_supply":6804312959.27,"total_supply":10000000000,"platform":null,"cmc_rank":19,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":1.99545666361069,"volume_24h":1918190340.510552,"volume_change_24h":59.9539,"percent_change_1h":-0.77056588,"percent_change_24h":3.92594943,"percent_change_7d":10.30072978,"percent_change_30d":56.95984404,"percent_change_60d":22.94588995,"percent_change_90d":86.79208186,"market_cap":13577711635.867897,"market_cap_dominance":0.4988,"fully_diluted_market_cap":19954566636.11,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":4030,"name":"Algorand","symbol":"ALGO","slug":"algorand","num_market_pairs":155,"date_added":"2019-06-20T00:00:00.000Z","tags":["pos","platform","research","smart-contracts","arrington-xrp-capital","kinetic-capital","usv-portfolio","multicoin-capital-portfolio","exnetwork-capital-portfolio"],"max_supply":10000000000,"circulating_supply":6206225912.888624,"total_supply":6668544507.213292,"platform":null,"cmc_rank":20,"last_updated":"2021-11-03T17:26:10.000Z","quote":{"USD":{"price":1.91575807377332,"volume_24h":410684168.1306119,"volume_change_24h":38.721,"percent_change_1h":0.31821626,"percent_change_24h":2.10565408,"percent_change_7d":3.93576448,"percent_change_30d":-1.71607721,"percent_change_60d":60.62969553,"percent_change_90d":126.05579073,"market_cap":11889627400.277575,"market_cap_dominance":0.4364,"fully_diluted_market_cap":19157580737.73,"last_updated":"2021-11-03T17:26:10.000Z"}}},{"id":1831,"name":"Bitcoin Cash","symbol":"BCH","slug":"bitcoin-cash","num_market_pairs":529,"date_added":"2017-07-23T00:00:00.000Z","tags":["mineable","pow","sha-256","marketplace","medium-of-exchange","store-of-value","enterprise-solutions","payments","binance-chain","binance-smart-chain"],"max_supply":21000000,"circulating_supply":18890243.75,"total_supply":18890243.75,"platform":null,"cmc_rank":21,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":605.4942688606112,"volume_24h":1367158811.1155934,"volume_change_24h":27.0868,"percent_change_1h":0.69356108,"percent_change_24h":0.05727781,"percent_change_7d":7.40183032,"percent_change_30d":11.05339934,"percent_change_60d":-13.53848967,"percent_change_90d":11.61096069,"market_cap":11437934328.00498,"market_cap_dominance":0.4198,"fully_diluted_market_cap":12715379646.07,"last_updated":"2021-11-03T17:26:08.000Z"}}},{"id":512,"name":"Stellar","symbol":"XLM","slug":"stellar","num_market_pairs":366,"date_added":"2014-08-05T00:00:00.000Z","tags":["medium-of-exchange","enterprise-solutions","decentralized-exchange","smart-contracts","hashkey-capital-portfolio"],"max_supply":50001806812,"circulating_supply":24199200577.53901,"total_supply":50001802658.98352,"platform":null,"cmc_rank":22,"last_updated":"2021-11-03T17:27:06.000Z","quote":{"USD":{"price":0.37855631690906,"volume_24h":931510175.7645135,"volume_change_24h":58.5948,"percent_change_1h":-0.07783547,"percent_change_24h":-0.18676144,"percent_change_7d":10.65925833,"percent_change_30d":25.22771711,"percent_change_60d":3.05667841,"percent_change_90d":36.69031224,"market_cap":9160760242.776764,"market_cap_dominance":0.336,"fully_diluted_market_cap":18928499825.55,"last_updated":"2021-11-03T17:27:06.000Z"}}},{"id":3077,"name":"VeChain","symbol":"VET","slug":"vechain","num_market_pairs":147,"date_added":"2017-08-22T00:00:00.000Z","tags":["logistics","data-provenance","iot","smart-contracts","fenbushi-capital-portfolio"],"max_supply":86712634466,"circulating_supply":64315576989,"total_supply":86712634466,"platform":null,"cmc_rank":23,"last_updated":"2021-11-03T17:27:02.000Z","quote":{"USD":{"price":0.13519614558015,"volume_24h":542761991.4040794,"volume_change_24h":-5.6285,"percent_change_1h":0.19136131,"percent_change_24h":-5.1802043,"percent_change_7d":5.08098685,"percent_change_30d":21.29769099,"percent_change_60d":-5.48598682,"percent_change_90d":49.7316807,"market_cap":8695218109.67619,"market_cap_dominance":0.319,"fully_diluted_market_cap":11723213952.9,"last_updated":"2021-11-03T17:27:02.000Z"}}},{"id":6783,"name":"Axie Infinity","symbol":"AXS","slug":"axie-infinity","num_market_pairs":129,"date_added":"2020-08-31T00:00:00.000Z","tags":["collectibles-nfts","gaming","binance-launchpad","metaverse","defiance-capital","play-to-earn"],"max_supply":270000000,"circulating_supply":60907500,"total_supply":270000000,"platform":{"id":1027,"name":"Ethereum","symbol":"ETH","slug":"ethereum","token_address":"0xbb0e17ef65f82ab018d8edd776e8dd940327b28b"},"cmc_rank":24,"last_updated":"2021-11-03T17:27:07.000Z","quote":{"USD":{"price":137.84577945468084,"volume_24h":550249320.2924122,"volume_change_24h":-7.9843,"percent_change_1h":0.3364563,"percent_change_24h":-1.0680404,"percent_change_7d":10.87125339,"percent_change_30d":-2.51506986,"percent_change_60d":54.56580597,"percent_change_90d":226.82382667,"market_cap":8395841812.135973,"market_cap_dominance":0.308,"fully_diluted_market_cap":37218360452.76,"last_updated":"2021-11-03T17:27:07.000Z"}}},{"id":3794,"name":"Cosmos","symbol":"ATOM","slug":"cosmos","num_market_pairs":185,"date_added":"2019-03-14T00:00:00.000Z","tags":["platform","cosmos-ecosystem","content-creation","interoperability","binance-chain","binance-smart-chain","polychain-capital-portfolio","dragonfly-capital-portfolio","hashkey-capital-portfolio","1confirmation-portfolio","paradigm-xzy-screener","exnetwork-capital-portfolio"],"max_supply":null,"circulating_supply":223961579.444983,"total_supply":281746182.444983,"platform":null,"cmc_rank":25,"last_updated":"2021-11-03T17:26:08.000Z","quote":{"USD":{"price":37.20364707498375,"volume_24h":633984243.8366867,"volume_change_24h":6.538,"percent_change_1h":0.546316,"percent_change_24h":-1.22489469,"percent_change_7d":-2.37222695,"percent_change_30d":1.25306238,"percent_change_60d":55.16779988,"percent_change_90d":183.07406753,"market_cap":8332187560.027082,"market_cap_dominance":0.3058,"fully_diluted_market_cap":10481985536.41,"last_updated":"2021-11-03T17:26:08.000Z"}}}]}';

  res.json(JSON.parse(response));
});

app.get('/listings', async (req: any, res: any) => {
  pollListings();

  res.json(JSON.parse('{}'));
});

// Get list of current holdings
app.get('/holdings', async (req: any, res: any) => {
  const holdings: Holding[] = await database.getRepository(Holding).find();

  return res.json(holdings);
});

// Create new holding
app.post('/holdings', async (req: any, res: any) => {
  const queryResult: InsertResult = await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Holding)
    .values(req.body)
    .execute();

  const newHolding: Holding = await database.getRepository(Holding).findOneOrFail(queryResult.generatedMaps[0].id);

  return res.json(newHolding);
});

app.listen(port, async () => {
  database = await createConnection();

  /* const user = new User();

  user.firstName = 'Adam';
  user.lastName = 'Sandler';
  user.age = 35;

  await typedatabase.manager.save(user); */

  pollListings();

  setInterval(() => {
    pollListings();
  }, 60000);
});
