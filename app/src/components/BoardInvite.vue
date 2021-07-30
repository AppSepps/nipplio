<template>
    <div>
        <q-btn
            class="full-width"
            no-caps
            unelevated
            color="secondary"
            icon="person_add"
            label="Invite users"
            @click="onInviteClicked"
        />
    </div>
</template>

<script>
export default {
    name: 'BoardInvite',
    methods: {
        onInviteClicked: async function () {
            await this.$store.dispatch('board/inviteUser', {
                cb: (url) => {
                    this.$emit('openDialog')
                    this.bus.emit('onInviteUrlGenerate', url)
                },
            })
        },
    },
}
</script>

<style></style>
