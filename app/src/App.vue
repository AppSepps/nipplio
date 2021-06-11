<template>
    <amplify-authenticator>
        <div>
            <amplify-sign-out></amplify-sign-out>
            <router-view></router-view>
        </div>
    </amplify-authenticator>
</template>

<script>
export default {
    name: 'App',
    components: {},
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    background-color: #2c3e50;
    height: 100vh;
}
body {
    margin: 0;
    height: 100vh;
}
</style>
