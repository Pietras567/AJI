<script>
import axios from "axios";
import { useCartStore } from '@/stores/cartStore'
import { mapState, mapActions } from 'pinia'

export default {
  data() {
    return {
      orderStatuses: [],
    };
  },
  created() {
    this.initializeCart();
    this.fetchOrderStatuses();
  },

  computed: {
    ...mapState(useCartStore, ['items', 'deliveryInfo', 'cartData', 'totalPrice']),
    isFormValid() {
      return (
          this.deliveryInfo.address &&
          this.deliveryInfo.postalCode &&
          this.deliveryInfo.city
      );
    }
  },

  methods: {
    useCartStore,
    ...mapActions(useCartStore, [
      'removeFromCart',
      'updateQuantity',
      'finalizeOrder',
      'clearCart',
      'fetchProducts',
    ]),

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

    async initializeCart() {
      try {
        await this.fetchProducts();
      } catch (error) {
        console.error('Error loading cart: ', error);
      }
    },

    validateAndSubmit() {
      if (this.isFormValid) {
        console.log("Form is valid. Proceeding to finalize order.");
        this.finalizeOrder();
      } else {
        alert("Please fill in all required fields before proceeding.");
      }
    },

    async deleteProduct(productId) {
      console.log("Deleted: " + productId)
      await this.removeFromCart(productId);
      alert('Product deleted from cart successfully!');
    },

    async finalizeOrder() {
      try {
        let finalized = await useCartStore().finalizeOrder(this.getCookie("id"));
        if (finalized) {
          alert('Order finalized and cart cleared!');
          this.$router.push('/cart');
        } else {
          alert('Failed to finalize the order. Please try again.');
        }
      } catch (error) {
        console.error('Error finalizing order:', error);
        alert('Failed to finalize the order. Please try again.');
      }
    },

    updateQuantity(productId, newQuantity) {
      console.log(`Updating product ID ${productId} to quantity ${newQuantity}`);
      useCartStore().updateQuantity(productId, newQuantity);

      console.log('Cart updated in component. Cart data is now:');
      console.log(this.cartData);
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
    <tr v-for="product in cartData" :key="product.id">
      <td>{{product.product._name}}</td>
      <td>{{product.price}} PLN</td>
      <td>
        <label for="change-quantity" class="form-label">Change quantity</label>
        <input id="change-quantity" type="number" class="form-control w-50" v-model.number="product.quantity" min="1" @input="updateQuantity(product.id, product.quantity)"/>
      </td>
      <td>
        <img src="@/assets/delete.svg" alt="Delete" width="32px" @click="deleteProduct(product.id)" class="align-bottom">
      </td>
    </tr>
    <tr class="text-end">
      Tolal price: {{totalPrice}} PLN
    </tr>
    </tbody>
  </table>
  <div class="delivery-form mt-4">
    <h2>Delivery Information</h2>
    <form @submit.prevent="validateAndSubmit">
      <div class="mb-3">
        <label for="address" class="form-label">Address</label>
        <input
            type="text"
            id="address"
            class="form-control"
            v-model="deliveryInfo.address"
            placeholder="Enter your address"
            required
        />
      </div>
      <div class="mb-3">
        <label for="postalCode" class="form-label">Postal Code</label>
        <input
            type="text"
            id="postalCode"
            class="form-control"
            v-model="deliveryInfo.postalCode"
            placeholder="Enter your postal code"
            required
        />
      </div>
      <div class="mb-3">
        <label for="city" class="form-label">City</label>
        <input
            type="text"
            id="city"
            class="form-control"
            v-model="deliveryInfo.city"
            placeholder="Enter your city"
            required
        />
      </div>

    </form>
  </div>

  <button
      class="btn btn-primary"
      :disabled="!isFormValid"
      @click="finalizeOrder"
  >
    Finalize Order
  </button>
</template>

<style>
body {
  background-color: #f8f9fa;
}
</style>