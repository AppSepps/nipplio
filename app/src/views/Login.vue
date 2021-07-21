<template>
    <div>
        <button @click="onSignInClicked">Sign in externally</button>
    </div>
</template>

<script>
import firebase from 'firebase'
import router from '../router'
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
            const googleLink = `${window.location.origin}/desktop-sign-in?ot-auth-code=${id}`
            console.log(googleLink)
            try {
                window.ipcRenderer.send('openExternalBrowser', googleLink)
            } catch (error) {
                window.open(googleLink, '_blank')
                console.log(error)
            }
        },
    },
    mounted() {},
}
</script>

<style></style>
