<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeSection: 'orders',
      orders: [],
      orderStatuses: [],
      selectedStatus: '',
      opinion: '',
      opinionOrderId: null,
    };
  },
  created() {
    this.fetchOrders();
    this.fetchOrderStatuses();
  },
  methods: {

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

    async fetchOrders() {
      try {
        const userId = this.getCookie("id");

        const response = await axios.get("http://localhost:3000/orders");
        console.log("fetchin orders for user:" + userId);
        // this.orders = response.data.filter(order => order.User_Id === userId);
        this.orders = await response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async fetchOrderStatuses() {
      try {
        const response = await axios.get("http://localhost:3000/status");
        this.orderStatuses = response.data.map((status) => status._currentStatus);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    },
    filterOrdersByStatus() {
      return this.orders.filter((order) => {
        return this.selectedStatus ? order.status === this.selectedStatus : true;
      });
    },
    openOpinionModal(orderId) {
      this.opinionOrderId = orderId;
      this.opinion = '';
    },
    async submitOpinion() {
      try {
        if (!this.opinion.trim()) {
          alert("Opinion cannot be empty.");
          return;
        }

        const response = await axios.post(`http://localhost:3000/orders/${this.opinionOrderId}/opinions`, {
          opinion: this.opinion,
        });

        alert(response.data.message || "Opinion submitted successfully!");
        this.opinionOrderId = null;
      } catch (error) {
        console.error("Error submitting opinion:", error);
        alert("Failed to submit opinion. Please try again.");
      }
    },
  },
};
</script>

<template>
  <div class="container mt-5">
    <h1 class="my-4 text-center">Client Dashboard</h1>

    <div v-if="activeSection === 'orders'">
      <h2>Your Orders</h2>

      <!-- Filter by Status -->
      <div class="mb-3">
        <label for="statusFilter" class="form-label">Filter by Status:</label>
        <select id="statusFilter" class="form-select" v-model="selectedStatus">
          <option value="">All statuses</option>
          <option v-for="status in orderStatuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <!-- Orders Table -->
      <table class="table table-bordered">
        <thead>
        <tr>
          <th>Order ID</th>
          <th>Products</th>
          <th>Total Price</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in filterOrdersByStatus()" :key="order._id">
          <td>{{ order._id }}</td>
          <td>
            <ul>
              <li v-for="product in order.productList" :key="product._id">
                {{ product._product._name }} - {{ product._product._price }}$
              </li>
            </ul>
          </td>
          <td>{{ order._totalPrice }} PLN</td>
          <td>{{ order.status }}</td>
          <td>
            <!-- Opinion Button -->
            <button
                v-if="['Executed', 'Cancelled'].includes(order.status)"
                class="btn btn-secondary btn-sm"
                @click="openOpinionModal(order._id)"
            >
              Leave Opinion
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Opinion Modal -->
    <div v-if="opinionOrderId" class="modal d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Leave an Opinion</h5>
            <button type="button" class="btn-close" @click="opinionOrderId = null"></button>
          </div>
          <div class="modal-body">
            <textarea
                v-model="opinion"
                class="form-control"
                placeholder="Write your opinion here..."
                rows="5"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="opinionOrderId = null">Cancel</button>
            <button class="btn btn-primary" @click="submitOpinion">Submit Opinion</button>
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
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  display: block;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.modal-dialog {
  margin: 10% auto;
}
</style>
