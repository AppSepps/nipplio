<template>
    <q-dialog>
        <q-card style="width: 450px; max-width: 80vw">
            <q-card-section class="row items-center">
                <div class="text-h6">Copy Invite Link</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>
            <q-card-section class="q-p-none">
                <q-input
                    readonly
                    dark
                    standout
                    dense
                    v-model="url"
                    label="Invite Link"
                    ref="inviteUrlInput"
                >
                    <template v-slot:after>
                        <q-btn
                            color="secondary"
                            icon="assignment"
                            @click="onCopyToClipboard"
                        />
                    </template>
                </q-input>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'AddBoardDialog',
    components: {},
    data() {
        return {
            url: undefined,
        }
    },
    mounted() {
        this.bus.on('onInviteUrlGenerate', (url) => {
            this.url = url
        })
    },
    methods: {
        onCopyToClipboard() {
            // console.log(this.$q)
            const input = this.$refs['inviteUrlInput']
            input.select()
            document.execCommand('copy')
            // this.$q.notify('Test') // TODO: Add notify plugin
        },
    },
}
</script>

<style></style>
