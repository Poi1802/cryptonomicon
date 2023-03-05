const API_KEY = '7b99a6e4233fd783af7587ad2cfe2a7b5a4c0d2c1870b7b4f2de0604254b1112';
const AGREGGATE_IDX = '5';

const tickersHadler = new Map();

const tickersBC = new BroadcastChannel('coins');

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const getBTCUSDPrice = (attr) => {
  const stringMess = JSON.stringify({
    action: attr,
    subs: [`5~CCCAGG~BTC~USD`],
  });

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

socket.addEventListener('message', (e) => {
  let { TYPE: type, PRICE: newPrice, FROMSYMBOL: coin } = JSON.parse(e.data);

  if (coin === 'BTC') {
    localStorage.setItem('BTCPrice', newPrice);
  }
  const BTCPrice = localStorage.getItem('BTCPrice');

  newPrice *= BTCPrice;

  if (type === AGREGGATE_IDX && newPrice) {
    const ticker = tickersHadler.get(coin) || [];
    ticker.forEach((fn) => fn(newPrice));

    tickersBC.postMessage({ coin, newPrice });
  } else if (type === '429') {
    tickersBC.onmessage = ({ data }) => {
      const ticker = tickersHadler.get(data.coin) || [];
      ticker.forEach((fn) => fn(data.newPrice));
    };
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

export const subToTicker = (ticker, cb) => {
  const subscribers = tickersHadler.get(ticker) || [];
  tickersHadler.set(ticker, [...subscribers, cb]);
  sendMessageToWS({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });

  if (tickersHadler.size === 1) {
    getBTCUSDPrice('SubAdd');
  }
};

export const unSubFromTicker = (ticker) => {
  tickersHadler.delete(ticker);
  sendMessageToWS({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });

  if (tickersHadler.size === 0) {
    getBTCUSDPrice('SubRemove');
  }
};
