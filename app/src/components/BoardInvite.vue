<template>
    <div>
        <q-btn
            class="full-width"
            no-caps
            unelevated
            color="secondary"
            @click="onInviteClicked"
        >
            <q-icon left name="person_add" />
            <div>Invite Users</div>
        </q-btn>
    </div>
</template>

<script>
export default {
    name: 'BoardInvite',
    components: {},
    methods: {
        onInviteClicked: async function() {
            await this.$store.dispatch('app/inviteUser')
        },
    },
}
</script>

<style></style>
