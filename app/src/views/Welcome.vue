<template>
    <div>
        <q-page class="flex flex-center">
            <div>
                <img class="center" src="assets/logo_text.svg" alt="logo" />
                <p class="text-body1">
                    Welcome to Nipplio. The best Software with the worst codebase ever written!
                </p>
                <div v-if="!isLoggedIn">
                    <q-btn
                        @click="onSignInClicked"
                        color="primary"
                        class="full-width"
                        label="Login"
                        icon="login"
                        push
                    >
                    </q-btn>
                </div>
                <div v-else>
                    <p class="text-body1">
                        You are now logged in. Welcome back! Select a board, create one or join an existing board.
                    </p>
                </div>
            </div>
        </q-page>
    </div>
</template>

<script>
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export default {
    name: 'Login',
    components: {},
    data() {
        return {
            isLoggedIn: false
        }
    },
    methods: {
        async onSignInClicked() {
            try {
                const provider = new GoogleAuthProvider();
                provider.setCustomParameters({
                    prompt: "select_account"
                });
                await signInWithPopup(getAuth(), provider)
                this.isLoggedIn = true
            } catch (error) {
                console.error('Error during sign in:', error)
            }
        },
    },
    mounted() {
    },
}
</script>

<style></style>
