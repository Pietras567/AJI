<script>
import axios from "axios";

export default {
  data() {
    return {
      cart: [],
      orderStatuses: [],
    };
  },
  created() {
    this.finalizeCart();
    this.fetchOrderStatuses();
  },
  methods: {
    async fetchOrderStatuses() {
      try {
        const response = await axios.get("http://localhost:3000/status");
        console.log(response.data);
        //response.data.forEach((status) => this.orderStatuses.push(status._currentStatus));
        this.orderStatuses = response.data;
        console.log(this.orderStatuses)
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    },
    setCookie(name, value, hours) {
      const d = new Date();
      d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
      const expires = "expires=" + d.toUTCString();
      document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },
    getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
      return null;
    },
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
        console.log(this.cart);
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
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const products = cart.map(product => ({
        productId: product.id,
        quantity: product.quantity
      }));

      if (products.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/orders', {
          statusId: 1,
          userId: this.getCookie("id"),
          orderDate: new Date().toISOString(),
          products: products,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200 || response.status === 201) {
          console.log(response);

          this.cart = [];
          localStorage.removeItem('cart');
          alert('Order finalized and cart cleared!');
          // this.$refs.form.reset();
          // return;

        }
      } catch (error) {
        console.error('Error finalizing order:', error);
        alert('Failed to finalize the order. Please try again.');
      }
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