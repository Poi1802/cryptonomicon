<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="title"
                @keydown.enter="addTicket"
                @keydown="errMsg = false"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full p-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE" />
            </div>
            <div
              v-if="prompCoins.length"
              class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
              <span
                v-for="coin in prompCoins"
                :key="coin.Id"
                @click="clickOnCoin"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
                {{ coin.Symbol }}
              </span>
            </div>
            <div v-if="errMsg" class="text-sm text-red-600">Такой тикер уже добавлен</div>
          </div>
        </div>
        <button
          @click="addTicket"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff">
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
          </svg>
          Добавить
        </button>
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="nav">
          <button
            @click="page--"
            :class="{
              disabled: page <= 1,
            }"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            prev
          </button>
          page: {{ page }}
          <button
            @click="page++"
            :class="{
              disabled: hasNextPage,
            }"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            next
          </button>
        </div>
        <div class="search">
          <input
            v-model="search"
            class="block p-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            type="text"
            placeholder="What to find?" />
        </div>
      </section>

      <template v-if="tickets.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticket in paginatedTick"
            @click="select(ticket)"
            :key="ticket.name"
            :class="{
              'border-2': sel === ticket,
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer">
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticket.name }} - USD
              </dt>
              <dd
                :class="{
                  'text-purple-800': sel === ticket,
                }"
                class="mt-1 text-3xl font-semibold text-gray-900">
                {{ ticket.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="removeTicket(ticket)"
              class="remove-btn flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none">
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="sel" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ sel.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(graph, idx) in normGraph"
            :key="idx"
            :style="{ height: `${graph}%` }"
            class="bg-purple-800 border w-10"></div>
        </div>
        <button @click="sel = null" type="button" class="absolute top-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve">
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script lang="js">
import { subToTicker, unSubFromTicker } from './api';

export default {
  data() {
    return {
      title: '',
      tickets: [],
      coinList: [],
      prompCoins: [],
      sel: null,
      graphs: [],
      errMsg: false,
      page: 1,
      search: ''
    };
  },
  created() {
    this.reFetch();

    const url =  Object.fromEntries(new URL(window.location).searchParams.entries())

    if (url.search) {
      this.search = url.search;
    }
    if (url.page) {
      this.page = url.page
      if (this.page < 1) {
        this.page = 1
      }
    }
  },
  computed: {
    searchedTick() {
      return this.tickets.filter(ticket => ticket.name.includes(this.search.toUpperCase()))
    },
    paginatedTick() {
      const firstEl = 3 * (this.page - 1) ;
      const lastEl = 3 * (this.page)

      if(this.search) {
        return this.searchedTick.slice(firstEl, lastEl)
      } else {
        return this.tickets.slice(firstEl, lastEl)
      }
    },
    hasNextPage() {
      return this.page >= Math.ceil(this.searchedTick.length / 3)
    },
    normGraph() {
      const maxBar = Math.max(...this.graphs);
      const minBar = Math.min(...this.graphs);

      if (maxBar === minBar) {
        return this.graphs.map(() => 50)
      } else {
        return this.graphs.map(price => 5 + ((price - minBar) * 95) / (maxBar - minBar))
      }
    },
    pageStateOptions() {
      return {
        page: this.page,
        search: this.search
      }
    }
  },
  methods: {
    updatePrice(ticket, newPrice) {
      this.tickets.find(ticker => ticker.name === ticket).price = newPrice

      if(this.sel?.name === ticket) {
        this.graphs.push(newPrice)
      }
    },
    reFetch() {
      const ticketsData = localStorage.getItem('crypto-list')

      if (ticketsData) {
        this.tickets = JSON.parse(ticketsData);
        this.tickets.forEach(ticket => {
          subToTicker(ticket.name, newPrice => {
            this.updatePrice(ticket.name, newPrice)
          })
        })
      }
    },
    addTicket() {
      if (this.tickets.find(ticket => ticket.name.toLowerCase() === this.title.toLowerCase())) {
        this.errMsg = true
        return;
      }

      const currentTicket = { id: Date.now(), name: this.title.toUpperCase(), price: '-' };
      this.tickets = [...this.tickets, currentTicket];

      subToTicker(currentTicket.name, newPrice => {
        this.updatePrice(currentTicket.name, newPrice)
      })

      this.title = '';
      this.search = ''
      this.errMsg = false
    },
    removeTicket(t) {
      this.tickets = this.tickets.filter((ticket) => ticket.id != t.id);
      unSubFromTicker(t.name)

      if (t === this.sel) {
        this.sel = null;
      }
    },
    select(t) {
      if(t !== this.sel) {
        this.sel = t;
        this.graphs = []
      }
    },
    async fetchCoins() {
      try {
        const f = await fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true');
        const res = await f.json();1
        const coinsArr = Object.values(res.Data)
        this.coinList = coinsArr
      } catch(e) {
        console.log(e)
      }
    },
    searchCoin() {
      if (this.title.length) {
        const coins = this.coinList.filter(coin => coin.Symbol.toLowerCase().includes(this.title.toLowerCase()))
        this.prompCoins = coins.slice(0, 4)
      } else {
        this.prompCoins = []
      }
    },
    clickOnCoin(e) {
      this.title = e.target.innerText
      this.addTicket()
    }
  },
  mounted() {
    this.fetchCoins();
  },
  watch: {
    tickets() {
      localStorage.setItem('crypto-list', JSON.stringify(this.tickets))
    },
    paginatedTick() {
      if (this.paginatedTick.length === 0 && this.page > 1) {
        this.page--
      }
    },
    title() {
      this.searchCoin()
    },
    pageStateOptions(value) {
      this.paginatedTick;
      window.history.pushState(null, document.title, `${window.location.pathname}?search=${value.search}&page=${value.page}`)
    },
    search() {
      this.page = 1
    }
  }
};
</script>

<style lang="scss" scoped></style>
