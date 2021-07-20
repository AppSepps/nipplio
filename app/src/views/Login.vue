<template>
    <div>
        <button @click="onSignInClicked">Sign in externally</button>
    </div>
</template>

<script>
import firebase from 'firebase'
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
                // Rest of implementation
            })
            const googleLink = `/desktop-sign-in?ot-auth-code=${id}`
            require('electron').shell.openExternal(googleLink)
            //window.open(googleLink, '_blank')
        },
    },
    mounted() {},
}
</script>

<style></style>
