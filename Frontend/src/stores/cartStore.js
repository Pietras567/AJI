import { defineStore } from 'pinia'
import axios from 'axios'

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        deliveryInfo: {
            address: '',
            postalCode: '',
            city: '',
        },
        cartData: [],
        total: 0,
    }),

    getters: {
        cartItems: (state) => state.items,
        totalPrice: (state) => state.total,
        cartIsEmpty: (state) => state.items.length === 0,
        cartProducts: (state) => state.cartData
    },

    actions: {
        async fetchProduct(productId) {
            try {
                return (await axios.get(`http://localhost:3000/products/${productId}`));
            } catch (error) {
                console.error('Error fetching product:', error);
                throw error;
            }
        },

        async fetchProducts() {
            try {
                this.cartData = [];
                this.total = 0;

                for (const element of this.items) {
                    console.log("id: "  + element.id + ", quantity: " + element.quantity)
                    const response = await axios.get(`http://localhost:3000/products/${element.id}`);
                    //const response = useCartStore().fetchProduct(element.id);
                    this.cartData.push({id: element.id, quantity: element.quantity, product: response.data, price: response.data._price * element.quantity});
                }
                this.cartData.forEach((element) => this.total += element.price);
                console.log(this.cartData);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },

        async addToCart(productId, quantity) {
            const existingItem = this.items.find(item => item.id === productId)
            if (existingItem) {
                existingItem.quantity += quantity
                await this.updateCartDataItem(productId, existingItem.quantity);
            } else {
                this.items.push({ id: productId, quantity })
                await this.updateCartDataItem(productId, quantity);
            }
        },

        removeFromCart(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.cartData = this.cartData.filter(item => item.id !== productId);
            this.calculateTotal();
        },

        // Przeliczanie sumy
        calculateTotal() {
            this.total = this.cartData.reduce((sum, item) => sum + item.price, 0);
        },

        // Pomocnicza metoda do aktualizacji cartData dla pojedynczego produktu
        async updateCartDataItem(productId, quantity) {
            try {
                const response = await axios.get(`http://localhost:3000/products/${productId}`);
                const existingIndex = this.cartData.findIndex(item => item.id === productId);

                if (existingIndex !== -1) {
                    this.cartData[existingIndex] = {
                        id: productId,
                        quantity: quantity,
                        product: response.data,
                        price: response.data._price * quantity
                    };
                } else {
                    this.cartData.push({
                        id: productId,
                        quantity: quantity,
                        product: response.data,
                        price: response.data._price * quantity
                    });
                }
                this.calculateTotal();
                console.log("Updated cart data")
                console.log(this.cartData)
            } catch (error) {
                console.error('Error updating cart data:', error);
            }
        },

        async updateQuantity(productId, quantity) {
            const item = this.items.find(item => item.id === productId)
            if (item) {
                item.quantity = quantity
                await this.updateCartDataItem(productId, quantity);
            }
        },

        clearCart() {
            this.items = [];
            this.cartData = [];
            this.total = 0;
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