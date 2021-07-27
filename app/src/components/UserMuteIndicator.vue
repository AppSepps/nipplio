<template>
    <div>
        <q-avatar
            color="dark"
            class="absolute"
            size="18px"
            style="bottom: -5px; right: -5px"
            ><q-badge :color="muted ? 'red' : 'primary'" rounded
        /></q-avatar>
    </div>
</template>

<script>
export default {
    name: 'UserMuteIndicator',
    props: ['muted'],
}
</script>

<style></style>
