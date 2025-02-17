import { defineStore } from 'pinia'
import axios from 'axios'

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        deliveryInfo: {
            address: '',
            postalCode: '',
            city: '',
        }
    }),

    getters: {
        cartItems: (state) => state.items,
        totalPrice: (state) => {
            return state.items.reduce((total, item) => total + item.price, 0)
        }
    },

    actions: {
        addToCart(productId, quantity) {
            const existingItem = this.items.find(item => item.id === productId)
            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                this.items.push({ id: productId, quantity })
            }
        },

        removeFromCart(productId) {
            this.items = this.items.filter(item => item.id !== productId)
        },

        updateQuantity(productId, quantity) {
            const item = this.items.find(item => item.id === productId)
            if (item) {
                item.quantity = quantity
            }
        },

        clearCart() {
            this.items = []
        },

        async finalizeOrder(userId) {
            try {
                if (this.items.length === 0) {
                    alert('Your cart is empty!');
                    return false;
                }

                const response = await axios.post('http://localhost:3000/orders', {
                    statusId: 1,
                    userId: userId,
                    orderDate: new Date().toISOString(),
                    products: this.items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity
                    }))
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                })

                if (response.status === 200 || response.status === 201) {
                    console.log(response);
                    this.clearCart();
                    alert('Order finalized and cart cleared!');
                    return true;
                }

                if (response.status === 401) {
                    // logout
                    document.cookie = 'authToken=; Max-Age=0';
                    document.cookie = 'type=; Max-Age=0';
                    document.cookie = 'id=; Max-Age=0';
                    this.$router.push('/authentication');
                }

                return false;
            } catch (error) {
                console.error('Error finalizing order:', error)
                throw error
            }
        }
    },

    persist: {
        key: 'cart-store', // klucz pod którym dane będą zapisywane
        storage: localStorage, // miejsce zapisu
        paths: ['items', 'deliveryInfo'], // które pola mają być zapisywane
    }
})