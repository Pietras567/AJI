<script>
import ProductTable from './components/ProductTable.vue';

export default {
  components: {
    ProductTable,
  }
};
</script>

<template>
  <div class="wrapper w-100 p-0">
    <header class="home-container w-100">
      <div class="container-fluid d-flex justify-content-between align-items-center px-0">
        <img alt="Logo" class="logo" src="@/assets/logo.png" style="height: 100%; max-height: 125px;" />
        <div class="text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
          <h1 class="mb-0">Najmanka</h1>
          <p class="text-muted">Discover amazing products at unbeatable prices</p>
        </div>
        <nav class="navbar navbar-expand-lg navbar-light">
          <div class="container-fluid">
            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                  <RouterLink class="nav-link" to="/">
                    <img src="@/assets/home.png" alt="Home" height="45"/>
                  </RouterLink>
                </li>
                <li class="nav-item">
                  <RouterLink class="nav-link" to="/cart">
                    <img src="@/assets/cart.png" alt="Cart" height="45"/>
                  </RouterLink>
                </li>
                <li class="nav-item">
                  <RouterLink class="nav-link" to="/authentication">
                    <img src="@/assets/login.png" alt="Log in" height="45"/>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  </div>

  <br />
  <RouterView />
  <br />

  <div class="features-container container my-5">
    <div class="row text-center">
      <div class="col-md-4">
        <img src="@/assets/quality.png" alt="Quality" width="100" height="100" class="mb-3" />
        <h5>Top Quality</h5>
        <p>We offer products of the highest quality to meet your needs.</p>
      </div>
      <div class="col-md-4">
        <img src="@/assets/delivery.png" alt="Delivery" width="173" height="100" class="mb-3" />
        <h5>Fast Delivery</h5>
        <p>Enjoy fast and reliable delivery for all your orders.</p>
      </div>
      <div class="col-md-4">
        <img src="@/assets/support.png" alt="Support" width="100" height="100" class="mb-3" />
        <h5>24/7 Support</h5>
        <p>Our team is available round the clock to assist you.</p>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f8f9fa;
}
.home-container {
  background: url('@/assets/home-background.jpg') no-repeat center center;
  background-size: cover;
  color: white;
  height: 125px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.home-container h1,
.home-container p {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}
.features-container img {
  border-radius: 50%;
}
</style>
