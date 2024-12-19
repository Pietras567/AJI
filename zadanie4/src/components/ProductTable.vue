<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      showPopup: false,
      selectedProductId: null,
      quantity: 1,
      sortBy: null,
      sortOrder: 'asc'
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
    },
    addToCart() {
      //console.log(text);
      //console.log(quantity);

      if (this.quantity <= 0) {
        alert('Quantity must be greater than 0');
        return;
      }

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = cart.find(item => item.id === this.selectedProductId);

      if (existingProduct) {
        existingProduct.quantity += this.quantity;
      } else {
        cart.push({ id: this.selectedProductId, quantity: this.quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      this.closePopup();
      alert('Product added to cart successfully!');
    },
    openPopup(productId) {
      this.selectedProductId = productId;
      this.quantity = 1; // Reset quantity when opening the popup
      this.showPopup = true;
    },
    closePopup() {
      this.showPopup = false;
      this.selectedProductId = null;
    },
    sortProducts() {
      if (this.sortBy) {
        this.products.sort((a, b) => {
          let valA = a[this.sortBy];
          let valB = b[this.sortBy];

          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();

          if (this.sortOrder === 'asc') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
          } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
          }
        });
      }
    }},
    watch: {
      sortBy() {
        this.sortProducts();
      },
      sortOrder() {
        this.sortProducts();
      }
    }

};

</script>

<template>
  <div class="container">
    <h1 class="my-4">Product list</h1>

    <div class="sorting-controls mb-3">
      <label for="sort-by">Sort by:</label>
      <select id="sort-by" v-model="sortBy">
        <option value="_name">Name</option>
        <option value="_description">Description</option>
        <option value="_price">Price</option>
        <option value="_weight">Weight</option>
      </select>

      <label for="sort-order">Order:</label>
      <select id="sort-order" v-model="sortOrder">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Weight</th>
          <th>Category</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product._id">
          <td>{{product._name}}</td>
          <td>{{product._description}}</td>
          <td>{{product._price}} PLN</td>
          <td>{{product._weight}} kg</td>
          <td>{{product._category._name}}</td>
          <td>
            <button @click="openPopup(product._id)">Add to cart</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="popup-overlay">
      <div class="popup">
        <h3>Select Quantity</h3>
        <input type="number" v-model="quantity" min="1" />
        <div class="popup-actions">
          <button @click="addToCart">Confirm</button>
          <button @click="closePopup">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.popup-actions button {
  margin: 5px;
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>