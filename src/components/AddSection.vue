<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="title"
            @keydown.enter="addTicket"
            @keydown.capture="$emit('keyDownInput', false)"
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
    <AddButton @click="addTicket" />
  </section>
</template>

<script>
import AddButton from './AddButton.vue';
import { fetchAllCoins } from '../api';

export default {
  components: {
    AddButton,
  },
  data() {
    return {
      title: '',

      coinList: [],
      prompCoins: [],
    };
  },
  props: {
    errMsg: Boolean,
  },
  methods: {
    addTicket() {
      this.$emit('addTicket', this.title);
      this.title = '';
    },
    searchCoin() {
      if (this.title.length) {
        const coins = this.coinList.filter((coin) =>
          coin.Symbol.toLowerCase().includes(this.title.toLowerCase())
        );
        this.prompCoins = coins.slice(0, 4);
      } else {
        this.prompCoins = [];
      }
    },
    clickOnCoin(e) {
      this.title = e.target.innerText;
      this.addTicket();
    },
  },
  mounted() {
    fetchAllCoins().then((coins) => (this.coinList = coins));
  },
  watch: {
    title() {
      this.searchCoin();
    },
  },
};
</script>

<style lang="sass" scoped></style>
