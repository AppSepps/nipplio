<template>
    <div>
        <div v-if="showCloseButton">
            <p>You can now close this window</p>
        </div>
        <section id="firebaseui-auth-container"></section>
    </div>
</template>

<script>
import firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

export default {
    name: 'SignInDesktop',
    data() {
        return {
            showCloseButton: false,
        }
    },
    components: {},
    mounted() {
        var that = this
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
            callbacks: {
                signInSuccessWithAuthResult: function (
                    authResult,
                    redirectUrl
                ) {
                    // If a user signed in with email link, ?showPromo=1234 can be obtained from
                    // window.location.href.
                    // ...
                    console.log('Grabbed the user', authResult.user)
                    console.log(authResult)
                    console.log(redirectUrl)

                    if (!authResult.user) {
                        return true
                    }
                    that.callCreateAuthToken(authResult)

                    return false
                },
            },
        }
        this.ui.start('#firebaseui-auth-container', uiConfig)
    },
    methods: {
        closeWindow: () => {
            window.close()
        },
        callCreateAuthToken: async function (authResult) {
            const params = new URLSearchParams(window.location.search)

            const token = await authResult.user.getIdToken()
            console.log('token', token)
            const code = params.get('ot-auth-code')
            console.log('code', code)

            var addUserByInvite = firebase
                .functions()
                .httpsCallable('createAuthToken')
            const result = await addUserByInvite({
                'ot-auth-code': code,
                'id-token': token,
            })
            console.log('result', result)
            this.showCloseButton = true
            window.close()
        },
    },
}
</script>

<style></style>
