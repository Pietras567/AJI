<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      categories: [],
      editedProduct: null,
      filterCategory: '',
      filterName: '',
      filteredProducts: [],
      activeSection: 'products',
      orders: [],
      orderStatuses: [],
      selectedStatus: null,
      validationError: null,
      isAddProductSectionVisible: false,
      productName: '',
      price: 0,
      weight: 0,
      category: '',
      description: '',
      AddProductdata: undefined,
    };
  },
  created() {
    this.fetchProducts();
    this.fetchCategories();
    this.fetchOrderStatuses();
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('http://localhost:3000/products');
        this.products = response.data;
        this.filteredProducts = this.products;
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    },
    async fetchCategories() {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        //response.data.forEach((element) => this.categories.push(element._name));
        this.categories = response.data;
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    },
    startEditing(product) {
      this.editedProduct = {...product};
    },
    cancelEditing() {
      this.editedProduct = null;
    },
    async saveProduct() {
      try {
        const response = await axios.put(
            `http://localhost:3000/products/${this.editedProduct._id}`,
            this.editedProduct, {
              headers: {
                'Content-Type': 'application/json'
              },
              withCredentials: true,
            }
        );
        const updatedProduct = response.data;

        await this.fetchProducts();


        this.filteredProducts = this.products;
        this.editedProduct = null;
        alert('Product updated successfully!');
      } catch (error) {
        console.error('Error saving product: ', error);
        alert('Failed to update product.');
      }
    },
    filterProducts() {
      this.filteredProducts = this.products.filter((product) => {
        const matchesName = product._name
            .toLowerCase()
            .includes(this.filterName.toLowerCase());
        const matchesCategory = this.filterCategory
            ? product._category._name === this.filterCategory
            : true;
        return matchesName && matchesCategory;
      });
    },

    async optimizeDescription(productId) {
      try {
        const response = await axios.get(
            `http://localhost:3000/products/${productId}/seo-description`
        );
        if (response.status === 200) {

          this.editedProduct._description = response.data;
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error optimizing description:", error);
      }
    },


    handleFileUpload(event) {
      const file = event.target.files[0];
      this.uploadedFile = file;
      this.validationError = null;
    },

    async initializeDatabase() {
      if (!this.uploadedFile) {
        alert("Please upload a file first.");
        return;
      }

      try {
        const fileContent = await this.readFile(this.uploadedFile);

        const productData = JSON.parse(fileContent);

        if (!Array.isArray(productData) || productData.length === 0) {
          throw new Error("Invalid JSON format. Expecting an array of products.");
        }

        // productData.forEach((product) => {
        //   if (
        //       !product._name ||
        //       !product._description ||
        //       product._price <= 0 ||
        //       product._weight <= 0 ||
        //       !product.categoryId
        //   ) {
        //     throw new Error(
        //         "Each product must have a valid name, description, price, weight, and categoryId."
        //     );
        //   }
        // });

        const response = await axios.post("http://localhost:3000/init", fileContent);

        alert(response.data.message || "Database initialized successfully.");
      } catch (error) {
        this.validationError = error.message;
        console.error("Error:", error);
      }
    },

    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject("Error reading file.");
        reader.readAsText(file);
      });
    },


    switchSection(section) {
      this.activeSection = section;
      if (section === 'orders') {
        this.fetchOrders();
      }
    },
    async fetchOrders() {
      try {
        const response = await axios.get("http://localhost:3000/orders");
        this.orders = response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async fetchOrderStatuses() {
      try {
        const response = await axios.get("http://localhost:3000/status");
        console.log(response.data);
        //response.data.forEach((status) => this.orderStatuses.push(status._currentStatus));
        this.orderStatuses = response.data;
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    },
    async filterOrdersByStatus(statusId) {
      try {
        const response = await axios.get(`http://localhost:3000/orders/status/${statusId}`);
        this.orders = response.data;
      } catch (error) {
        console.error("Error filtering orders:", error);
      }
    },
    async updateOrderStatus(orderId, statusId) {
      try {
        console.log(orderId)
        console.log(statusId)
        console.log(this.orders)

        await axios.patch(`http://localhost:3000/orders/${orderId}`, {
          statusId: statusId,

        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        }).then(function (response) {
          console.log(response);
          if (response.status === 200) {
            const updatedOrder = response.data;

            // Update local state
            this.orders = this.orders.map(order =>
                order._id === orderId ? updatedOrder : order
            );
          }
          if (response.status === 401) {
            // logout
            document.cookie = 'authToken=; Max-Age=0';
            document.cookie = 'type=; Max-Age=0';
            document.cookie = 'id=; Max-Age=0';
            this.$router.push('/authentication');
          }
        }).catch(function (error) {
          console.log(error);
        });

      } catch (error) {
        console.error("Error updating order status:", error);
      }
    },

    toggleAddProductSection() {
      this.isAddProductSectionVisible = !this.isAddProductSectionVisible;
    },
    async submitAddProduct() {
      console.log("POST product");
      this.$emit('submitAddProduct', this.productName);
      console.log(this.productName)

      this.$emit('submitAddProduct', this.price);
      console.log(this.price)

      this.$emit('submitAddProduct', this.weight);
      console.log(this.weight)

      this.$emit('submitAddProduct', this.category);
      console.log(this.category)

      this.$emit('submitAddProduct', this.description);
      console.log(this.description)

      await axios.post('http://localhost:3000/products', {
        _name: this.productName,
        _description: this.description,
        _price: this.price,
        _weight: this.weight,
        categoryId: this.category,
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }).then(function (response) {
        console.log(response);
        if (response.status === 200) {
          this.$refs.form.reset();
        }
        if (response.status === 401) {
          // logout
          document.cookie = 'authToken=; Max-Age=0';
          document.cookie = 'type=; Max-Age=0';
          document.cookie = 'id=; Max-Age=0';
          this.$router.push('/authentication');
        }
      }).catch(function (error) {
        console.log(error);
      });

    },
  },

  watch: {
    filterName() {
      this.filterProducts();
    },
    filterCategory() {
      this.filterProducts();
    },

  },
};
</script>

<template>
  <div class="container mt-5">
    <h1 class="my-4 text-center">Manager Dashboard</h1>


    <div class="btn-group mb-3" role="group" aria-label="View Switcher">
      <button
          class="btn btn-primary"
          :class="{ active: activeSection === 'products' }"
          @click="switchSection('products')"
      >
        Products Management
      </button>
      <button
          class="btn btn-primary"
          :class="{ active: activeSection === 'orders' }"
          @click="switchSection('orders')"
      >
        Orders Management
      </button>
    </div>

    <div v-if="activeSection === 'products'">
      <h2>Products Management</h2>
      <div>
        <button @click="toggleAddProductSection">
          {{ isAddProductSectionVisible ? 'Hide section' : 'Add product' }}
        </button>
        <transition name="slide">
          <div v-if="isAddProductSectionVisible" class="section">
            Adding product form.
            <form>
              <!--Name-->
              <div>Name: <!--{{ productName }}--></div>
              <input v-model="productName" placeholder="Write name" />

              <!--Price-->
              <p>Price: <!--{{ price }}--></p>
              <input v-model.number="price" placeholder="Write price" />

              <!--Weight-->
              <p>Weight: <!--{{ weight }}--></p>
              <input v-model.number="weight" placeholder="Write weight" />

              <!--Category-->
              <div>Category: <!--{{ category }}--></div>
              <select v-model="category">
                <option disabled value="">Please select one</option>
                <option v-for="(item) in categories" :value="item._id">
                  {{item._name}}
                </option>
              </select>

              <!--Description-->
              <div>Description:</div>
              <!--<div style="white-space: pre-line;">{{ description }}</div>-->
              <textarea v-model="description" placeholder="write description"></textarea>

              <div>
                <button type="submit" @click="submitAddProduct">Submit</button>
              </div>
            </form>
          </div>
        </transition>
      </div>
      <div>
        <div>
          <label for="file-upload" class="form-label">Upload Product JSON File:</label>
          <input type="file" id="file-upload" class="form-control" @change="handleFileUpload"/>
        </div>

        <!--      <div v-if="validationError" class="text-danger mt-2">-->
        <!--        <strong>Error:</strong> {{ validationError }}-->
        <!--      </div>-->

        <button class="btn btn-primary mt-3" @click="initializeDatabase()">
          Initialize Database
        </button>
      </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <label for="filter-name" class="form-label">Filter by Name:</label>
        <input
            id="filter-name"
            type="text"
            class="form-control"
            v-model="filterName"
            placeholder="Enter product name"
        />
      </div>
      <div class="col-md-6">
        <label for="filter-category" class="form-label">Filter by Category:</label>
        <select id="filter-category" class="form-select" v-model="filterCategory">
          <option value="">All Categories</option>
          <option
              v-for="category in categories"
              :key="category"
              :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <table class="table table-striped">
      <thead>
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>Weight</th>
        <th>Category</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="product in filteredProducts"
          :key="product._id"
      >
        <td>
          <template v-if="editedProduct && editedProduct._id === product._id">
            <input
                type="text"
                class="form-control"
                v-model="editedProduct._name"
            />
          </template>
          <template v-else>{{ product._name }}</template>
        </td>
        <td>
          <template v-if="editedProduct && editedProduct._id === product._id">
            <input
                type="number"
                class="form-control"
                v-model="editedProduct._price"
            />
          </template>
          <template v-else>{{ product._price }} PLN</template>
        </td>
        <td>
          <template v-if="editedProduct && editedProduct._id === product._id">
            <input
                type="number"
                class="form-control"
                v-model="editedProduct._weight"
            />
          </template>
          <template v-else>{{ product._weight }} kg</template>
        </td>
        <td>
          <template v-if="editedProduct && editedProduct._id === product._id">
            <select
                class="form-select"
                v-model="editedProduct._category._name"
            >
              <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
              >
                {{ category }}
              </option>
            </select>
          </template>
          <template v-else>{{ product._category._name }}</template>
        </td>
        <td>
          <template v-if="editedProduct && editedProduct._id === product._id">
              <textarea
                  class="form-control"
                  v-model="editedProduct._description"
              ></textarea>

            <button
                class="btn btn-secondary btn-sm"
                @click="optimizeDescription(product._id)"
            >
              Optimize Description
            </button>

          </template>
          <template v-else>{{ product._description }}</template>
        </td>
        <td>
          <template v-if="editedProduct && editedProduct._id === product._id">
            <!--            <button class="btn btn-info btn-sm" @click="optimizeDescription(editedProduct)">Optimise description</button>/-->
            <button class="btn btn-success" @click="saveProduct">Save</button>
            <button class="btn btn-secondary" @click="cancelEditing">Cancel</button>

          </template>
          <template v-else>
            <button
                class="btn btn-primary"
                @click="startEditing(product)"
            >
              Edit
            </button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>

    </div>

    <div v-if="activeSection === 'orders'">
      <h2>Orders Management</h2>

      <div class="mb-3">
        <label for="statusFilter" class="form-label">Filter by Status:</label>
        <select id="statusFilter" class="form-select" v-model="selectedStatus">
          <option value="">All statuses</option>
          <option
              v-for="_status in orderStatuses"
              :key="_status"
              :value="_status">
            {{ _status._currentStatus }}
          </option>
        </select>
      </div>

      <!-- Orders Table -->
      <table class="table table-bordered">
        <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Products</th>
          <th>Total Price</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in orders" :key="order._id">
          <td>{{ order._id }}</td>
          <td>{{ order._user._userName }}</td>
          <td>
            <ul>
              <li v-for="product in order.productList" :key="product._id">
                {{ product._product._name }} - {{ product._product._price }}$
              </li>
            </ul>
          </td>
          <td>{{ order._totalPrice }}</td>
          <td>
            <select
                class="form-select"
                v-model="order._status"
                @change="updateOrderStatus(order._id, order._status._id)"
            >
              <option v-for="_status in orderStatuses" :key="_status" :value="_status">
                {{ _status._currentStatus }}
              </option>
            </select>
          </td>
          <td>
            <!-- Add any additional actions here -->
            <button class="btn btn-danger btn-sm" @click="updateOrderStatus(order._id, this.orderStatuses.find(status => status._currentStatus === 'Cancelled')._id)">
              Cancel Order
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>


  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
}
.section {
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  margin-top: 10px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 200px; /* Dopasuj wysokość do treści */
  opacity: 1;
}
</style>
