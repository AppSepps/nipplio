<template>
    <div>
        <section id="firebaseui-auth-container"></section>
    </div>
</template>

<script>
import firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

export default {
    name: 'SignInDesktop',
    components: {},
    mounted() {
        this.ui =
            firebaseui.auth.AuthUI.getInstance() ||
            new firebaseui.auth.AuthUI(firebase.auth())
        const uiConfig = {
            signInSuccessUrl: '/',
            signInOptions: [
                {
                    provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    customParameters: {
                        // Forces account selection even when one account
                        // is available.
                        prompt: 'select_account',
                    },
                },
            ],
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // If a user signed in with email link, ?showPromo=1234 can be obtained from
                // window.location.href.
                // ...
                console.log(authResult)
                console.log(redirectUrl)
                return false
            },
        }
        this.ui.start('#firebaseui-auth-container', uiConfig)
    },
}
</script>

<style></style>
