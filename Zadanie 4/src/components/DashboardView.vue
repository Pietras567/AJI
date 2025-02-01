<script>
import ManagerPage from '@/components/ManagerDashboardView.vue';
import ClientPage from '@/components/ClientDashboardView.vue';

export default {
  components: { ManagerPage, ClientPage },
  name: "DashboardView",
  data() {
    return {
      accountType: this.getCookie("type"),
      userId: this.getCookie("id")
    }
  }, methods: {
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
    logout() {
      // Usunięcie tokenu
      document.cookie = 'authToken=; Max-Age=0';
      document.cookie = 'type=; Max-Age=0';
      document.cookie = 'id=; Max-Age=0';
      this.$router.push('/authentication');
    },
  }, mounted() {

  }
}
</script>

<template>
  <button @click="logout" style="float: right; margin-right: 5%">Log out</button>

  <div>
    <div v-if="accountType === 'MANAGER'">
      <ManagerPage />
    </div>
    <div v-else-if="accountType === 'CLIENT'">
      <ClientPage />
    </div>
    <div v-else>
      <p>You do not have access to this site.</p>
    </div>
  </div>
</template>

<style>

</style>