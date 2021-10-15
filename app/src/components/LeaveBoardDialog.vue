<template>
    <q-dialog>
        <q-card style="width: 450px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">Leave Board</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="q-p-none">
                Currently not implemented. To leave a board, please contact your
                board administrator.
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'LeaveBoardDialog',
    components: {},
    methods: {},
}
</script>

<style></style>
