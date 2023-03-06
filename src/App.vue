<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <AddSection
        :errMsg="errMsg"
        @keyDownInput="errMsg = false"
        @addTicket="addTicket" />
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

      <template v-if="tickets.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticket in paginatedTick"
            @click="select(ticket)"
            :key="ticket.name"
            :class="{
              'border-2': sel === ticket,
              'bg-red-200': ticket.price === '-',
              'bg-white': ticket.price !== '-',
            }"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer">
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
      <CryptoGraph
        v-if="sel"
        @clickClose="sel = null"
        :lastPrice="lastPrice"
        :sel="sel" />
    </div>
  </div>
</template>

<script lang="js">
import { subToTicker, unSubFromTicker } from './api';
import AddSection from './components/AddSection.vue'
import CryptoGraph from './components/CryptoGraph.vue'

export default {
  components: {
    AddSection,
    CryptoGraph
  },
  data() {
    return {
      lastPrice: 0,
      tickets: [],

      sel: null,

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
      this.lastPrice = Number(newPrice);
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
    addTicket(ticketName) {
      if (this.tickets.find(ticket => ticket.name.toLowerCase() === ticketName.toLowerCase())) {
        this.errMsg = true
        return;
      }

      const currentTicket = { id: Date.now(), name: ticketName.toUpperCase(), price: '-', exist: true };
      this.tickets = [...this.tickets, currentTicket];

      subToTicker(currentTicket.name, newPrice => {
        this.updatePrice(currentTicket.name, newPrice)
      })

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

      this.$nextTick().then(this.calculateNumOfGraphs)
    },
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
    pageStateOptions(value) {
      this.paginatedTick;
      window.history.pushState(null, document.title, `${window.location.pathname}?search=${value.search}&page=${value.page}`)
    },
    search() {
      this.page = 1
    },
  }
};
</script>

<style lang="scss" scoped></style>
