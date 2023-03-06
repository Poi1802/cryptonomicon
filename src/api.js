const API_KEY = '7b99a6e4233fd783af7587ad2cfe2a7b5a4c0d2c1870b7b4f2de0604254b1112';
const AGREGGATE_IDX = '5';

const tickersHadler = new Map();

const tickersBC = new BroadcastChannel('coins');

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

socket.addEventListener('message', (e) => {
  let {
    TYPE: type,
    PRICE: newPrice,
    FROMSYMBOL: coin,
    TOSYMBOL: toSymbol,
    PARAMETER: param,
  } = JSON.parse(e.data);
  // param from mess if coin no rate to btc
  param = param?.split('~');

  if (coin === 'BTC') {
    localStorage.setItem('BTCPrice', newPrice);
  }
  const BTCPrice = localStorage.getItem('BTCPrice');

  if (coin !== 'BTC' && toSymbol === 'BTC') {
    newPrice *= BTCPrice;
  }

  newPrice = newPrice?.toPrecision(6);

  if (type === AGREGGATE_IDX && !isNaN(newPrice)) {
    const ticker = tickersHadler.get(coin) || [];
    ticker.forEach((fn) => fn(newPrice));

    tickersBC.postMessage({ coin, newPrice });
  } else if (type === '429') {
    tickersBC.onmessage = ({ data }) => {
      const ticker = tickersHadler.get(data.coin) || [];
      ticker.forEach((fn) => fn(data.newPrice));
    };
  } else if (type === '500' && param[3] === 'BTC' && param[2] !== 'BTC') {
    sendMessageToWS({
      action: 'SubAdd',
      subs: [`5~CCCAGG~${param[2]}~USD`],
    });
    const subs = tickersHadler.get(param[2]);
    tickersHadler.set(param[2], [...subs, 'USD']);
    console.log(tickersHadler);
  }
});

const sendMessageToWS = (message) => {
  const stringMess = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringMess);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringMess);
    },
    { once: true }
  );
};
// support cross course frim BTC
const subToBTC = () => {
  sendMessageToWS({
    action: 'SubAdd',
    subs: [`5~CCCAGG~BTC~USD`],
  });
};
const unSubFromBTC = () => {
  sendMessageToWS({
    action: 'SubRemove',
    subs: [`5~CCCAGG~BTC~USD`],
  });
};

export const subToTicker = (ticker, cb) => {
  const subscribers = tickersHadler.get(ticker) || [];
  tickersHadler.set(ticker, [...subscribers, cb]);

  if (tickersHadler.size === 1) {
    subToBTC();
  }

  if (ticker !== 'BTC') {
    sendMessageToWS({
      action: 'SubAdd',
      subs: [`5~CCCAGG~${ticker}~BTC`],
    });
  }
};

export const unSubFromTicker = (ticker) => {
  const subs = tickersHadler.get(ticker);

  tickersHadler.delete(ticker);

  if (subs[1] === 'USD') {
    sendMessageToWS({
      action: 'SubRemove',
      subs: [`5~CCCAGG~${ticker}~USD`],
    });
  } else if (ticker !== 'BTC') {
    sendMessageToWS({
      action: 'SubRemove',
      subs: [`5~CCCAGG~${ticker}~BTC`],
    });
  }

  if (tickersHadler.size === 0) {
    unSubFromBTC();
  }
};
