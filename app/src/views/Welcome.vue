<template>
    <div>
        <q-page class="flex flex-center">
            <div class="">
                <img class="center" src="assets/logo_text.svg" />
                <p class="text-body1">
                    Welcome to Nipplio. The best Software ever written!
                </p>
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
        </q-page>

        <button @click="onSignInClicked">Sign in externally</button>
    </div>
</template>

<script>
import router from '../router'
import { sendToIPCRenderer } from '@/helpers/electron.helper'
import { v4 as uuidv4 } from 'uuid'
import 'firebaseui/dist/firebaseui.css'
import {getDatabase, onValue, ref, remove} from "firebase/database";
import {getAuth, signInWithCustomToken} from "firebase/auth";

export default {
    name: 'Login',
    components: {},
    methods: {
        onSignInClicked() {
            const id = uuidv4()
            console.log('onSignInClicked', id)
            const oneTimeCodeRef = ref(getDatabase(), `ot-auth-codes/${id}`)

            onValue(oneTimeCodeRef,  async snapshot => {
                const authToken = snapshot.val()
                console.log('authToken', authToken)
                if (authToken) {
                    await signInWithCustomToken(getAuth(), authToken)
                    await remove(oneTimeCodeRef)
                    await this.$store.dispatch('board/getBoards')
                    router.push('/')
                }
            })
            const googleLink = `${window.location.origin}/auth?ot-auth-code=${id}`
            console.log(googleLink)

            sendToIPCRenderer('openExternalBrowser', googleLink, error => {
                window.open(googleLink, '_blank')
                console.log(error)
            })
        },
    },
    mounted() {},
}
</script>

<style></style>
