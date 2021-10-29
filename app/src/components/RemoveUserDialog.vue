<template>
    <q-dialog persistent position="top">
        <q-card>
            <q-card-section class="row items-center">
                <div class="text-h6">Confirm user remove</div>
            </q-card-section>
            <q-card-section class="row items-center">
                Are you sure, you want to remove this user from the board?
            </q-card-section>
            <q-card-actions align="right">
                <q-btn
                    no-caps
                    flat
                    label="Cancel"
                    color="white"
                    v-close-popup
                />
                <q-btn
                    no-caps
                    label="Remove"
                    color="red"
                    v-close-popup
                    @click="onRemoveConfirm"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'RemoveUserDialog',
    data() {
        return {
            userId: undefined,
        }
    },
    mounted() {
        this.bus.on('onUserRemoveClick', (userId) => {
            this.userId = userId
        })
    },
    methods: {
        onRemoveConfirm() {
            // TODO:
        },
    },
}
</script>

<style></style>
