<template>
    <q-dialog
        persistent
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
    >
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6">Settings</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section>
                <q-btn
                    no-caps
                    unelevated
                    color="negative"
                    label="Sign out"
                    @click="signOut"
                />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'Settings',
    components: {},
    methods: {
        signOut: function () {
            this.$store.dispatch('app/signOut')
            this.$router.push('/login')
        },
    },
}
</script>

<style></style>
