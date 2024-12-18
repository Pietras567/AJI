<script>
import axios from "axios";

export default {
  data() {
    return {
    };
  },
  created() {
    this.finalizeCart();
  },
  methods: {
    async finalizeCart() {
      try {
        console.log("cart hello world");
      } catch (error) {
        console.error('Error loading cart: ', error);
      }
    }
  }
};
</script>

<template>
  <h1>Chart View</h1>
</template>

<style scoped>

</style>