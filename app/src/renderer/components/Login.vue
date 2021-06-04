<template>
  <CBox
    d="flex"
    w="100vw"
    h="100vh"
    flex-dir="column"
    justify-content="center"
    align-items="center"
  >
    <div class="login-container">
      <c-heading mb="4">Welcome to Nipplio</c-heading>
      <c-form-control>
        <c-form-label for="username">Username</c-form-label>
        <c-input v-model="username" type="text" id="username" />
        <c-form-label for="password" mt="4">Password</c-form-label>
        <c-input v-model="password" type="password" id="password" />
      </c-form-control>
      <c-button-group :spacing="4">
        <c-button
          @click="signInClicked"
          variant-color="pink"
          variant="solid"
          mt="4"
        >
          Sign in
        </c-button>
        <c-button
          @click="signUpClicked"
          variant-color="gray"
          variant="solid"
          mt="4"
        >
          Sign up
        </c-button>
      </c-button-group>
    </div>
  </CBox>
</template>

<script>
import { Auth } from 'aws-amplify'
import {
  CBox,
  CFormControl,
  CFormLabel,
  CInput,
  CHeading,
  CButton,
  CButtonGroup,
} from '@chakra-ui/vue'

export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: '',
    }
  },
  components: {
    CButtonGroup,
    CButton,
    CHeading,
    CBox,
    CInput,
    CFormControl,
    CFormLabel,
  },
  methods: {
    async signInClicked() {
      try {
        const user = await Auth.signIn(this.username, this.password)
      } catch (error) {
        console.log('error signing in', error)
      }
    },
    async signUpClicked() {
      console.log('signUpClicked')
      try {
        const { user } = await Auth.signUp({
          username: this.username,
          password: this.password,
          attributes: {},
        })
        console.log(user)
      } catch (error) {
        console.log('error signing up:', error)
      }
    },
    /*open (link) {
        require('electron').shell.openExternal(link)
      }*/
  },
}
</script>

<style>
.login-container {
  min-width: 520px;
}
</style>
