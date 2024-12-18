import ProductTable from "@/components/ProductTable.vue";
import CartView from "@/components/CartView.vue";
import Authentication from "@/components/AuthenticationView.vue";
import {createMemoryHistory, createRouter} from "vue-router";

const routes = [
    {
        path: '/',
        name: 'home',
        component: ProductTable,
        meta: { guest: true },
    },
    {
        path: '/cart',
        name: 'cart',
        component: CartView,
        meta: { guest: true },
    },
    {
        path: "/authentication",
        name: "Authentication",
        component: Authentication,
        meta: { guest: true },
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router