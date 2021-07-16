<template>
    <div>
        <input
            type="file"
            ref="file"
            style="display: none"
            accept="audio/mpeg3,.mp4"
            multiple="multiple"
            @change="onFileUpload"
        />
        <q-btn
            class="full-width"
            no-caps
            unelevated
            color="secondary"
            icon="upload"
            label="Upload sound"
            @click="$refs.file.click()"
        />
    </div>
</template>

<script>
export default {
    name: 'SoundUpload',
    components: {},
    methods: {
        async onFileUpload(event) {
            await this.$store.dispatch('app/uploadSoundFile', {
                files: event.target.files,
                cbSuccess: () => {
                    console.log('Files successfully uploaded')
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
