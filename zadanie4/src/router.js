import ProductTable from "@/components/ProductTable.vue";
import CartView from "@/components/CartView.vue";
import Authentication from "@/components/AuthenticationView.vue";
import {createMemoryHistory, createRouter} from "vue-router";
import DashboardView from "@/components/DashboardView.vue";

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

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
    },
    {
        path: '/dashboard',
        name: 'DashboardView',
        beforeEnter: (to, from, next) => {
            const isLog = getCookie("id");
            if (isLog == null) {
                next('/authentication');
            } else {
                next();
            }
        },
        component: DashboardView,
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router