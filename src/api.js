const API_KEY = '0206af21ee96ce9016bbb1ee54717bdfebf17b1be168f34514cc4fc2afb9286d';
const AGREGGATE_IDX = '5';

const tickersHadler = new Map();

const tickersBC = new BroadcastChannel('coins');

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

socket.addEventListener('message', (e) => {
  const { TYPE: type, PRICE: newPrice, FROMSYMBOL: coin } = JSON.parse(e.data);

  if (type === AGREGGATE_IDX && newPrice) {
    const ticker = tickersHadler.get(coin) || [];
    ticker.forEach((fn) => fn(newPrice));

    tickersBC.postMessage({ coin, newPrice });
  } else if (type === '429') {
    tickersBC.addEventListener('message', ({ data }) => {
      const ticker = tickersHadler.get(data.coin) || [];
      ticker.forEach((fn) => fn(data.newPrice));
    });
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
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

export const unSubFromTicker = (ticker) => {
  tickersHadler.delete(ticker);
  sendMessageToWS({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};
