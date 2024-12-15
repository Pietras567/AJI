<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: []
    };
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('http://localhost:3000/products');
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    }
  }
};

</script>

<template>
  <div class="container">
    <h1 class="my-4">Product list</h1>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Nazwa</th>
          <th>Opis</th>
          <th>Cena</th>
          <th>Waga</th>
          <th>Kategoria</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product._id">
          <td>{{product._name}}</td>
          <td>{{product._description}}</td>
          <td>{{product._price}} PLN</td>
          <td>{{product._weight}} kg</td>
          <td>{{product._category._name}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>