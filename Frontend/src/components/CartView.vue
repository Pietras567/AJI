<script>
import axios from "axios";

export default {
  data() {
    return {
      cart: [],
      orderStatuses: [],
      deliveryInfo: {
        address: "",
        postalCode: "",
        city: "",
      },
    };
  },
  created() {
    this.finalizeCart();
    this.fetchOrderStatuses();
  },

  computed: {
    isFormValid() {
      return (
          this.deliveryInfo.address &&
          this.deliveryInfo.postalCode &&
          this.deliveryInfo.city
      );
    }
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
          withCredentials: true,
        });
        if (response.status === 200 || response.status === 201) {
          console.log(response);

          this.cart = [];
          localStorage.removeItem('cart');
          alert('Order finalized and cart cleared!');

        }
      } catch (error) {
        console.error('Error finalizing order:', error);
        alert('Failed to finalize the order. Please try again.');

        if (error.status === 401) {
          // logout
          document.cookie = 'authToken=; Max-Age=0';
          document.cookie = 'type=; Max-Age=0';
          document.cookie = 'id=; Max-Age=0';
          this.$router.push('/authentication');
        }
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
        <img src="@/assets/delete.svg" alt="Delete" width="32px" @click="deleteProduct(product.id)" class="align-bottom">
      </td>
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