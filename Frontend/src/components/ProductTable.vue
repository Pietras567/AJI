<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      showPopup: false,
      selectedProductId: null,
      expandedProductId: null,
      quantity: 1,
      sortBy: null,
      sortOrder: 'asc',
      categories: [],
      filterCategory: '',
      filterName: '',
      filteredProducts: [],
      opinions: [],
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

        this.filteredProducts = this.products;

        const response2 = await axios.get('http://localhost:3000/categories');
        response2.data.forEach((element) => this.categories.push(element._name));
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    },
    addToCart() {
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
    },
    filterProducts() {
      this.filteredProducts = this.products.filter(product => {
        const matchesName = product._name.toLowerCase().includes(this.filterName.toLowerCase());
        const matchesCategory = this.filterCategory ? product._category._name === this.filterCategory : true;
        return matchesName && matchesCategory;
      });
      this.sortProducts();
    },
    toggleDescription(productId) {
      // Jeśli kliknięto ten sam produkt, zwinie się sekcja, w przeciwnym razie pokaże nową
      if (this.products.some(product => product._id === productId)) {
        this.fetchOpinions(productId);
        this.expandedProductId = this.expandedProductId === productId ? null : productId;
        console.log(this.opinions)
      } else {
        console.error('Product not found for the given ID:', productId);
      }
    },
    async fetchOpinions(productId) {
      try {
        const response = await axios.get(`http://localhost:3000/opinions/${productId}`);
        this.opinions = response.data;
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching opinions:", error);
        this.opinions = [];
      }
    },
  },
  watch: {
    sortBy() {
      this.sortProducts();
    },
    sortOrder() {
      this.sortProducts();
    },
    filterName() {
      this.filterProducts();
    },
    filterCategory() {
      this.filterProducts();
    }
  }

};

</script>

<template>
  <div class="container mt-5">
    <h1 class="my-4 text-center">Product list</h1>


    <div class="row mb-3">
      <div class="col-md-6">
        <label for="filter-name" class="form-label">Filter by Name:</label>
        <input id="filter-name" type="text" class="form-control" v-model="filterName" placeholder="Enter product name" />
      </div>
      <div class="col-md-6">
        <label for="filter-category" class="form-label">Filter by Category:</label>
        <select id="filter-category" class="form-select" v-model="filterCategory">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </div>
    </div>


    <div class="row mb-3">
      <div class="col-md-6">
        <label for="sort-by" class="form-label">Sort by:</label>
        <select id="sort-by" class="form-select" v-model="sortBy">
          <option value="_name">Name</option>
          <option value="_description">Description</option>
          <option value="_price">Price</option>
          <option value="_weight">Weight</option>
        </select>
      </div>
      <div class="col-md-6">
        <label for="sort-order" class="form-label">Order:</label>
        <select id="sort-order" class="form-select" v-model="sortOrder">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>

    <table class="table table-striped">
      <thead>
        <tr class="grid-row">
          <th>Name</th>
          <th>Price</th>
          <th>Weight</th>
          <th>Category</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in filteredProducts" :key="product._id" class="grid-row">
          <td>{{product._name}}</td>
          <td>{{product._price}} PLN</td>
          <td>{{product._weight}} kg</td>
          <td>{{product._category._name}}</td>
          <td>
            <img src="../assets/add-to-cart-svg.svg"  alt="Add to cart" class="btn p-1 img-fluid" @click="openPopup(product._id)" style="max-width: 32px;" />
          </td>
          <td>
            <img src="../assets/info-svg.svg"  alt="Info" class="btn p-1 img-fluid" @click="toggleDescription(product._id)" style="max-width: 32px;" />
          </td>

          <!-- Rozwinięty opis -->
          <td v-if="expandedProductId === product._id" class="break-line bg-light">
            <p><strong>Description:</strong> {{ product._description }}</p>
            <hr />
            <!-- Wyświetlanie opinii -->
            <div v-if="opinions && opinions.length > 0">
              <h4>Opinions:</h4>
              <div v-for="opinion in opinions" :key="opinion.id">
                <p><strong>Rating:</strong> {{ opinion.rating }} / 5 ★</p>
                <p><strong>Comment:</strong> {{ opinion.content }}</p>
                <hr />
              </div>
            </div>
            <div v-else>
              <p>No opinions available for this product.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPopup" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Select Quantity</h3>
            <button type="button" class="btn-close" @click="closePopup"></button>
          </div>
          <div class="modal-body">
            <input type="number" class="form-control" v-model="quantity" min="1" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-success" @click="addToCart">Confirm</button>
            <button class="btn btn-secondary" @click="closePopup">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.grid-row:hover {
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}

th {
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.9rem;
  height: 100%;
}

td {
  padding: 0.75rem;
  vertical-align: middle;
  min-height: 100%;
}

.break-line {
  grid-column: 1 / -1;
  padding: 1rem;
  margin: 0.5rem 0;
  background-color: #ffffff;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
</style>