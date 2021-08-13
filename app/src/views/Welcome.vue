<template>
    <div>
        <q-page class="flex flex-center">
            <div class="">
                <img class="center" src="assets/icon.png" />
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
import firebase from 'firebase'
import router from '../router'
import { sendToIPCRenderer } from '../helpers/electron.helper'
import { v4 as uuidv4 } from 'uuid'
import 'firebaseui/dist/firebaseui.css'

export default {
    name: 'Login',
    components: {},
    methods: {
        onSignInClicked() {
            const id = uuidv4()
            console.log('onSignInClicked', id)
            const oneTimeCodeRef = firebase
                .database()
                .ref(`ot-auth-codes/${id}`)

            oneTimeCodeRef.on('value', async (snapshot) => {
                const authToken = snapshot.val()
                console.log('authToken', authToken)
                if (authToken) {
                    await firebase.auth().signInWithCustomToken(authToken)
                    await oneTimeCodeRef.remove()
                    router.push('/')
                }
            })
            const googleLink = `${window.location.origin}/auth?ot-auth-code=${id}`
            console.log(googleLink)

            sendToIPCRenderer('openExternalBrowser', googleLink, (error) => {
                window.open(googleLink, '_blank')
                console.log(error)
            })
        },
    },
    mounted() {},
}
</script>

<style></style>
