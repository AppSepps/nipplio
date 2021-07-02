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
                <div class="row q-pb-md">
                    <q-list class="col-6">
                        <q-item-label header>Desktop App Settings</q-item-label>
                        <q-item clickable>
                            <q-item-section>
                                <q-item-label
                                    >Window toggle short cut</q-item-label
                                >
                                <q-item-label caption
                                    >Click to choose a new short cut for
                                    toggling the desktop app window on
                                    MacOS</q-item-label
                                >
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-weight-bolder"
                                    >CMD+P</q-item-label
                                >
                            </q-item-section>
                        </q-item>
                        <q-item clickable>
                            <q-item-section>
                                <q-item-label>Self mute short cut</q-item-label>
                                <q-item-label caption
                                    >Click to choose a new short cut for
                                    toggling the self mute on the MacOS desktop
                                    app</q-item-label
                                >
                            </q-item-section>
                            <q-item-section side>
                                <q-item-label class="text-weight-bolder"
                                    >CMD+Alt+O</q-item-label
                                >
                            </q-item-section>
                        </q-item>
                        <q-separator spaced />
                    </q-list>
                </div>
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
