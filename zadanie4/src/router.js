import ProductTable from "@/components/ProductTable.vue";
import CartView from "@/components/CartView.vue";
import {createMemoryHistory, createRouter} from "vue-router";

const routes = [
    { path: '/', name: 'home', component: ProductTable },
    { path: '/cart', name: 'cart', component: CartView },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router