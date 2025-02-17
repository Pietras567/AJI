<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card shadow" style="width: 24rem;">
      <div class="card-header bg-primary text-white">
        <h5 class="card-title mb-0">{{ isRegister ? stateObj.register.name : stateObj.login.name }} Form</h5>
      </div>
      <div class="card-body">
        <form ref="form" @submit.prevent="isRegister ? register() : login()">
          <div class="mb-3">
            <label for="userName" class="form-label">Username</label>
            <input
                v-model="userName"
                type="text"
                class="form-control"
                id="userName"
                placeholder="Enter username"
                required
            />
          </div>
          <div class="mb-3" v-if="isRegister">
            <label for="email" class="form-label">Email</label>
            <input
                v-model="email"
                type="email"
                class="form-control"
                id="email"
                placeholder="Enter email"
                required
            />
            <div class="text-danger">{{ emailError }}</div>
          </div>
          <div class="mb-3 position-relative">
            <label for="password" class="form-label">Password</label>
            <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="password"
                placeholder="Enter password"
                required
            />
            <span
                class="position-absolute bottom-50 end-0 translate-middle-y me-3"
                style="cursor: pointer;"
                @click="togglePassword"
            >
              <i :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </span>
          </div>
          <div class="mb-3" v-if="isRegister">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="confirmPassword"
                placeholder="Confirm password"
                required
            />
          </div>
          <div class="mb-3" v-if="isRegister">
            <label for="phoneNumber" class="form-label">Phone Number</label>
            <input
                v-model="phoneNumber"
                type="tel"
                class="form-control"
                id="phoneNumber"
                placeholder="Enter phone number"
                required
            />
            <div class="text-danger">{{ phoneNumberError }}</div>
          </div>
          <div class="text-danger">{{ errorMessage }}</div>
          <button type="submit" class="btn btn-primary w-100 mt-3">
            {{ isRegister ? stateObj.register.name : stateObj.login.name }}
          </button>
          <div
              class="text-muted text-center mt-4"
              style="cursor: pointer;"
              @click="isRegister = !isRegister"
          >
            {{ toggleMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Authentication",
  data() {
    return {
      showPassword: false,
      phoneNumberError: "",
      email: "",
      emailError: "",
      userName: "",
      password: "",
      phoneNumber: "",
      confirmPassword: "",
      isRegister: false,
      errorMessage: "",
      stateObj: {
        register: {
          name: "Register",
          message: "Already have an account? Login."
        },
        login: {
          name: "Login",
          message: "Register"
        }
      }
    };
  },
  methods: {
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

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    async login() {
      const {userName} = this;


      let data = {'userName': this.userName, 'password': this.password};

      try {
        const response = await axios.post('http://localhost:3000/login', data,
            {withCredentials: true,
            });

        const type = response.data.accountType;
        const id = response.data.userId;

        this.setCookie("type", type, 1);
        this.setCookie("id", id, 1);

        console.log("Login successful");
        this.$router.push('/');
      } catch (error) {
        console.error("Login failed:", error.response?.data?.error || error.message);
        this.errorMessage = "Invalid userName or password"; // Display the error to the user
      }

    },
    async register() {
      if (!this.validatePhoneNumber(this.phoneNumber)) {
        this.phoneNumberError = "Invalid phone number format.";
        return;
      } else {
        this.phoneNumberError = "";
      }
      if (!this.validateEmail(this.email)) {
        this.emailError = "Invalid email address";
        return;
      } else {
        this.emailError = "";
      }
      if (this.password === this.confirmPassword) {
        this.errorMessage = "";

        let data = {
          'userName': this.userName,
          'password': this.password,
          'email': this.email,
          'phone': this.phoneNumber.replace(/\s+/g, '')
        };
        const response = await axios.post('http://localhost:3000/register', data);
        let userData = response.data;

        if (response.status !== 200) {
          this.errorMessage = userData.json();
          return;
        }

        this.isRegister = false;
        this.$refs.form.reset();
      } else {
        this.errorMessage = "Passwords do not match";
      }
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    validatePhoneNumber(phoneNumber) {
      const phoneRegex = /^(\d{3}\s?){3}$/;
      return phoneRegex.test(phoneNumber);
    }
  },
  computed: {
    toggleMessage() {
      return this.isRegister ? this.stateObj.register.message : this.stateObj.login.message;
    }
  },
  created() {
    axios.defaults.withCredentials = true;
  },




};
</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>
