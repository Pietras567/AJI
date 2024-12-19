<script>
import axios from "axios";

export default {
  data() {
    return {
      cart: []
    };
  },
  created() {
    this.finalizeCart();
  },
  methods: {
    async finalizeCart() {
      try {
        console.log("cart hello world");
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        for (const element of cart) {
          console.log("id: "  + element.id + ", quantity: " + element.quantity)
          const response = await axios.get(`http://localhost:3000/products/${element.id}`);
          this.cart.push({id: element.id, quantity: element.quantity, product: response.data, price: response.data._price * element.quantity});
        }
        this.cart.forEach((element) => console.log(element))
      } catch (error) {
        console.error('Error loading cart: ', error);
      }
    }
  }
};
</script>

<template>
  <h1>Chart View</h1>

  <table class="table table-striped">
    <thead>
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th>Quantity</th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="product in this.cart" :key="cart.id">
      <td>{{product.product._name}}</td>
      <td>{{product.price}} PLN</td>
      <td>{{product.quantity}}</td>
      <td>
        <label for="change-quantity" class="form-label">Change quantity</label>
        <input id="change-quantity" type="number" class="form-control" v-model="product.quantity" min="1" />
      </td>
    </tr>
    </tbody>
  </table>

</template>

<style>
body {
  background-color: #f8f9fa;
}
</style>