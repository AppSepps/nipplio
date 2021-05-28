<template>
  <CBox
        d="flex"
        w="100vw"
        h="100vh"
        flex-dir="column"
        justify-content="center"
        align-items="center">
        
        <div class="login-container">
  <c-heading mb="4">Welcome to Nipplio</c-heading>
    <c-form-control>
      <c-form-label for="username" >Username</c-form-label>
      <c-input type="text" id="username" />
      <c-form-label for="password" mt="4" >Password</c-form-label>
      <c-input type="password" id="password" />
      <c-button-group :spacing="4">
      <c-button variant-color="pink" variant="solid" mt="4" >
    Sign in
  </c-button>
  <c-button variant-color="gray" variant="solid" mt="4" >
    Sign up
  </c-button>
      </c-button-group>
    </c-form-control>
    </div>
  </CBox>
      
</template>

<script>
import {
  CBox,
  CFormControl,
  CFormLabel,
  CInput,
  CHeading,
  CButton,
  CButtonGroup
} from '@chakra-ui/vue';

  export default {
    name: 'login',
    components: { CButtonGroup, CButton, CHeading, CBox,  CInput, CFormControl, CFormLabel },
    methods: {
      /*open (link) {
        require('electron').shell.openExternal(link)
      }*/
    }
  }
</script>

<style>
.login-container {
  min-width: 520px;
}
</style>
