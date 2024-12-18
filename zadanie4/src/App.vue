<script>
import ProductTable from './components/ProductTable.vue';

export default {
  components: {
    ProductTable,
    //CartView
  }
};
</script>

<template>
  <img alt="Logo" class="logo" src="@/assets/logo.png" width="125" height="125" />
  <div class="wrapper">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/cart">Cart</RouterLink>
    </nav>
  </div>
  <RouterView />
</template>
