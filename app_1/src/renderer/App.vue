<template>
  <div id="app" class="container-fluid">
    <Transition mode="out-in" name="slide-up">
      <!-- <keep-alive> -->
      <amplify-authenticator>
        <div>
          <!--RouterView /!-->
          My App
          <amplify-sign-out></amplify-sign-out>
        </div>
      </amplify-authenticator>
      <!-- </keep-alive> -->
    </Transition>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Nipplio',
})
</script>

<style lang="scss"></style>
