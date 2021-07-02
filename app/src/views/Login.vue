<template>
    <section id="firebaseui-auth-container"></section>
</template>

<script>
import firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

export default {
    name: 'Login',
    components: {},
    mounted() {
        this.ui =
            firebaseui.auth.AuthUI.getInstance() ||
            new firebaseui.auth.AuthUI(firebase.auth())
        const uiConfig = {
            signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
        }
        this.ui.start('#firebaseui-auth-container', uiConfig)
    },
}
</script>

<style></style>
