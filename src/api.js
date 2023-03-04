const API_KEY = '0206af21ee96ce9016bbb1ee54717bdfebf17b1be168f34514cc4fc2afb9286d';

const tickersHadler = new Map();

const loadTickers = async () => {
  if (tickersHadler.size === 0) {
    return;
  }

  await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHadler.keys(),
    ].join(',')}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((r) => r.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([coin, newPrice]) => {
        const ticker = tickersHadler.get(coin) ?? [];

        ticker.forEach((fn) => fn(newPrice));
        // ticker[0](newPrice);
      });
    });
};

export const subToTicker = (ticker, cb) => {
  const subscribers = tickersHadler.get(ticker) || [];
  tickersHadler.set(ticker, [...subscribers, cb]);
};

export const unSubFromTicker = (ticker) => {
  tickersHadler.delete(ticker);
};

setInterval(loadTickers, 5000);
