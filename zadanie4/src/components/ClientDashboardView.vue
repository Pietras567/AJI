<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeSection: 'orders',
      orders: [],
      opinions: [],
      orderStatuses: [],
      selectedStatus: '',
      opinion: '',
      rating: 0,
      selectedOrderDate: "",
      opinionOrderId: null,
    };
  },
  created() {
    this.fetchOrders();
    this.fetchOrderStatuses();
    this.fetchOpinions();
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
        console.log("fetchin orders for user:" + userId);
        const response = await axios.get(`http://localhost:3000/orders/clients/${userId}`);
        this.orders = await response.data;
        console.log(this.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async fetchOrderStatuses() {
      try {
        const response = await axios.get("http://localhost:3000/status");
        this.orderStatuses = response.data.map((status) => status._currentStatus);
        console.log(this.orderStatuses);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    },

    async fetchOpinions() {
      try {
        const response = await axios.get("http://localhost:3000/opinions", {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        });
        this.opinions = await response.data;
        console.log(this.opinions);
      } catch (error) {
        console.error("Error fetching opinions:", error);
      }
    },
    hasOpinion(orderId) {
      // Sprawdza, czy istnieje opinia dla danego zamówienia
      return this.opinions.some(opinion => opinion.orderId === orderId);
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
    setRating(star) {
      this.rating = star;
    },
    async submitOpinion() {
      try {
        if (!this.rating || this.opinion.trim() === "") {
          alert("Opinion cannot be empty.");
          return;
        }

        const response = await axios.post(`http://localhost:3000/orders/${this.opinionOrderId}/opinions`, {
          content: this.opinion,
          rating: this.rating,
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        });

        alert(response.data.message || "Opinion submitted successfully!");
        this.opinionOrderId = null;
        this.rating = 0;
        this.opinion = "";
        location.reload();
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

    <div class="mb-4 text-center">
      <button
          class="btn btn-primary me-2"
          :class="{ active: activeSection === 'orders' }"
          @click="activeSection = 'orders'; fetchOrders()"
      >
        Orders
      </button>
      <button
          class="btn btn-primary"
          :class="{ active: activeSection === 'opinions' }"
          @click="activeSection = 'opinions'; fetchOpinions()"
      >
        Opinions
      </button>
    </div>

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
          <td>{{ order._status._currentStatus }}</td>
          <td>
            <!-- Opinion Button -->
            <button
                v-if="['Executed', 'Cancelled'].includes(order._status._currentStatus) && !hasOpinion(order._id)"
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

    <div v-if="activeSection === 'opinions'">
      <h2>Your Opinions</h2>
      <table class="table table-bordered">
        <thead>
        <tr>
          <th>Opinion ID</th>
          <th>Content</th>
          <th>Rating</th>
          <th>Order ID</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="opinion in opinions" :key="opinion._id">
          <td>{{ opinion.id }}</td>
          <td>{{ opinion.content }}</td>
          <td>{{ opinion.rating }}</td>
          <td>{{ opinion.orderId }}</td>
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
            <!-- Display Order Date -->
            <div class="mb-3">
              <label class="form-label">Order Date:</label>
              <p>{{ selectedOrderDate }}</p>
            </div>

            <!-- Rating -->
            <div class="mb-3">
              <label class="form-label">Rating:</label>
              <div>
            <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ 'text-warning': star <= rating, 'text-muted': star > rating }"
                @click="setRating(star)"
                style="cursor: pointer; font-size: 1.5em;"
            >
              ★
            </span>
              </div>
            </div>

            <!-- Opinion Text Area -->
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
