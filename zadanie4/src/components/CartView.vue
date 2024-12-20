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
    },
    async deleteProduct(productId) {
      console.log("Deleted: " + productId)

      // Usuń produkt z lokalnego koszyka
      this.cart = this.cart.filter(item => item.id !== productId);

      // Zaktualizuj koszyk w localStorage
      const updatedCart = this.cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      alert('Product deleted from cart successfully!');
    },
    async finalizeOrder() {

    },
    updateQuantity(productId, newQuantity) {
      console.log(`Updating product ID ${productId} to quantity ${newQuantity}`);

      // Znajdź produkt w koszyku i zaktualizuj ilość oraz cenę
      const product = this.cart.find(item => item.id === productId);
      if (product) {
        product.quantity = newQuantity;
        product.price = product.product._price * newQuantity;
      }

      // Zaktualizuj koszyk w localStorage
      const updatedCart = this.cart.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      console.log('Cart updated in localStorage:', updatedCart);
    }
  }
};
</script>

<template>
  <h1 class="text-center">Cart</h1>

  <table class="table table-striped">
    <thead>
    <tr>
      <th>Name</th>
      <th>Price</th>
      <th></th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="product in this.cart" :key="cart.id">
      <td>{{product.product._name}}</td>
      <td>{{product.price}} PLN</td>
      <td>
        <label for="change-quantity" class="form-label">Change quantity</label>
        <input id="change-quantity" type="number" class="form-control w-50" v-model.number="product.quantity" min="1" @input="updateQuantity(product.id, product.quantity)"/>
      </td>
      <td>
        <img src="@/assets/delete.png" alt="Delete" width="32px" @click="deleteProduct(product.id)" class="align-bottom">
      </td>
    </tr>
    </tbody>
  </table>
  <button class="btn btn-primary" @click="finalizeOrder">Finalize order</button>

</template>

<style>
body {
  background-color: #f8f9fa;
}
</style>