<template>
    <div>
        <input
            type="file"
            ref="file"
            style="display: none"
            accept="audio/mpeg3,.mp4"
            @change="onFileUpload"
        />
        <q-btn
            class="full-width"
            no-caps
            unelevated
            color="secondary"
            @click="$refs.file.click()"
        >
            <q-icon left name="upload" />
            <div>Upload</div>
        </q-btn>
    </div>
</template>

<script>
export default {
    name: 'SoundUpload',
    components: {},
    methods: {
        async onFileUpload(event) {
            await this.$store.dispatch('app/uploadSoundFile', {
                file: event.target.files[0],
                cbSuccess: () => {
                    console.log('File successfully uploaded')
                },
                cbError: (error) => {
                    console.log(error)
                },
            })
        },
    },
}
</script>

<style></style>
